# Last Changes

## 2026-03-19 — UI/UX overhaul: card sizing, button sizes, blue hover, mobile-first product cards

### Files changed
- `src/components/common/Button.jsx` — modified: reduced all size variants (sm/md/lg) — buttons were too large across the app
- `src/components/common/products/ProductCard.jsx` — modified: **mobile-first rewrite** — horizontal list layout on mobile (`flex`), vertical grid card on `sm:`+; removed black overlay (replaced with blue tint); reduced price size, padding, and font sizes throughout
- `src/components/product/ProductsGrid.jsx` — modified: grid gap reduced to `gap-3 sm:gap-5` for tighter mobile layout
- `src/components/product/ProductCardSkeleton.jsx` — modified: skeleton now mirrors the horizontal mobile / vertical desktop layout of ProductCard
- `src/components/common/OrderCard.jsx` — modified: card padding reduced (`p-4 md:p-6` → `p-3 md:p-4`); total price `text-2xl` → `text-lg`
- `src/components/home/FeaturedCategories.jsx` — modified: category button padding `p-6` → `p-3`; icon container `p-4` → `p-2.5`; icon size 24 → 18
- `src/components/search/SearchBar.jsx` — modified: input hover border changed to blue (`hover:border-blue-400`); `py-2.5` → `py-2`
- `src/components/search/SearchFilters.jsx` — modified: all inputs/select now have `hover:border-blue-400 transition-colors` (replaces browser-default dark border)
- `AGENTS.md` — modified: added **Section 12 — Mobile-First UI/UX** with mandatory rules, checklist, and breakpoint conventions

### Notes
Product cards now follow the Drogasil-style pattern on mobile: small fixed image on the left, content on the right, compact button. Stars are hidden on mobile to save space. Favourite button and hover overlay are desktop-only. All changes are mobile-first (base → sm: → lg:).

---

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
