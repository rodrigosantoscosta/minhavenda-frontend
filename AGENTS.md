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

## 11. Project Tracking Documents (MANDATORY)

After **every** agent session that makes code changes, the agent **must** update or
create the following two files at the project root. This is not optional — it is
required before the session is considered complete.

### `LAST_CHANGES.md`

**Purpose:** A running log of what was changed, added, or removed in each agent
session. Allows any developer or future agent to instantly understand what was
done last without reading the full git diff.

**Rules:**
- Always prepend a new entry at the top of the file (newest first).
- Each entry must include: date (YYYY-MM-DD), a one-line summary, and a bullet
  list of every file created, modified, or deleted.
- Never delete old entries — the file is a cumulative changelog.
- If the file does not exist yet, create it.

**Format:**
```markdown
## YYYY-MM-DD — <one-line summary of the session>

### Files changed
- `path/to/file.jsx` — created / modified / deleted: <why>
- `path/to/other.js` — created / modified / deleted: <why>

### Notes
<Any relevant context, decisions made, or caveats the next developer should know.>

---
```

### `NEXT_STEPS.md` (or `TODO.md` if it already exists)

**Purpose:** A living document of pending work, known issues, and recommended
improvements. Keeps the project roadmap visible to developers and future agents.

**Rules:**
- If `NEXT_STEPS.md` already exists, update it — do not create a duplicate `TODO.md`.
- If neither file exists, create `NEXT_STEPS.md`.
- After each session, add new items discovered during the work and mark completed
  items with `[x]` or remove them if fully resolved.
- Group items by priority: **High**, **Medium**, **Low**.
- Each item should be a single, actionable sentence.

**Format:**
```markdown
## High Priority
- [ ] <actionable task>

## Medium Priority
- [ ] <actionable task>

## Low Priority / Nice to Have
- [ ] <actionable task>

## Completed
- [x] <task> — done YYYY-MM-DD
```

### Summary rule for agents

> At the end of every session involving code changes:
> 1. Write or update `LAST_CHANGES.md` with what was done.
> 2. Write or update `NEXT_STEPS.md` (or `TODO.md`) with pending work.
> Skipping these steps is a guideline violation.

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

---

## 13. Git Push — Only on User Request (MANDATORY)

**Agents must NEVER run `git push` on their own initiative.**

The allowed git workflow for agents is:

1. `git add <files>` — stage changes
2. `git commit -m "..."` — commit locally
3. **STOP** — report what was committed and wait

The user will explicitly ask to push when they are ready (e.g. "push it", "commit and push"). Agents must not ask "shall I push?" either — just commit and stop.

**This rule applies to all branches**, including `dev-nestjs`, `master`, and any feature branches.

**Why:** The user controls when code reaches the remote. Agents only manage local commits.

---

Following these guidelines keeps the development loop fast and predictable. Actions
an agent can take (ask before doing):

---

## 12. Mobile-First UI/UX (MANDATORY)

All UI components and pages **must be designed mobile-first**. This means:

**Layout**
- Always start with the smallest screen (`grid-cols-1`, full-width stacking) and scale up using `sm:`, `md:`, `lg:` breakpoints.
- Never write desktop-only layout without a mobile fallback. A missing mobile breakpoint is a bug.
- Product cards on mobile must use a **horizontal list layout** (image left ~30%, content right) — not a tall vertical card. Switch to the vertical grid card at `sm:` and above.

**Tailwind breakpoint order**
```
base (mobile) → sm: (≥640px) → md: (≥768px) → lg: (≥1024px) → xl: (≥1280px)
```
Always write classes in this order. Never skip breakpoints without a documented reason.

**Touch targets**
- Minimum tap target size: `44×44px` (use `min-h-[44px] min-w-[44px]` or `p-3` on interactive elements).
- Avoid hover-only interactions on mobile; always provide a visible active/focus state.

**Typography & spacing**
- Reduce font sizes and padding on mobile — use `text-sm` / `text-xs` as base, scale up to `sm:text-base` etc.
- Avoid `text-2xl` or larger as a base size for data like prices in cards.

**Search & inputs**
- Hover effects on inputs must use `hover:border-blue-400` — never a black/dark border.
- Focus rings must use `focus:ring-blue-500 focus:border-blue-500`.

**Images in cards**
- On mobile, product image thumbnails should be fixed-width (`w-28`) and not use `aspect-square` (which makes them tall). Reserve `aspect-square` for `sm:` and above.

**Agent checklist before submitting UI changes**
- [ ] Does it look correct on a 390px-wide viewport (iPhone 14)?
- [ ] Are all buttons/links at least 44px tall on mobile?
- [ ] Are cards horizontal on mobile and vertical on `sm:`+?
- [ ] Are all hover effects blue (not black/gray-dark)?
- [ ] Is Tailwind class order mobile-first (`base sm: md: lg:`)?
