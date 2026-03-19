# MinhaVenda — Frontend

Full-stack e-commerce storefront and admin dashboard for **MinhaVenda**, a Brazilian online store. Built with React + Vite, backed by the [`minhavenda-nestjs`](../minhavenda-nestjs) NestJS API.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS 3 |
| Routing | React Router DOM v6 |
| HTTP client | Axios |
| Charts | Recharts |
| Icons | react-icons (Feather) |
| Logging | Pino |
| Forms | react-hook-form |
| Package manager | pnpm |

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Backend running — see [minhavenda-nestjs](../minhavenda-nestjs)

### Install dependencies

```bash
pnpm install
```

### Environment variables

```bash
cp .env.example .env.development
```

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend base URL | `/api` |

> **Important:** Always set `VITE_API_URL=/api` (relative) in development so that Vite's proxy
> handles the forwarding to `http://localhost:3000`. Setting an absolute URL (e.g.
> `http://localhost:8080/api`) bypasses the proxy and will break API calls in dev.

### Run the dev server

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173).  
Admin dashboard: [http://localhost:5173/admin/dashboard](http://localhost:5173/admin/dashboard).

---

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start Vite dev server with HMR |
| `pnpm build` | Production build to `dist/` |
| `pnpm preview` | Serve production build locally |
| `pnpm lint` | Run ESLint |

---

## Project Structure

```
src/
├── assets/             # Static assets (images, SVGs)
├── components/
│   ├── admin/          # Admin-only components (AdminLayout sidebar)
│   ├── checkout/       # AddressForm, OrderSummary
│   ├── common/         # Shared UI — Button, Modal, Toast, Badge,
│   │                   #   NotificationBell, OrderCard, etc.
│   ├── home/           # Hero, FeaturedCategories
│   ├── layout/         # Header, Footer
│   ├── product/        # ProductCard, ImageGallery, CategoryFilter, etc.
│   └── search/         # SearchBar, SearchFilters, SortOptions
├── contexts/           # React Context providers
│   ├── AuthContext.jsx       # Authentication state + JWT monitoring
│   ├── CartContext.jsx        # Shopping cart state
│   └── NotificationContext.jsx # In-app order notifications
├── hooks/
│   ├── useAuthToken.js        # Token helpers
│   └── useNotifications.js    # Notification state + localStorage
├── pages/              # Route-level page components
│   ├── admin/                 # Admin dashboard pages (ADMIN role required)
│   │   ├── AdminDashboard.jsx        # KPI cards, charts, low-stock alerts
│   │   ├── AdminPedidos.jsx          # Order list with status filter tabs
│   │   ├── AdminPedidoDetail.jsx     # Order detail + status transition modals
│   │   ├── AdminProdutos.jsx         # Product list + create
│   │   ├── AdminEditProduto.jsx      # Edit product
│   │   ├── AdminEstoque.jsx          # Stock management
│   │   ├── AdminCategorias.jsx       # Category CRUD
│   │   └── AdminDLQ.jsx              # RabbitMQ Dead Letter Queue manager
│   ├── Home.jsx
│   ├── Products.jsx / ProductDetail.jsx
│   ├── Cart.jsx
│   ├── Checkout.jsx
│   ├── Orders.jsx / OrderDetail.jsx
│   ├── Login.jsx / Register.jsx
│   └── Profile.jsx
├── services/           # API service layer
│   ├── api.js                 # Axios instance + interceptors
│   ├── adminService.js        # All admin API calls
│   ├── authService.js
│   ├── cartService.js
│   ├── checkoutService.js
│   ├── notificationService.js # Polling bridge for RabbitMQ events
│   ├── orderService.js
│   ├── productService.js
│   └── searchService.js
└── utils/              # Helpers
    ├── imageHelper.js
    ├── jwtHelper.js
    ├── logger.js              # Pino logger wrapper
    └── storageUtil.js         # Safe localStorage wrapper
```

---

## Key Features

### Customer Storefront
- Product catalogue with search and category filters
- Shopping cart with persistent state
- Checkout with address form and payment method selection (PIX, CARTAO, BOLETO)
- Order tracking with status history
- In-app notifications for order events (new order, status change, cancellation)
  — polling bridge for RabbitMQ backend events, ready to swap to WebSocket/SSE
- JWT authentication with automatic expiration monitoring
- Fully responsive — mobile menu + desktop navbar

### Admin Dashboard (`/admin/*` — ADMIN role required)
- **Dashboard** — KPI cards and charts (graceful degradation if backend endpoint is unavailable)
- **Pedidos** — Full order management with status filter tabs and transition modals
  (Pagar → Enviar → Entregar / Cancelar)
- **Produtos** — Product list, create, and edit with category assignment
- **Estoque** — Per-product stock view with add / remove / adjust controls
- **Categorias** — Category CRUD with active/inactive toggle
- **DLQ** — RabbitMQ Dead Letter Queue viewer and requeue tool
- Dark theme: `#0A0B0E` background, `#F97316` orange accent, Syne + DM Sans + JetBrains Mono fonts

---

## Authentication & Roles

- JWT is stored in `localStorage` under the key `token`
- `AdminRoute` in `src/components/common/ProtectedRoute.jsx` guards all `/admin/*` routes —
  requires `user.role === 'ADMIN'`
- On login, `authService.js` decodes the JWT payload to extract the `tipo` claim
  (`'ADMIN'` or `'CLIENTE'`) and maps it to `role` on the user object
- 401 responses auto-redirect to `/login`
- Default admin credentials (seeded by NestJS migration): `admin@loja.com` / `changeme`

---

## Backend Integration

The NestJS backend exposes a REST API. The dev server proxies `/api` → `http://localhost:3000`
via `vite.config.js`, so all fetch calls use the relative path `/api/...`.

### Customer endpoints used

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login — returns `{ token, email, nome }` |
| POST | `/api/auth/register` | Register |
| GET | `/api/meus-pedidos` | List user orders |
| GET | `/api/pedidos/:id` | Order detail |
| POST | `/api/checkout/finalizar` | Create order |
| POST | `/api/pedidos/:id/pagar` | Simulate payment |
| POST | `/api/pedidos/:id/cancelar` | Cancel order |

### Admin endpoints used

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/pedidos` | All orders |
| GET | `/api/admin/pedidos/status/:status` | Orders by status |
| GET | `/api/admin/pedidos/:id` | Order detail (full) |
| POST | `/api/admin/pedidos/:id/pagar` | Mark as paid |
| POST | `/api/admin/pedidos/:id/enviar` | Mark as shipped |
| POST | `/api/admin/pedidos/:id/entregar` | Mark as delivered |
| POST | `/api/admin/pedidos/:id/cancelar` | Cancel order |
| GET/POST/PUT/DELETE | `/api/produtos` | Product CRUD |
| GET/POST/PUT/DELETE | `/api/categorias` | Category CRUD |
| GET/POST/PUT | `/api/estoque/produto/:id` | Stock management |
| GET/POST | `/api/admin/dlq/...` | DLQ management |

---

## Agent & Contributor Guidelines

- See [`AGENTS.md`](./AGENTS.md) for rules all developers and AI agents must follow.
- See [`NEXT_STEPS.md`](./NEXT_STEPS.md) for pending work and known issues.
- See [`LAST_CHANGES.md`](./LAST_CHANGES.md) for a session-by-session changelog.
- See [`docs/CHANGES_EXPLAINED.md`](./docs/CHANGES_EXPLAINED.md) for detailed explanations of key architectural decisions.

---

## Deployment

Set the following environment variable in your hosting dashboard:

| Variable | Value |
|---|---|
| `VITE_API_URL` | Your production backend URL (e.g. `https://api.minhavenda.com/api`) |

For Railway, Render, or Vercel — point `VITE_API_URL` to the deployed NestJS service URL.
