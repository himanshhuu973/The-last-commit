import { Pool } from 'pg';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS registrations (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  phone      TEXT,
  college    TEXT NOT NULL,
  year       INTEGER NOT NULL,
  track      TEXT NOT NULL,
  team_name  TEXT,
  experience TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now()
)`;

export const createPool = () => new Pool({ connectionString: process.env.DATABASE_URL });
export const initDb = (pool: Pool) => pool.query(SCHEMA);
