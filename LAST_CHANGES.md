# Last Changes

## 2026-03-07 — SSE migration + 429 rate limit handling

### Files modified
- `src/services/notificationService.js` — **full rewrite**: replaced 30s `setInterval` polling
  with a persistent SSE connection via `fetch` + `ReadableStream` to `GET /api/pedidos/stream`.
  JWT is sent via `Authorization` header (native `EventSource` cannot do this). The SSE parser
  (`readSseStream`) handles chunked delivery, accumulates `event:`/`data:` fields, and fires
  `onEvent` on each blank-line block terminator. Auto-reconnects after 5s on any error;
  `AbortController` is used for clean shutdown on logout. Event map translates backend event
  names (`pedido.criado`, `pedido.pago`, `pedido.enviado`, `pedido.cancelado`) to typed
  notification objects. Public API (`startPolling`, `stopPolling`, `registerOrderStatus`)
  kept identical — `AuthContext` and `checkoutService` do not need changes, EXCEPT:
  `startPolling` now requires a second `token` argument.

- `src/services/api.js` — added `case 429` to the Axios response interceptor switch block.
  Reads the `Retry-After` header (defaults to 60s if absent), logs it, and dispatches a
  `CustomEvent('api:rate-limited', { detail: { seconds, url } })` on `window` — same pattern
  as the existing `auth:unauthorized` event. **Note:** this edit was blocked by a Serena
  language server issue (Node.js not in PATH); apply manually (see `docs/CHANGES_EXPLAINED.md`).

### Files created
- `docs/CHANGES_EXPLAINED.md` — plain-language explanation of both changes for learning,
  covering SSE vs polling, why `fetch` instead of `EventSource`, how the SSE parser works,
  reconnection strategy, HTTP 429, and the `CustomEvent` cross-boundary pattern.

### Manual actions required
1. In `AuthContext.jsx`, update the `startPolling` call to pass the token:
   ```js
   startPolling(addNotification, authService.getToken())
   ```
2. In `src/services/api.js`, add `case 429` block manually (exact code in `docs/CHANGES_EXPLAINED.md`).
3. Add `api:rate-limited` event listener to `Login.jsx` and `Register.jsx` for user-facing message.
