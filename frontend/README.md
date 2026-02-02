# TMS Frontend

React 19 + Vite 7 app for the Transportation Management System. Uses Apollo Client for GraphQL, React Router for navigation, and MUI (Material UI) for components.

---

## Table of contents

- [Setup](#setup)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Features & pages](#features--pages)
- [Project structure](#project-structure)

---

## Setup

1. **Backend**: Ensure the TMS backend is running (see [../backend/README.md](../backend/README.md)). Default GraphQL URL in dev: `/graphql` (proxied to backend).
2. **Environment** (optional): Copy `.env.example` or `.env.sample` to `.env` if you need to override the GraphQL URI (e.g. for production).
3. **Install and run**:
   ```bash
   npm install
   npm run dev
   ```
   App: **http://localhost:5173**

---

## Environment variables

Only variables prefixed with `VITE_` are exposed to the client.

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_GRAPHQL_URI` | No | GraphQL API URL. Default: `/graphql` (Vite dev server proxies to backend). In production, set to your API URL, e.g. `https://api.example.com/graphql`. |

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server (proxies `/graphql` to backend). |
| `npm run build` | Production build; output in `dist/`. |
| `npm run preview` | Serve `dist/` locally for testing the build. |
| `npm run lint` | Run ESLint. |

---

## Features & pages

- **Auth**: Login, signup; JWT access + refresh tokens; protected routes via `ProtectedRoute`.
- **Layout**: Hamburger menu with one-level sub-menus; horizontal nav; `Layout` wraps authenticated pages.
- **Shipments**: Grid view (10 columns) and tile view; filters; pagination; sorting; tile actions (edit, flag, delete); shipment detail view with “Back to list”; admin-only “New Shipment” and create modal.
- **Reports**: Rates report and reports page.
- **Other**: Dashboard, Settings.
- **Error handling**: Root `ErrorBoundary`; `ErrorDisplay` for query/mutation errors; centralised helpers in `src/utils/errorHandler.js`.

---

## Project structure

```
frontend/
├── public/
├── src/
│   ├── components/     # Layout, Shipments (grid/tile/detail), modals, ErrorBoundary, etc.
│   ├── context/       # AuthContext
│   ├── graphql/       # client.js, operations.js
│   ├── pages/         # Dashboard, Shipments, Login, Signup, Reports, Settings
│   ├── utils/         # errorHandler.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js     # Proxy /graphql to backend in dev
├── .env.example
└── README.md
```

For the full GraphQL API reference, see [../docs/API.md](../docs/API.md).
