# TMS Backend (GraphQL API)

Node.js + Express 5 + Apollo Server 5 GraphQL API for the Transportation Management System. Uses PostgreSQL with connection pooling and JWT-based auth with refresh tokens.

---

## Table of contents

- [Setup](#setup)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [API endpoints](#api-endpoints)
- [GraphQL overview](#graphql-overview)
- [Roles & authorization](#roles--authorization)
- [Performance & security](#performance--security)
- [Project structure](#project-structure)

---

## Setup

1. **PostgreSQL**: Create a database (e.g. `createdb tms_db`) or use a hosted URL (Neon, Supabase, etc.).
2. **Environment**: Copy `.env.example` to `.env` and set `DATABASE_URL`, `JWT_SECRET`, and `CORS_ORIGINS` (see [Environment variables](#environment-variables)).
3. **Install**:
   ```bash
   npm install
   ```
4. **Migrate**:
   ```bash
   npm run db:migrate
   ```
5. **Seed** (creates demo users and sample shipments):
   ```bash
   npm run db:seed
   ```
6. **Start**:
   ```bash
   npm run dev
   ```
   API: **http://localhost:4000/graphql**

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | No | `development` or `production`. Default: `development`. |
| `PORT` | No | Server port. Default: `4000`. |
| `DATABASE_URL` | Yes | PostgreSQL connection string, e.g. `postgresql://user:password@localhost:5432/tms_db`. |
| `JWT_SECRET` | Yes | Secret for signing JWTs. Use a strong value in production (e.g. `openssl rand -base64 32`). |
| `ACCESS_TOKEN_EXPIRES_IN` | No | Access token TTL. Default: `1h`. |
| `REFRESH_TOKEN_EXPIRES_IN` | No | Refresh token TTL. Default: `7d`. |
| `CORS_ORIGINS` | Yes | Comma-separated allowed origins, e.g. `http://localhost:5173,http://localhost:3000`. |

Never commit `.env`. Use `.env.example` as a template.

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Run server (production). |
| `npm run dev` | Run server with `--watch` for auto-restart. |
| `npm run db:migrate` | Run migrations (create/update tables). |
| `npm run db:seed` | Seed demo users and sample shipments. |
| `npm run db:setup` | Run `db:migrate` then `db:seed`. |

---

## API endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/graphql` | POST | GraphQL API. Use Apollo Sandbox at `http://localhost:4000/graphql` in dev. |
| `/health` | GET | Health check. Returns `{ status, timestamp, database }`. Use for load balancers and monitoring. |

---

## GraphQL overview

- **Queries**: `me`, `shipment(id)`, `shipments(filters, sortBy, sortOrder, limit, offset)`, `shipmentStats`.
- **Mutations**: `register`, `login`, `refreshToken`, `createShipment`, `updateShipment`.
- **Auth**: Send access token in header: `Authorization: Bearer <accessToken>`.
- **Pagination**: `shipments` returns `ShipmentConnection` with `items`, `total`, and `pageInfo` (max 100 items per page).

Full schema and examples: see [../docs/API.md](../docs/API.md).

---

## Roles & authorization

| Role | Permissions |
|------|-------------|
| **admin** | All queries; create and update shipments. |
| **employee** | List and view shipments only (no create/update). |

Role is set at registration (or via seed). Resolvers enforce role checks for `createShipment` and `updateShipment`.

---

## Performance & security

- **Database**: Connection pool in `config/database.js`; indexes on `shipments(shipper_name, carrier_name, status, created_at)`.
- **Pagination**: Queries use `limit`/`offset` with a max of 100 items per page.
- **Secrets**: All from env; never hardcode. Use a strong `JWT_SECRET` in production.
- **HTTP**: Helmet, CORS, rate limiting (e.g. 200 requests per 15 minutes per IP), JSON body parser.

---

## Project structure

```
backend/
├── config/           # database.js, env.js
├── graphql/          # typeDefs.js, resolvers.js, context.js
├── middleware/       # auth.js (JWT + optional user on req)
├── models/           # User.js, Shipment.js, RefreshToken.js
├── scripts/          # runMigrations.js, seed.js
├── utils/            # errorHandler.js, validation.js
├── server.js         # Express + Apollo entry
├── .env.example
└── README.md
```

Error handling is centralised in `utils/errorHandler.js`; Apollo `formatError` and Express error middleware use it.
