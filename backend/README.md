# TMS Backend (GraphQL API)

## Setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL`, `JWT_SECRET`, etc.
2. Create PostgreSQL DB: `createdb tms_db` (or use your URL).
3. Install: `npm install`
4. Migrate: `npm run db:migrate`
5. Seed: `npm run db:seed` (creates admin@tms.com / admin123, employee@tms.com / employee123)
6. Start: `npm run dev` (or `npm start`)

## Performance

- **DB**: Connection pool (`config/database.js`), indexes on `shipments(shipper_name, carrier_name, status, created_at)`.
- **Pagination**: Queries use `limit`/`offset` with a max of 100 items per page.
- **Secrets**: All secrets from env; never hardcode. Use strong `JWT_SECRET` in production.

## Roles

- **admin**: Can create/update shipments and run all queries.
- **employee**: Can only list and view shipments (no create/update).
