import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { newDb } from 'pg-mem';
import { createApp } from '../src/app';
import { initDb } from '../src/db';

const valid = { name: 'Asha Rao', email: 'asha@example.com', college: 'SRM', year: 2, track: 'Web' };
let app: ReturnType<typeof createApp>;
let token = '';

beforeAll(async () => {
  const { Pool } = newDb().adapters.createPg();
  const pool = new Pool();
  await initDb(pool);
  app = createApp(pool, { jwtSecret: 'test', adminUser: 'admin', adminPass: 'pass', corsOrigin: '*', limits: false });
  token = (await request(app).post('/api/admin/login').send({ username: 'admin', password: 'pass' })).body.token;
});
const auth = () => ({ Authorization: `Bearer ${token}` });

describe('registration', () => {
  it('creates a registration', async () => {
    const r = await request(app).post('/api/register').send(valid);
    expect(r.status).toBe(201);
  });
  it('rejects duplicate email (case-insensitive) with 409', async () => {
    const r = await request(app).post('/api/register').send({ ...valid, email: 'ASHA@example.com' });
    expect(r.status).toBe(409);
  });
  it('rejects invalid data with 400 and field details', async () => {
    const r = await request(app).post('/api/register').send({ ...valid, email: 'nope', year: 9, track: 'X' });
    expect(r.status).toBe(400);
    expect(r.body.details.length).toBeGreaterThanOrEqual(3);
  });
  it('rejects malformed JSON with 400', async () => {
    const r = await request(app).post('/api/register').set('Content-Type', 'application/json').send('{bad');
    expect(r.status).toBe(400);
  });
});

describe('admin', () => {
  it('blocks access without a token', async () => {
    expect((await request(app).get('/api/admin/stats')).status).toBe(401);
    expect((await request(app).get('/api/admin/registrations').set('Authorization', 'Bearer x')).status).toBe(401);
  });
  it('rejects wrong login', async () => {
    expect((await request(app).post('/api/admin/login').send({ username: 'admin', password: 'no' })).status).toBe(401);
  });
  it('lists and filters registrations', async () => {
    await request(app).post('/api/register').send({ ...valid, email: 'b@example.com', name: 'Ben', track: 'AI/ML', year: 3 });
    const all = await request(app).get('/api/admin/registrations').set(auth());
    expect(all.body.total).toBe(2);
    const f = await request(app).get('/api/admin/registrations?track=AI/ML&search=ben').set(auth());
    expect(f.body.total).toBe(1);
    expect(f.body.registrations[0].name).toBe('Ben');
  });
  it('returns analytics', async () => {
    const r = await request(app).get('/api/admin/stats').set(auth());
    expect(r.status).toBe(200);
    expect(r.body.total).toBe(2);
    expect(r.body.byTrack.length).toBe(2);
    expect(r.body.perDay.length).toBe(14);
    expect(r.body.today).toBe(2);
  });
  it('exports CSV and neutralises formulas', async () => {
    await request(app).post('/api/register').send({ ...valid, email: 'c@example.com', name: '=HYPERLINK("x")' });
    const r = await request(app).get('/api/admin/export.csv').set(auth());
    expect(r.status).toBe(200);
    expect(r.text).toContain("\"'=HYPERLINK");
  });
});
