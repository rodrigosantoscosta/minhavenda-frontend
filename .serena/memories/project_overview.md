# minhavenda-frontend — Project Overview

## Stack
- **React 19** with **TypeScript** (strict mode) — migrated April 2026
- **Vite** as bundler and dev server (port 5173)
- **Tailwind CSS** for styling (mobile-first design)
- **pnpm** as package manager
- **Playwright** for E2E tests (Chromium only)

## Branch strategy
- `dev-nestjs` — main development branch, also the **deploy branch** (changes go live from here)
- `prd-nest` — exists but is NOT the deploy target; do not merge to prd-nest for deployments
- Commits should land on `dev-nestjs` and are deployed directly from there

## Architecture
- **Entry:** `src/main.tsx` renders `App` into `#root`
- **Routing:** `react-router-dom` with routes in `App.tsx`
- **State Management:** React Context (AuthContext, CartContext, NotificationContext)
- **HTTP Client:** axios with interceptors (Bearer token, 401 handling)
- **Logging:** pino (use `logger` from `utils/logger`, not `console.log`)

## Key directories
- `src/contexts/` — React context providers (CartContext, AuthContext, NotificationContext)
- `src/services/` — API service modules (all typed, with mock fallbacks)
- `src/pages/` — page components (customer-facing and admin)
- `src/components/` — shared/common components
- `src/types/` — shared TypeScript type definitions
- `src/mocks/` — mock services for development/testing (factories.ts, mockProductService.ts)
- `src/utils/` — utility functions (jwtHelper, imageHelper, logger, storageUtil)
- `src/hooks/` — custom React hooks (useAuthToken, useNotifications, useScrollOnPageChange)

## Backend Integration
- **Backend:** `minhavenda-nestjs` (NestJS 11, PostgreSQL, Docker)
- **API Proxy:** `/api` → `http://localhost:3000` in development (configured in vite.config.ts)
- **Auth:** JWT HS256 Bearer tokens (decoded to extract role/tipo)
- **SSE:** Server-Sent Events for real-time order notifications
- **Pagination:** Supports offset-based and cursor-based pagination

## TypeScript Migration
- **Status:** COMPLETE (April 8, 2026)
- All 86 source files converted to `.ts`/`.tsx`
- Strict mode enabled in tsconfig.json
- Zero implicit `any` types
- Mock services fully type-checked against backend DTOs

## Notes
- Backend is `minhavenda-nestjs`, runs on Docker in dev
- Frontend uses `dev-nestjs` branch name to signal it's paired with the NestJS backend
- E2E tests use Playwright with mocked API responses (no real backend calls in tests)
- Mobile-first UI/UX is mandatory (see AGENTS.md for details)
