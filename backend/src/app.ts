import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import type { Pool } from 'pg';

export const TRACKS = ['AI/ML', 'Web', 'App', 'Open Innovation'] as const;

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(100),
  email: z.string().trim().toLowerCase().email('Invalid email').max(200),
  phone: z.string().trim().regex(/^\+?[0-9]{10,13}$/, 'Invalid phone number').optional(),
  college: z.string().trim().min(2, 'College is required').max(150),
  year: z.number().int().min(1).max(4),
  track: z.enum(TRACKS, { message: `Track must be one of: ${TRACKS.join(', ')}` }),
  teamName: z.string().trim().max(80).optional(),
  experience: z.string().trim().max(500).optional(),
});

export interface AppConfig {
  jwtSecret: string;
  adminUser: string;
  adminPass: string;
  corsOrigin: string;
  limits?: boolean; // turn rate limits off in tests
}

// Compare secrets without leaking timing information
const safeEqual = (a: string, b: string) => {
  const h = (s: string) => crypto.createHash('sha256').update(s).digest();
  return crypto.timingSafeEqual(h(a), h(b));
};

const csvCell = (v: unknown) => {
  let s = v == null ? '' : String(v);
  if (/^[=+\-@]/.test(s)) s = `'${s}`; // stop spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
};

export function createApp(pool: Pool, cfg: AppConfig) {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: cfg.corsOrigin }));
  app.use(express.json({ limit: '20kb' }));

  const limiter = (windowMs: number, limit: number) =>
    rateLimit({ windowMs, limit, skip: () => cfg.limits === false, message: { error: 'Too many requests, slow down' } });

  const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const [scheme, token] = (req.headers.authorization || '').split(' ');
    try {
      if (scheme !== 'Bearer' || !token) throw new Error();
      const p = jwt.verify(token, cfg.jwtSecret, { algorithms: ['HS256'] }) as jwt.JwtPayload;
      if (p.role !== 'admin') throw new Error();
      next();
    } catch {
      res.status(401).json({ error: 'Admin login required' });
    }
  };

  app.set('trust proxy', 1); // behind Render's proxy

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  // ---------- Public: registration ----------
  app.post('/api/register', limiter(60_000, 10), async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      const details = parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
      return res.status(400).json({ error: 'Validation failed', details });
    }
    const d = parsed.data;
    try {
      const r = await pool.query(
        `INSERT INTO registrations (name, email, phone, college, year, track, team_name, experience)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
        [d.name, d.email, d.phone ?? null, d.college, d.year, d.track, d.teamName ?? null, d.experience ?? null]
      );
      return res.status(201).json({ message: 'Registered! See you at The Last Commit.', id: r.rows[0].id });
    } catch (e: any) {
      // 23505 = unique_violation: the email is already registered (also safe under race conditions)
      if (e?.code === '23505' || /unique|duplicate/i.test(e?.message ?? '')) {
        return res.status(409).json({ error: 'This email is already registered' });
      }
      throw e;
    }
  });

  // ---------- Admin ----------
  app.post('/api/admin/login', limiter(15 * 60_000, 10), (req, res) => {
    const { username, password } = req.body ?? {};
    const ok = typeof username === 'string' && typeof password === 'string' &&
      safeEqual(username, cfg.adminUser) && safeEqual(password, cfg.adminPass);
    if (!ok) return res.status(401).json({ error: 'Invalid username or password' });
    const token = jwt.sign({ role: 'admin' }, cfg.jwtSecret, { algorithm: 'HS256', expiresIn: '8h' });
    res.json({ token });
  });

  app.get('/api/admin/registrations', requireAdmin, async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const where: string[] = [];
    const params: unknown[] = [];
    if (typeof req.query.track === 'string') { params.push(req.query.track); where.push(`track = $${params.length}`); }
    if (req.query.year) { params.push(Number(req.query.year)); where.push(`year = $${params.length}`); }
    if (typeof req.query.search === 'string' && req.query.search.trim()) {
      params.push(`%${req.query.search.trim().toLowerCase()}%`);
      const n = params.length;
      where.push(`(LOWER(name) LIKE $${n} OR LOWER(email) LIKE $${n} OR LOWER(college) LIKE $${n})`);
    }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const total = (await pool.query(`SELECT COUNT(*)::int AS n FROM registrations ${clause}`, params)).rows[0].n;
    const rows = (await pool.query(
      `SELECT id, name, email, phone, college, year, track, team_name AS "teamName", experience, created_at AS "createdAt"
       FROM registrations ${clause} ORDER BY id DESC LIMIT ${limit} OFFSET ${(page - 1) * limit}`, params)).rows;
    res.json({ total, page, limit, registrations: rows });
  });

  app.get('/api/admin/stats', requireAdmin, async (_req, res) => {
    const group = (col: string, lim = 10) =>
      pool.query(`SELECT ${col} AS label, COUNT(*)::int AS count FROM registrations GROUP BY ${col} ORDER BY count DESC LIMIT ${lim}`);
    const [byTrack, byYear, topColleges, dates, teams] = await Promise.all([
      group('track'), group('year'), group('college'),
      pool.query('SELECT created_at FROM registrations'),
      pool.query('SELECT COUNT(team_name)::int AS n FROM registrations'),
    ]);
    // Registrations per day for the last 14 days (UTC)
    const perDayMap = new Map<string, number>();
    for (let i = 13; i >= 0; i--) perDayMap.set(new Date(Date.now() - i * 864e5).toISOString().slice(0, 10), 0);
    for (const r of dates.rows) {
      const k = new Date(r.created_at).toISOString().slice(0, 10);
      if (perDayMap.has(k)) perDayMap.set(k, perDayMap.get(k)! + 1);
    }
    const perDay = [...perDayMap].map(([date, count]) => ({ date, count }));
    res.json({
      total: dates.rows.length,
      today: perDay[perDay.length - 1].count,
      withTeamName: teams.rows[0].n,
      byTrack: byTrack.rows,
      byYear: byYear.rows,
      topColleges: topColleges.rows,
      perDay,
    });
  });

  app.get('/api/admin/export.csv', requireAdmin, async (_req, res) => {
    const { rows } = await pool.query('SELECT * FROM registrations ORDER BY id');
    const cols = ['id', 'name', 'email', 'phone', 'college', 'year', 'track', 'team_name', 'experience', 'created_at'];
    const csv = [cols.join(','), ...rows.map((r) => cols.map((c) => csvCell(r[c])).join(','))].join('\n');
    res.type('text/csv').attachment('registrations.csv').send(csv);
  });

  app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if ((err as any).type === 'entity.parse.failed') return res.status(400).json({ error: 'Malformed JSON' });
    console.error('Internal error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  });
  return app;
}
