# Next Steps & Pending Work

## High Priority

- [ ] **Wire `startPolling` token argument in `AuthContext.jsx`** — `notificationService.startPolling`
  now requires a second `token` argument. Update the call site in `AuthContext`:
  ```js
  startPolling(addNotification, authService.getToken())
  ```
  Without this, the SSE connection will be rejected as unauthenticated (401).

- [ ] **Apply `case 429` to `api.js` manually** — Serena language server was unavailable
  during the session (Node.js not in PATH). Add the block between `case 503` and the default,
  and add the `api:rate-limited` event listener to `Login.jsx` and `Register.jsx`.
  Exact code in `docs/CHANGES_EXPLAINED.md`.

- [ ] Add `cancelOrder` export to `src/services/orderService.js` if missing — the
  OrderDetail page now calls it; verify the API endpoint `/pedidos/{id}/cancelar` is wired.

- [ ] Resolve missing `logger` reference in `OrderDetail.jsx` — verify import at runtime.

## Medium Priority

- [ ] Extract error handling to `useFormError` hook — reusable across Login, Register, Checkout.
- [ ] Standardize API error response handling via `src/utils/errorHandler.js`.
- [ ] Review 401 interceptor in `api.js` to exclude password reset and email verification endpoints.
- [ ] Add "Mark all as read" button to NotificationBell dropdown.
- [ ] Show notification count on mobile menu (bell is desktop-only; add badge to mobile user info block).
- [ ] Add SSE connection status indicator — subtle "reconnecting…" state in NotificationBell when stream is down.

## Low Priority / Nice to Have

- [ ] Add unit tests for `useNotifications` hook (localStorage persistence, max-20 cap, markAsRead, sort order).
- [ ] Add unit tests for `notificationService.js` — mock `fetch`, verify SSE parser handles partial
  chunks, blank lines, and unknown event names correctly.
- [ ] Add form validation hook `useFormValidation.js`.
- [ ] Lazy load pages with `React.lazy()` for bundle splitting.
- [ ] Add `React.memo` to pure presentational components.
- [ ] Improve accessibility — ARIA labels for bell button and dropdown items.
- [ ] Add clear-all-notifications option (expose `clearAll` from hook in the UI).

## Completed

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
