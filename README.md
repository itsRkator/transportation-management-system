# Transportation Management System (TMS)

Full-stack TMS with GraphQL API (Node.js, PostgreSQL) and React frontend.

## Quick start

### Backend

1. **PostgreSQL**: Create a database, e.g. `createdb tms_db`
2. **Env**: `cd backend` then copy `.env.example` to `.env` and set:
   - `DATABASE_URL=postgresql://user:password@localhost:5432/tms_db`
   - `JWT_SECRET=<strong-secret>`
   - `CORS_ORIGINS=http://localhost:5173`
3. **Install & setup**:
   ```bash
   cd backend && npm install && npm run db:migrate && npm run db:seed
   ```
4. **Run**: `npm run dev` → API at `http://localhost:4000/graphql`

**Demo users** (after seed):

- **Admin**: `admin@tms.com` / `admin123` (can create/update shipments)
- **Employee**: `employee@tms.com` / `employee123` (view only)

### Frontend

1. **Install**: `cd frontend && npm install`
2. **Run**: `npm run dev` → app at `http://localhost:5173`

Vite proxies `/graphql` to the backend (see `vite.config.js`).

## Features

- **Backend**: GraphQL API with queries (list/filter/pagination/sort, single shipment), mutations (add, update), JWT auth, role-based access (admin vs employee), PostgreSQL with indexes and connection pool.
- **Frontend**: Hamburger menu with one-level sub-menus, horizontal nav, shipments in **grid** (10 columns) and **tile** view, tile actions (edit, flag, delete), shipment detail modal with “Back to list”, login, protected routes, admin-only “New Shipment” and create modal.

## Error handling and fallbacks

- **Backend (centralised):** `backend/utils/errorHandler.js` – normalises and logs errors; Apollo `formatError` uses it for GraphQL; Express 404 fallback and `expressErrorHandler` for non-GraphQL routes; `unhandledRejection` / `uncaughtException` logged (or exit).
- **Frontend (centralised):** `frontend/src/utils/errorHandler.js` – `getErrorMessage`, `logError`, `reportError`; Apollo error link logs all GraphQL/network errors; root `ErrorBoundary` shows fallback UI with “Try again”; `ErrorDisplay` component for query/mutation errors (e.g. Shipments page).

## Project structure

- `backend/`: Express + Apollo Server, config, models (User, Shipment), GraphQL schema/resolvers, auth middleware, **utils/errorHandler.js**, migrations/seed scripts.
- `frontend/`: React, Apollo Client, React Router, **ErrorBoundary**, **ErrorDisplay**, **utils/errorHandler.js**, layout, Shipments (grid/tile/detail), Login, Dashboard, filters, pagination, sorting.

Secrets and env are documented in `backend/.env.example`; never commit `.env`.

## Deployment (for live URL submission)

**Backend** (e.g. Render, Railway, Fly.io):

- Set env: `DATABASE_URL` (e.g. Neon, Supabase, or hosted Postgres), `JWT_SECRET`, `CORS_ORIGINS` (your frontend origin).
- Run `npm run db:migrate` and `npm run db:seed` once.
- Start with `npm start` (or your platform’s start command).

**Frontend** (e.g. Vite, Netlify, Vercel):

- Set the API base URL: either proxy `/graphql` to your backend in the hosting config, or set `VITE_GRAPHQL_URL` and use it in `src/graphql/client.js` for `uri`.
- Build: `npm run build`; serve the `dist` folder or use the platform’s build + deploy.

**Submission:** Deploy both, then send the **live app URL** (where users can open the TMS UI) and the **Github repo link**. No access limitations on the app.
