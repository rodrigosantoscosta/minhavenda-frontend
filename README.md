# MinhaVenda — Frontend

E-commerce frontend for MinhaVenda, a Brazilian online store. Built with React + Vite.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 7 |
| Styling | Tailwind CSS 3 |
| Routing | React Router DOM 7 |
| HTTP client | Axios |
| Icons | react-icons (Feather) |
| Logging | Pino |
| Forms | react-hook-form |
| Package manager | pnpm |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Backend running at `http://localhost:8080` (see [minhavenda-backend](../minhavenda-backend))

### Install dependencies

```bash
pnpm install
```

### Environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.development
```

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend base URL (optional — defaults to `/api` proxy) | `http://localhost:8080/api` |

> The dev server proxies `/api` → `http://localhost:8080` automatically via `vite.config.js`,
> so you typically do not need to set `VITE_API_URL` in development.

### Run the dev server

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173).

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
│   ├── Home.jsx
│   ├── Products.jsx / ProductDetail.jsx
│   ├── Cart.jsx
│   ├── Checkout.jsx
│   ├── Orders.jsx / OrderDetail.jsx
│   ├── Login.jsx / Register.jsx
│   └── Profile.jsx
├── services/           # API service layer
│   ├── api.js                 # Axios instance + interceptors
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

- Product catalogue with search and category filters
- Shopping cart with persistent state
- Checkout with address form and payment method selection
- Order tracking with status history
- In-app notifications for order events (new order, status change, cancellation)
  - Polling bridge for RabbitMQ backend events (ready to swap to WebSocket/SSE)
- JWT authentication with automatic expiration monitoring
- Fully responsive — mobile menu + desktop navbar

---

## Backend Integration

The backend exposes a REST API at `http://localhost:8080/api`. Key endpoints used:

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Login |
| POST | `/auth/register` | Register |
| GET | `/meus-pedidos` | List user orders |
| GET | `/pedidos/{id}` | Order detail |
| POST | `/checkout/finalizar` | Create order |
| POST | `/pedidos/{id}/pagar` | Simulate payment |
| POST | `/pedidos/{id}/cancelar` | Cancel order |

> The backend uses **RabbitMQ** for async order event processing. The frontend
> currently bridges this with polling (`notificationService.js`). See
> `NEXT_STEPS.md` for the WebSocket upgrade path.

---

## Agent & Contributor Guidelines

- See [`AGENTS.md`](./AGENTS.md) for rules all developers and AI agents must follow.
- See [`NEXT_STEPS.md`](./NEXT_STEPS.md) for pending work and known issues.
- See [`LAST_CHANGES.md`](./LAST_CHANGES.md) for a session-by-session changelog.

---

## Deployment

Deployed via Vercel. The `vercel-build` script runs `vite build`.

Set the following environment variable in the Vercel project dashboard:

| Variable | Value |
|---|---|
| `VITE_API_URL` | Your production backend URL |
