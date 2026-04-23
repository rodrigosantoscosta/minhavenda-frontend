# Next Steps & Pending Work

## High Priority

- [ ] **Create Module 4: The Smart Cart** — optimistic UI, debounced sync, mock fallback, how cart uses auth state
- [ ] **Assemble full course HTML** — run build.sh or manually combine _base.html, all modules, and _footer.html into a single index.html
- [ ] **Fix remaining TypeScript errors** — 828 errors remain in components, pages, and contexts (prop types, context usage, missing dependencies)
- [ ] **Wire `startPolling` token argument in `AuthContext.tsx`** — `notificationService.startPolling`
  now requires a second `token` argument. Update the call site in `AuthContext`:
  ```ts
  startPolling(addNotification, authService.getToken())
  ```
  Without this, the SSE connection will be rejected as unauthenticated (401).
- [ ] **Run full Playwright test suite** — verify all E2E tests pass with TypeScript codebase

## Medium Priority

- [ ] Extract error handling to `useFormError` hook — reusable across Login, Register, Checkout.
- [ ] Standardize API error response handling via `src/utils/errorHandler.js`.
- [ ] Review 401 interceptor in `api.js` to exclude password reset and email verification endpoints.
- [ ] Add "Mark all as read" button to NotificationBell dropdown.
- [ ] Show notification count on mobile menu (bell is desktop-only; add badge to mobile user info block).
- [ ] Add SSE connection status indicator — subtle "reconnecting…" state in NotificationBell when stream is down.

## Low Priority / Nice to Have

- [ ] Add unit tests for `useNotifications` hook (localStorage persistence, max-20 cap, markAsRead, sort order).
- [ ] Add unit tests for `notificationService.ts` — mock `fetch`, verify SSE parser handles partial
  chunks, blank lines, and unknown event names correctly.
- [ ] Add form validation hook `useFormValidation.js`.
- [ ] Lazy load pages with `React.lazy()` for bundle splitting.
- [ ] Add `React.memo` to pure presentational components.
- [ ] Improve accessibility — ARIA labels for bell button and dropdown items.
- [ ] Add clear-all-notifications option (expose `clearAll` from hook in the UI).

## Completed

- [x] Module 5: The Admin Empire — admin dashboard, DLQ, role-based access, two-tier architecture — done 2026-04-10
- [x] Module 3: Auth, Tokens, and Silent Refresh — dual-token JWT, silent refresh, Google OAuth, interceptor 401 handling — done 2026-04-10
- [x] Complete TypeScript migration of mock service files (factories.ts, mockProductService.ts) — done 2026-04-08
- [x] Complete TypeScript migration of entire codebase (84 files) — done 2026-04-07
- [x] DRE date selection: Inline native date inputs (no modals) — done 2026-04-07
- [x] DRE Custom Date Panel: Two separate modals for start/end date selection — done 2026-04-07
- [x] DRE Custom Date Panel UX flow improvement (step indicator, disabled dates, better guidance) — done 2026-04-07
- [x] Period selector UI/UX overhaul on DRE Module (preset pills, mobile-first, 44px targets, scale-on-press, shadow button) — done 2026-04-07
- [x] Replace polling with SSE in `notificationService.js` — `fetch` + `ReadableStream` with JWT auth,
  SSE parser, auto-reconnect, `AbortController` on logout — done 2026-03-07
- [x] `case 429` block in `api.js` + `api:rate-limited` CustomEvent (manual apply pending) — done 2026-03-07
- [x] `docs/CHANGES_EXPLAINED.md` — plain-language explanation of both changes — done 2026-03-07
- [x] In-app notification system for pedidos (bell icon, dropdown, localStorage persistence, unread badge, mark-as-read) — done 2026-03-07
- [x] Polling bridge for RabbitMQ async order events — done 2026-03-07
- [x] Cancel Order button on OrderDetail for PENDENTE/PAGO statuses — done 2026-03-07
- [x] Notification fired on checkout order creation — done 2026-03-07
- [x] AGENTS.md rule for LAST_CHANGES.md and NEXT_STEPS.md — done 2026-03-07
- [x] Login error display fix (sessionStorage pattern) — done previously
- [x] Form submission preventDefault fix — done previously
- [x] AuthContext token expiration monitoring — done previously
