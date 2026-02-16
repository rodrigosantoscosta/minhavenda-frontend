## AGENTS Guidelines for This Repository

This repository is a Vite + React application. Agents working on this project should
follow the rules below so Hot Module Replacement (HMR) and the local dev workflow
remain fast and reliable.

**Project Quick Facts**
- **Entry:** `src/main.jsx` renders `App` into `#root`.
- **Bundler / Dev server:** `vite` (`npm run dev`).
- **Framework:** React 19 with `@vitejs/plugin-react`.
- **Styling:** `tailwindcss` (configured in `tailwind.config.js`).
- **Routing:** `react-router-dom`.
- **HTTP client:** `axios`.
- **Logger:** `pino` (use for all logging, not console.log).
- **Build output:** `dist` (configured in `vite.config.js`).

**1. Use the Development Server, _not_ `npm run build` during agent sessions**
- Always use `npm run dev` while iterating. This starts Vite with HMR enabled.
- Do not run `npm run build` inside an interactive agent session — production builds
  change output assets and can break HMR and the development server state. Run
  production builds only outside the interactive agent workflow.

**2. Keep Dependencies in Sync**
- When adding/updating dependencies:
  - Update the lockfile (`package-lock.json`, `pnpm-lock.yaml`, or `yarn.lock`).
  - Restart the dev server so Vite and plugins pick up native bindings and module changes.

**3. Dev server & proxy (project-specific)**
- Default dev port: `5173` (see `vite.config.js`).
- Preview port: `4173`.
- API proxy: `/api` → `http://localhost:8080` in development. If your backend uses a
  different host/port, update `vite.config.js` `server.proxy` accordingly.

**4. Useful scripts (from `package.json`)**
- `npm run dev` — Start Vite dev server with HMR.
- `npm run build` — Build production bundles (do not run during agent sessions).
- `npm run preview` — Serve a production build locally for testing.
- `npm run lint` — Run ESLint checks.
- `npm run vercel-build` — Used by Vercel (runs `npm run build`).

**5. Important paths**
- `index.html` — Vite HTML entry.
- `src/main.jsx` — App bootstrap.
- `src/App.jsx` — Top-level app component.
- `src/pages/`, `src/components/` — App pages and UI components.
- `src/services/` — API wrappers and service functions.
- `src/contexts/` — React context providers (auth, cart).

**6. Linting & TS guidance**
- The repo is primarily JavaScript and includes some `@types/*` packages. If you
  introduce TypeScript, add a migration plan and update lint rules accordingly.

**7. When adding or upgrading dependencies**
- Run the package manager and update the lockfile.
- Restart the dev server after dependency changes.

**8. Vercel / Deployment notes**
- `vercel-build` runs the production build for deployment; this is fine for CI/CD.
- Avoid production builds during interactive agent work.

**9. Environment & secrets**
- This project relies on a development proxy for backend calls. There are no
  repository `.env` examples included — if you add environment variables, document
  them in `README.md` and never commit secrets.

**10. Quick PowerShell commands**
Start dev server (PowerShell):
```

npm install; npm run dev

```

Build & preview (outside agent sessions):
```

npm run build; npm run preview

```

---

## Authentication & Error Handling

**Form Submissions**
- Always use inline `e.preventDefault()` in form `onSubmit` handlers

**Auth State Management**
- `AuthContext` `loading` state changes can trigger component remounts
- `PublicRoute` and `ProtectedRoute` should only show loading spinners during initial auth check
- Never show spinners during active login/register operations (causes component remount)

**Error Display Pattern**
```javascript
// Save to sessionStorage before setting state
sessionStorage.setItem('loginError', errorMessage)
setServerError(errorMessage)

// Load from sessionStorage on mount
useEffect(() => {
  const savedError = sessionStorage.getItem('loginError')
  if (savedError) {
    setServerError(savedError)
    sessionStorage.removeItem('loginError')
  }
}, [])
```


## Code Style Rules

**General**

- Use `logger` from `../utils/logger` (pino) for all logging, not `console.log`
- No emojis in production code (comments, variable names, or strings shown to users)
- Emojis are acceptable only in debug/development logging that will be removed

**Components**

- Functional components with hooks
- Keep components under 300 lines; extract smaller components if needed
- Co-locate related state management
---

Following these guidelines keeps the development loop fast and predictable. Actions
an agent can take (ask before doing):