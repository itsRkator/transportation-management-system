# TMS Frontend

React + Vite app for the Transportation Management System.

## Environment variables

Create `.env` in the frontend folder (or copy from `.env.example` / `.env.sample`). Only variables prefixed with `VITE_` are exposed to the client.

| Variable | Description |
|----------|-------------|
| `VITE_GRAPHQL_URI` | Optional. GraphQL API URL. Default: `/graphql` (dev proxy to backend). In production you may set this to your API URL, e.g. `https://api.example.com/graphql`. |

Run: `npm run dev` (uses Vite proxy to backend in dev). Build: `npm run build`.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
