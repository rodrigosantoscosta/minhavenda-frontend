# minhavenda-frontend — Project Overview

## Purpose
Admin dashboard for **MinhaVenda**, a NestJS e-commerce REST API (NestJS 11, TypeORM, PostgreSQL, JWT, RabbitMQ).
All monetary values in BRL. Base URL: `http://localhost:3000/api`.

## Tech Stack
- React 18 + TypeScript + Vite
- Tailwind CSS 3
- React Router v6
- Recharts (charts)
- Axios (via `src/api.ts`)
- react-hot-toast
- pnpm as package manager

## API Config — CRITICAL
- `vite.config.js` proxies `/api` → `http://localhost:3000` ✅
- `src/services/api.js` baseURL = `import.meta.env.VITE_API_URL`
- **`.env` and `.env.development` must set `VITE_API_URL=/api`** (relative, not absolute)
- If set to `http://localhost:8080/api` the proxy is bypassed and calls go to the old Spring backend

## Route Structure
- `/login`
- `/admin/dashboard` — KPI cards, charts, low-stock alerts
- `/admin/pedidos` — Order list with status filter
- `/admin/pedidos/:id` — Order detail + status transitions
- `/admin/produtos` — Product list + create
- `/admin/produtos/:id` — Edit product
- `/admin/estoque` — Stock management
- `/admin/categorias` — Category CRUD
- `/admin/dlq` — RabbitMQ Dead Letter Queue manager

## Project Structure
- `src/api.ts` — Axios instance + all API call functions
- `src/AuthContext.tsx` — JWT auth context
- `src/types.ts` — TypeScript interfaces (PedidoDto, ProdutoDto, etc.)
- `src/utils.tsx` — formatBRL, formatDate, StatusBadge
- `src/components/Layout.tsx` — Sidebar nav
- `src/components/ProtectedRoute.tsx` — Auth guard
- `src/components/ui.tsx` — Modal, ConfirmModal, Spinner, Table, EmptyState
- `src/pages/` — One file per route

## Design
- Dark theme: bg `#0A0B0E`, surface `#111318`, border `#1E2028`, accent `#F97316` (orange)
- Fonts: Syne (display/headings) + DM Sans (body) + JetBrains Mono (data)

## Auth
- JWT stored in localStorage under key `jwt_token`
- 401 responses auto-redirect to `/login`

## Key Quirks
- Dashboard page gracefully degrades if `GET /api/admin/dashboard` is not yet implemented
- Estoque page lazy-loads stock per product via individual `GET /api/estoque/:produtoId` calls
- Old Spring frontend previously lived at this path — `.env` files may still reference port 8080
