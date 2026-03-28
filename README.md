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
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `/api` | Backend base URL. Keep as `/api` in dev — Vite proxies it to `localhost:3000`. |
| `VITE_USE_MOCK` | `false` | Force mock layer regardless of backend state |

> **Important:** Always keep `VITE_API_URL=/api` (relative) in development so Vite's proxy
> forwards requests to `http://localhost:3000`. An absolute URL bypasses the proxy and will
> break API calls in dev.

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
│   ├── product/        # ProductCard, ImageGallery, CategoryFilter, RelatedProducts
│   └── search/         # SearchBar, SearchFilters, SortOptions
├── contexts/           # React Context providers
│   ├── AuthContext.jsx         # JWT state, auto-expiry monitoring, Google OAuth exchange
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
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminPedidos.jsx
│   │   ├── AdminPedidoDetail.jsx
│   │   ├── AdminProdutos.jsx
│   │   ├── AdminEditProduto.jsx
│   │   ├── AdminEstoque.jsx
│   │   ├── AdminCategorias.jsx
│   │   └── AdminDLQ.jsx
│   ├── Home.jsx
│   ├── Login.jsx               # Email/password form + "Entrar com Google" button
│   ├── Register.jsx
│   ├── OAuthCallback.jsx       # Handles /auth/callback?code= redirect from backend
│   ├── Products.jsx / ProductDetail.jsx
│   ├── Cart.jsx
│   ├── Checkout.jsx
│   ├── Orders.jsx / OrderDetail.jsx
│   └── Profile.jsx
├── services/           # API service layer
│   ├── api.js                  # Axios instance + interceptors (silent token refresh)
│   ├── adminService.js
│   ├── authService.js          # login, register, googleExchange, refreshTokens, logout
│   ├── cartService.js
│   ├── checkoutService.js
│   ├── notificationService.js
│   ├── orderService.js
│   ├── productService.js       # withFallback() HOF — real → mock on error
│   └── searchService.js
└── utils/
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
- In-app notifications for order events
- JWT authentication with automatic expiry monitoring and silent token refresh
- **Google OAuth login** — one click, no password required
- Fully responsive — mobile drawer menu + desktop navbar

### Authentication

The frontend implements a full **dual-token auth flow** — short-lived access tokens (24h) paired with long-lived refresh tokens (7d). On any 401 from a protected endpoint, `api.js` automatically attempts a silent refresh before retrying the original request. Concurrent requests during a refresh are queued — only one refresh call is ever made at a time.

**Token storage** (`localStorage`):

| Key | Contents |
|---|---|
| `token` | JWT access token |
| `refreshToken` | JWT refresh token |
| `user` | Decoded user object `{ id, nome, email, role }` |
| `tokenExpiration` | Access token expiry timestamp (ms) |

**Google OAuth flow:**

```
User clicks "Entrar com Google"
      ↓
Browser navigates to VITE_API_URL/auth/google (full redirect — no axios call)
      ↓
Google consent screen
      ↓
Backend receives callback → resolves user → stores token pair under UUID code in Redis
      ↓
Backend redirects to /auth/callback?code=<uuid>
      ↓
OAuthCallback.jsx reads code → POST /auth/google/exchange → receives token pair
      ↓
Tokens saved to localStorage → navigate to home
```

On failure, `OAuthCallback` stores an error message in `sessionStorage` and redirects to `/login` where it is displayed automatically.

### Mock Fallback Layer
`src/services/productService.js` wraps every real API call in `withFallback(realFn, mockFn)`.
When the backend errors, the mock silently activates and returns stable Faker data (seed 42, pt_BR) with realistic 120–380 ms simulated latency. Set `VITE_USE_MOCK=true` to force mocks regardless of backend state — useful for offline demos.

### Admin Dashboard (`/admin/*` — ADMIN role required)
- **Dashboard** — KPI cards and low-stock alerts
- **Pedidos** — Order management with status filter, mobile card stack / desktop table, status transition modals
- **Produtos** — Product CRUD with search + category/status filters, image URL preview
- **Estoque** — Inventory Command Center with severity stat cards (Crítico / Baixo / OK), client-side filters, severity-first sort
- **Categorias** — Category CRUD with active/inactive toggle
- **DLQ** — RabbitMQ Dead Letter Queue viewer and requeue tool

### Admin Layout — Responsive
- Desktop (`lg+`): fixed left sidebar, 224 px wide
- Mobile (`< lg`): top bar (hamburger + `MV` logo + breadcrumb) + slide-in drawer with backdrop

---

## Authentication & Roles

| Credential | Role | Password |
|---|---|---|
| `admin@loja.com` | ADMIN | `senha123` |
| `joao.silva@email.com` | CLIENTE | `senha123` |

- `AdminRoute` in `src/components/common/ProtectedRoute.jsx` guards all `/admin/*` routes — requires `user.role === 'ADMIN'`
- Role is decoded from the JWT payload `role` claim (`ADMIN` / `CLIENTE`) at login time
- `/auth/callback` is a public route — no auth guard — required for the OAuth redirect to land

---

## Backend Integration

The NestJS backend runs on port `3000`. Vite proxies `/api → http://localhost:3000`.

### Auth endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Returns `{ accessToken, refreshToken, email, nome }` |
| POST | `/api/auth/register` | Same shape as login |
| GET | `/api/auth/google` | Initiates Google OAuth (full browser redirect) |
| POST | `/api/auth/google/exchange` | Swaps one-time `code` for `{ accessToken, refreshToken }` |
| POST | `/api/auth/refresh` | Rotates token pair — body: `{ refreshToken }` |
| POST | `/api/auth/logout` | Revokes refresh token — body: `{ refreshToken }` |

### Customer endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/produtos` | Product list (paginated) |
| GET | `/api/produtos/:id` | Product detail |
| GET | `/api/categorias` | Category list |
| GET | `/api/carrinho` | Fetch cart |
| POST | `/api/carrinho/itens` | Add item |
| PUT | `/api/carrinho/itens/:id` | Update item quantity |
| DELETE | `/api/carrinho/itens/:id` | Remove item |
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
| POST | `/api/admin/pedidos/:id/{pagar,enviar,entregar,cancelar}` | Status transitions |
| GET/POST/PUT/DELETE | `/api/produtos` | Product CRUD |
| GET/POST/PUT/DELETE | `/api/categorias` | Category CRUD |
| GET/POST/PUT | `/api/estoque/produto/:id/{adicionar,remover,ajustar}` | Stock management |
| GET/POST | `/api/admin/dlq/*` | DLQ viewer and requeue |

---

## Branch Strategy

| Branch | Purpose |
|---|---|
| `dev-nestjs` | Main development branch — **deploy target** |
| `prd-nest` | Exists but is NOT the deploy target |
| `dev-mockupdata` | Active feature development |

---

## Deployment

| Variable | Development | Production |
|---|---|---|
| `VITE_API_URL` | `/api` (relative — Vite proxy) | `https://api.minhavenda.com/api` |
| `VITE_USE_MOCK` | `false` | `false` |

Configured for Vercel (`vercel-build` script in `package.json`). For Railway or Render, set `VITE_API_URL` to the deployed NestJS service URL.

---

## Agent & Contributor Guidelines

- See [`AGENTS.md`](./AGENTS.md) for rules all developers and AI agents must follow.
- See [`NEXT_STEPS.md`](./NEXT_STEPS.md) for pending work and known issues.
- See [`LAST_CHANGES.md`](./LAST_CHANGES.md) for a session-by-session changelog.
- See [`docs/CHANGES_EXPLAINED.md`](./docs/CHANGES_EXPLAINED.md) for detailed explanations of key architectural decisions.
