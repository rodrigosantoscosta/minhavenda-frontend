# Suggested Commands — minhavenda-frontend (Windows)

## Development
```
pnpm dev              # Start Vite dev server with HMR (port 5173)
pnpm preview          # Serve production build locally (port 4173)
```

## Build & Production
```
pnpm build            # Build production bundle to dist/
pnpm vercel-build     # Used by Vercel (runs build)
```

## Testing
```
pnpm test:e2e         # Run Playwright E2E tests headlessly
pnpm test:e2e:ui      # Open Playwright UI mode (interactive)
pnpm test:e2e:debug   # Run in debug mode with Inspector
pnpm test:e2e:report  # Open last HTML report
```

## Linting & Type Checking
```
pnpm lint             # Run ESLint checks
npx tsc --noEmit      # Type-check without building
```

## Dependencies
```
pnpm install          # Install dependencies
pnpm add <package>    # Add dependency
pnpm add -D <package> # Add dev dependency
```

## Windows Utilities
- Use `dir` instead of `ls` on Windows CMD, or `ls` in Git Bash/PowerShell
- Project root: E:\code\minhavenda-frontend
- PowerShell: `npm install; npm run dev` to start dev server

## Important Notes
- **Do NOT run `pnpm build` during agent sessions** — it can break HMR
- Dev server auto-starts for E2E tests — do NOT run `pnpm dev` before `pnpm test:e2e`
- API proxy: `/api` → `http://localhost:3000` (update vite.config.ts if backend port changes)
