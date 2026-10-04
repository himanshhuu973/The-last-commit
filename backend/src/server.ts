import 'dotenv/config';
import { createApp } from './app';
import { createPool, initDb } from './db';

const need = (k: string) => {
  const v = process.env[k];
  if (!v) throw new Error(`Missing environment variable: ${k}`);
  return v;
};

async function main() {
  const pool = createPool();
  need('DATABASE_URL');
  await initDb(pool);
  const app = createApp(pool, {
    jwtSecret: need('JWT_SECRET'),
    adminUser: need('ADMIN_USERNAME'),
    adminPass: need('ADMIN_PASSWORD'),
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  });
  const port = Number(process.env.PORT) || 4000;
  app.listen(port, () => console.log(`API running on http://localhost:${port}`));
}
main().catch((e) => { console.error(e.message); process.exit(1); });
