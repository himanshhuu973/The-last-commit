# The Last Commit: Backend

Node.js + TypeScript + Express + PostgreSQL API for hackathon registrations and an organizer admin portal.

## Run locally
```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD
npm run dev            # http://localhost:4000
npm test               # 9 automated tests
```
The `registrations` table is created automatically on first start.

## Endpoints
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | none | Health check |
| POST | `/api/register` | none | Register a participant (400 invalid, 409 duplicate email) |
| POST | `/api/admin/login` | none | Admin login, returns a JWT (8h) |
| GET | `/api/admin/registrations` | admin | List with `search`, `track`, `year`, `page`, `limit` |
| GET | `/api/admin/stats` | admin | Totals, per-day trend, by track / year / college |
| GET | `/api/admin/export.csv` | admin | CSV export |

## Design notes
- Input validated with zod; emails are lower-cased so duplicates can't sneak in by changing case.
- Duplicate emails are caught from the database's unique constraint, which is safe even if two requests arrive together.
- Admin password is compared in constant time; login and registration are rate limited.
- CSV export neutralises spreadsheet formula injection.
