# minhavenda-frontend — Project Overview

## Stack
- React + Vite, Tailwind CSS
- pnpm

## Branch strategy
- `dev-nestjs` — main development branch, also the **deploy branch** (changes go live from here)
- `prd-nest` — exists but is NOT the deploy target; do not merge to prd-nest for deployments
- Commits should land on `dev-nestjs` and are deployed directly from there

## Key directories
- `src/contexts/` — React context providers (CartContext, AuthContext, etc.)
- `src/services/` — API service modules (cartService, searchService, etc.)
- `src/pages/` — page components
- `src/components/` — shared/common components

## Notes
- Backend is `minhavenda-nestjs`, runs on Docker in dev
- Frontend uses `dev-nestjs` branch name to signal it's paired with the NestJS backend
