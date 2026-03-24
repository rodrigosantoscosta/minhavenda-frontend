# MinhaVenda — Frontend

Full-stack e-commerce storefront and admin dashboard for **MinhaVenda**, a Brazilian online store. Built with React + Vite, backed by the [`minhavenda-nestjs`](../minhavenda-nestjs) NestJS API.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 7 |
| Styling | Tailwind CSS 3 |
| Routing | React Router DOM v7 |
| HTTP client | Axios |
| Charts | Recharts |
| Icons | react-icons v5 (Feather) |
| Logging | Pino |
| Forms | react-hook-form |
| Mock data | @faker-js/faker (pt_BR, seed 42) |
| E2E tests | Playwright |
| Package manager | pnpm 10 |

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

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `/api` | Backend base URL |
| `VITE_USE_MOCK` | `false` | Force mock layer regardless of backend state |

> **Important:** Always keep `VITE_API_URL=/api` (relative) in development so Vite's proxy
> forwards requests to `http://localhost:3000`. An absolute URL bypasses the proxy and breaks
> API calls in dev.

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
| `pnpm test:e2e` | Run Playwright E2E suite (headless) |
| `pnpm test:e2e:ui` | Run Playwright with interactive UI |
| `pnpm test:e2e:debug` | Run Playwright in debug mode |
| `pnpm test:e2e:report` | Open last Playwright HTML report |

---

## Project Structure

```
src/
├── assets/             # Static assets (images, SVGs)
├── components/
│   ├── admin/          # Admin-only components
│   │   └── AdminLayout.jsx   # Sidebar (desktop) + drawer (mobile) + top bar
│   ├── checkout/       # AddressForm, OrderSummary
│   ├── common/         # Shared UI — Button, Badge, Modal, Toast,
│   │                   #   Loading, EmptyState, NotificationBell,
│   │                   #   Pagination, StatusBadge, SuccessModal, OrderCard
│   ├── home/           # Hero, FeaturedCategories
│   ├── layout/         # Header (storefront), Footer
│   ├── product/        # ProductCard, ImageGallery, CategoryFilter,
│   │                   #   RelatedProducts
│   └── search/         # SearchBar, SearchFilters, SortOptions
├── contexts/           # React Context providers
│   ├── AuthContext.jsx         # JWT state + auto-expiry monitoring
│   ├── CartContext.jsx         # Cart state (optimistic UI + debounced sync)
│   └── NotificationContext.jsx # In-app order notifications
├── hooks/
│   ├── useAuthToken.js         # Token decode + expiry helpers
│   └── useNotifications.js    # Notification state + localStorage
├── mocks/              # Auto-fallback mock layer (active when backend is down)
│   ├── factories.js            # Faker factories — fixed seed 42, pt_BR locale
│   └── mockProductService.js  # Mirrors productService contract exactly
├── pages/              # Route-level page components
│   ├── admin/          # ADMIN role required for all routes under /admin/*
│   │   ├── AdminDashboard.jsx      # KPI cards + low-stock table
│   │   ├── AdminPedidos.jsx        # Order list — mobile cards / desktop table
│   │   ├── AdminPedidoDetail.jsx   # Order detail + status transition modals
│   │   ├── AdminProdutos.jsx       # Product CRUD — mobile cards / desktop table
│   │   ├── AdminEditProduto.jsx    # Edit product form
│   │   ├── AdminEstoque.jsx        # Inventory command center (see below)
│   │   ├── AdminCategorias.jsx     # Category CRUD
│   │   └── AdminDLQ.jsx            # RabbitMQ Dead Letter Queue viewer
│   ├── Home.jsx
│   ├── Products.jsx / ProductDetail.jsx
│   ├── Cart.jsx
│   ├── Checkout.jsx
│   ├── Orders.jsx / OrderDetail.jsx
│   ├── Login.jsx / Register.jsx
│   └── Profile.jsx
├── services/           # API service layer
│   ├── api.js                  # Axios instance + interceptors
│   ├── adminService.js         # All /admin/* API calls
│   ├── authService.js
│   ├── cartService.js
│   ├── checkoutService.js
│   ├── notificationService.js  # Polling bridge for RabbitMQ events
│   ├── orderService.js
│   ├── productService.js       # withFallback() HOF — real → mock on error
│   └── searchService.js
└── utils/              # Helpers
    ├── adminUtils.jsx          # Design tokens (T), shared admin UI atoms
    ├── imageHelper.js
    ├── jwtHelper.js
    ├── logger.js               # Pino logger wrapper
    └── storageUtil.js          # Safe localStorage wrapper
```

---

## Design System

### Storefront

| Token | Value | Usage |
|---|---|---|
| Primary | Teal (`#0d9488` family) | Buttons, links, active states |
| Font display | Sora | Headings, wordmark, KPI numbers |
| Font sans | DM Sans | Body, labels, UI text |
| `shadow-card` | Layered transparent shadows | Product cards, dropdowns |
| `ease-spring` | `cubic-bezier(0.2, 0, 0, 1)` | All interactive transitions |

### Admin Dashboard

| Token | Value | Usage |
|---|---|---|
| Background | `#0A0B0E` | Page background |
| Surface | `#0D0E12` | Sidebar, top bar |
| Card | `#111318` | Content cards |
| Accent | `#F97316` (orange) | Active nav, CTA buttons |
| Font display | Sora | Page titles, KPI numbers |
| Font sans | DM Sans | All other text |

---

## Key Features

### Customer Storefront
- Product catalogue with search, category, and sort filters
- Shopping cart with optimistic UI + debounced backend sync
- Checkout with address form and payment method selection (PIX, CARTAO, BOLETO)
- Order tracking with status history
- In-app notifications for order events polling RabbitMQ backend events
- JWT authentication with automatic expiration monitoring
- Fully responsive — mobile drawer menu + desktop navbar

### Mock Fallback Layer
`src/services/productService.js` wraps every real API call in a `withFallback(realFn, mockFn)`
HOF. When the backend returns an error, the mock silently activates and returns stable Faker data
(seed 42, pt_BR locale) with realistic 120–380 ms simulated latency. Set `VITE_USE_MOCK=true`
to force mocks regardless of backend state — useful for offline demos.

### Admin Dashboard (`/admin/*` — ADMIN role required)

- **Dashboard** — KPI cards and low-stock alerts; graceful degradation when backend is unavailable
- **Pedidos** — Order management with status filter, mobile card stack / desktop table, status
  transition modals (Pagar → Enviar → Entregar / Cancelar)
- **Produtos** — Product CRUD with search + category/status filters, mobile card grid / desktop
  table, image URL preview
- **Estoque — Inventory Command Center**
  - Summary bar: 3 clickable stat cards (Crítico ≤5 / Baixo 6–20 / OK >20) with live counts
    and a loading progress bar while the 30+ parallel stock calls resolve
  - Filter bar: client-side name search + category dropdown (no extra API calls)
  - Rows sorted by severity first (critical → low → ok), then alphabetically
  - Mobile card stack with full-width action buttons (Adicionar / Remover / Ajustar)
  - Desktop table with icon-only compact action buttons and severity + qty badges
- **Categorias** — Category CRUD with active/inactive toggle
- **DLQ** — RabbitMQ Dead Letter Queue viewer and requeue tool

### Admin Layout — Responsive
- Desktop (`lg+`): fixed left sidebar, 224 px wide
- Mobile (`< lg`): hidden sidebar replaced by a top bar (hamburger + `MV` logo + page breadcrumb)
  and a slide-in drawer with backdrop

---

## Authentication & Roles

- JWT stored in `localStorage` under `token`
- `AdminRoute` in `src/components/common/ProtectedRoute.jsx` guards all `/admin/*` routes —
  requires `user.role === 'ADMIN'`
- On login, the JWT payload `tipo` claim (`ADMIN` / `CLIENTE`) is extracted and mapped to `role`
- 401 responses anywhere in the app trigger auto-logout and redirect to `/login`
- Demo credentials (seeded by NestJS migration V4):

| Email | Role | Password |
|---|---|---|
| `admin@loja.com` | ADMIN | `senha123` |
| `joao.silva@email.com` | CLIENTE | `senha123` |

---

## Backend Integration

The NestJS backend runs on port `3000`. The Vite dev server proxies `/api` → `http://localhost:3000`
via `vite.config.js`, so all service calls use the relative path `/api/...`.

### Customer endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login — returns `{ token, email, nome }` |
| POST | `/api/auth/register` | Register |
| GET | `/api/produtos` | Product list (paginated) |
| GET | `/api/produtos/:id` | Product detail |
| GET | `/api/categorias` | Category list |
| GET | `/api/carrinho` | Fetch cart |
| POST | `/api/carrinho/itens` | Add item to cart |
| PUT | `/api/carrinho/itens/:id` | Update cart item quantity |
| DELETE | `/api/carrinho/itens/:id` | Remove cart item |
| POST | `/api/checkout/finalizar` | Create order |
| GET | `/api/meus-pedidos` | List user orders |
| GET | `/api/pedidos/:id` | Order detail |
| POST | `/api/pedidos/:id/pagar` | Simulate payment |
| POST | `/api/pedidos/:id/cancelar` | Cancel order |

### Admin endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/dashboard` | KPI stats |
| GET | `/api/admin/pedidos` | All orders |
| GET | `/api/admin/pedidos/:id` | Order detail (full) |
| POST | `/api/admin/pedidos/:id/pagar` | Mark as paid |
| POST | `/api/admin/pedidos/:id/enviar` | Mark as shipped |
| POST | `/api/admin/pedidos/:id/entregar` | Mark as delivered |
| POST | `/api/admin/pedidos/:id/cancelar` | Cancel |
| GET | `/api/produtos?ativo=true` | Product list (admin, unpaginated) |
| POST | `/api/produtos` | Create product |
| PUT | `/api/produtos/:id` | Update product |
| DELETE | `/api/produtos/:id` | Delete product |
| GET | `/api/categorias` | Category list |
| POST | `/api/categorias` | Create category |
| PUT | `/api/categorias/:id` | Update category |
| DELETE | `/api/categorias/:id` | Delete category |
| GET | `/api/estoque/produto/:id` | Stock for product |
| POST | `/api/estoque/produto/:id/adicionar` | Add stock |
| POST | `/api/estoque/produto/:id/remover` | Remove stock |
| PUT | `/api/estoque/produto/:id/ajustar` | Adjust stock to value |
| GET | `/api/admin/dlq/queues` | DLQ queue list |
| GET | `/api/admin/dlq/:queue/messages` | DLQ messages |
| POST | `/api/admin/dlq/:queue/requeue` | Requeue messages |

---

## Branch Strategy

| Branch | Purpose |
|---|---|
| `prd-nest` | Production — deployed to Vercel |
| `dev-nestjs` | Integration branch for NestJS-backed features |
| `dev-mockupdata` | Active development — all redesign work lands here |

`dev-mockupdata` is currently **12 commits ahead** of `prd-nest`. The pending merge brings:
the full UI redesign (brand identity, typography, design tokens), the Faker mock fallback layer,
admin responsive layout, the Estoque inventory redesign, cart optimistic UI, and several bug fixes.

---

## Agent & Contributor Guidelines

- See [`AGENTS.md`](./AGENTS.md) for rules all developers and AI agents must follow.
- See [`NEXT_STEPS.md`](./NEXT_STEPS.md) for pending work and known issues.
- See [`LAST_CHANGES.md`](./LAST_CHANGES.md) for a session-by-session changelog.
- See [`docs/CHANGES_EXPLAINED.md`](./docs/CHANGES_EXPLAINED.md) for detailed explanations of key architectural decisions.

---

## Deployment

| Variable | Development | Production |
|---|---|---|
| `VITE_API_URL` | `/api` (relative — uses Vite proxy) | `https://api.minhavenda.com/api` |
| `VITE_USE_MOCK` | `false` | `false` |

The project is configured for Vercel (`vercel-build` script in `package.json`).
For Railway or Render, point `VITE_API_URL` to the deployed NestJS service URL.
