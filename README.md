# Transportation Management System (TMS)

A full-stack Transportation Management System with a **GraphQL API** (Node.js, PostgreSQL) and a **React** frontend. Manage shipments, view reports, and control access with role-based authentication (admin and employee).

---

## Table of contents

- [Tech stack](#tech-stack)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Demo users](#demo-users)
- [Architecture](#architecture)
- [Error handling](#error-handling)
- [Project structure](#project-structure)
- [Deployment](#deployment)
- [Environment & secrets](#environment--secrets)

---

## Tech stack

| Layer   | Technologies |
|--------|--------------|
| **Backend** | Node.js, Express 5, Apollo Server 5, GraphQL, PostgreSQL (pg), JWT, bcrypt, Helmet, CORS, rate limiting |
| **Frontend** | React 19, Vite 7, Apollo Client, React Router 7, MUI (Material UI), CSS Modules |
| **Database** | PostgreSQL with connection pooling and indexes for shipments |

---

## Features

- **Backend**
  - GraphQL API: list shipments (filters, pagination, sort), single shipment, shipment stats
  - Mutations: register, login, refresh token, create shipment, update shipment
  - JWT auth with access + refresh tokens; role-based access (admin vs employee)
  - PostgreSQL with connection pool and indexes on `shipments(shipper_name, carrier_name, status, created_at)`
  - Health endpoint: `GET /health`
  - Centralised error handling and logging

- **Frontend**
  - Hamburger menu with one-level sub-menus; horizontal navigation
  - Shipments: **grid** (10 columns) and **tile** view; tile actions (edit, flag, delete)
  - Shipment detail view (modal/expanded) with “Back to list”
  - Login / signup; protected routes; admin-only “New Shipment” and create modal
  - Reports (e.g. rates); Dashboard; Settings
  - Centralised error handling: ErrorBoundary, ErrorDisplay, Apollo error link

---

## Prerequisites

- **Node.js** (v18+ recommended)
- **PostgreSQL** (local or hosted, e.g. Neon, Supabase)
- **npm** (or yarn/pnpm)

---

## Quick start

### 1. Backend

```bash
cd backend
```

1. **Create a PostgreSQL database** (if not using a hosted URL):

   ```bash
   createdb tms_db
   ```

2. **Environment**: Copy `.env.example` to `.env` and set:

   | Variable | Description |
   |----------|-------------|
   | `DATABASE_URL` | PostgreSQL connection string, e.g. `postgresql://user:password@localhost:5432/tms_db` |
   | `JWT_SECRET` | Strong secret for JWT signing (e.g. `openssl rand -base64 32`) |
   | `CORS_ORIGINS` | Allowed origins, e.g. `http://localhost:5173` |

3. **Install, migrate, seed**:

   ```bash
   npm install
   npm run db:migrate
   npm run db:seed
   ```

4. **Run**:

   ```bash
   npm run dev
   ```

   API: **http://localhost:4000/graphql** (Apollo Sandbox available at that URL).

### 2. Frontend

```bash
cd frontend
```

1. **Environment** (optional): Copy `.env.example` to `.env`. For local dev, the default `/graphql` is proxied to the backend via Vite.

2. **Install and run**:

   ```bash
   npm install
   npm run dev
   ```

   App: **http://localhost:5173**

Vite proxies `/graphql` to the backend in development (see `frontend/vite.config.js`).

---

## Demo users

After running `npm run db:seed` in the backend:

| Role     | Email             | Password    | Permissions                    |
|----------|-------------------|-------------|--------------------------------|
| **Admin**   | `admin@tms.com`    | `admin123`  | Create/update shipments, all queries |
| **Employee** | `employee@tms.com` | `employee123` | List and view shipments only   |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Frontend (React + Vite)                                         │
│  - Apollo Client → /graphql (proxied in dev to backend)          │
│  - React Router, AuthContext, protected routes                   │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTP/GraphQL
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend (Express + Apollo Server)                               │
│  - /graphql → GraphQL API                                        │
│  - /health → Health check                                        │
│  - JWT auth middleware, rate limit, Helmet, CORS                 │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  PostgreSQL                                                      │
│  - users, shipments, refresh_tokens                             │
│  - Indexes on shipments for filters and sorting                  │
└─────────────────────────────────────────────────────────────────┘
```

- **Auth**: Access token (short-lived) + refresh token (stored in DB). Send access token in `Authorization: Bearer <token>` for GraphQL requests.
- **Roles**: `admin` can create/update shipments; `employee` can only list and view.

---

## Error handling

- **Backend** (`backend/utils/errorHandler.js`): Normalises and logs errors; Apollo `formatError` for GraphQL; Express 404 fallback and `expressErrorHandler` for non-GraphQL routes; `unhandledRejection` / `uncaughtException` logged (or exit).
- **Frontend** (`frontend/src/utils/errorHandler.js`): `getErrorMessage`, `logError`, `reportError`; Apollo error link for GraphQL/network errors; root `ErrorBoundary` with “Try again”; `ErrorDisplay` for query/mutation errors (e.g. Shipments page).

---

## Project structure

```
├── backend/                 # GraphQL API
│   ├── config/              # database, env
│   ├── graphql/             # typeDefs, resolvers, context
│   ├── middleware/          # auth
│   ├── models/              # User, Shipment, RefreshToken
│   ├── scripts/             # runMigrations, seed
│   ├── utils/               # errorHandler, validation
│   ├── server.js
│   └── .env.example
├── frontend/                # React app
│   ├── src/
│   │   ├── components/      # Layout, Shipments, modals, ErrorBoundary, etc.
│   │   ├── context/        # AuthContext
│   │   ├── graphql/        # client, operations
│   │   ├── pages/          # Dashboard, Shipments, Login, Reports, Settings
│   │   └── utils/          # errorHandler
│   ├── vite.config.js
│   └── .env.example
├── docs/                    # API and other documentation
└── README.md
```

See [backend/README.md](backend/README.md) and [frontend/README.md](frontend/README.md) for per-package details. For GraphQL schema and examples, see [docs/API.md](docs/API.md).

---

## Deployment

**Backend** (e.g. Render, Railway, Fly.io):

- Set env: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS` (your frontend origin).
- Run `npm run db:migrate` and `npm run db:seed` once.
- Start with `npm start`.

**Frontend** (e.g. Vite, Netlify, Vercel):

- Set `VITE_GRAPHQL_URI` to your backend GraphQL URL (e.g. `https://api.example.com/graphql`) if not using a proxy.
- Build: `npm run build`; serve the `dist` folder.

**Submission:** Deploy both and share the **live app URL** and **GitHub repo link**.

---

## Environment & secrets

- Backend: all secrets from env; see `backend/.env.example`. **Never commit `.env`.**
- Frontend: only `VITE_*` variables are exposed to the client; see `frontend/.env.example`.
