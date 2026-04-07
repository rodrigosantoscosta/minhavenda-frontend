# Last Changes

## 2026-04-07 — Day picker UI/UX redesign: step indicator + improved calendar CSS

### Files changed
- `src/pages/admin/AdminRelatoriosFinanceiros.jsx` — updated `CustomDatePanel`:
  - **Step indicator bar** — replaced old "De/Até" summary with a horizontal two-step progress indicator (início → fim) separated by a connector line
  - ✓ orange badge when a step is completed, pulsing "2" badge while selecting end, dimmed "2" badge when nothing selected yet
  - **Improved calendar grid** — tighter border-spacing (3px × 4px), larger day text (14px), ring-shadow (`0 0 0 3px`) on selected from-only day for visibility, denser range_middle pill (18% opacity), `cursor: pointer` on calendar container, `:active` scale feedback
  - **Removed** `disabled={false}` prop from DayPicker (unnecessary)

### Notes
Build passes: `npx vite build` ✓ (2512 modules). The step indicator gives clear visual feedback at every stage: "pick start date" → "pick end date" → "both dates set, hit Consultar". Applies ui-ux-pro-max skill recommendations (cursor-pointer, touch targets, active scale, proper focus states).

---

## 2026-04-07 — Replace native date inputs with react-day-picker inline calendar

### Files changed
- `package.json` / `pnpm-lock.yaml` — added `react-day-picker@9.14.0` dependency
- `src/pages/admin/AdminRelatoriosFinanceiros.jsx` — rewritten `CustomDatePanel`:
  - **Removed** two disconnected `<input type="date">` fields (native browser pickers were unreliable on Windows and broke with custom CSS).
  - **Added** `react-day-picker` (`<DayPicker mode="range">`) — an inline calendar rendered entirely inside the app.
  - **Range mode** — first click sets start date, second click sets end range; clicking before start swaps automatically.
  - **Range summary bar** — above the calendar shows `De: 07 abr` / `Até: 07 abr` with weekday names (`Segunda`, etc.) and a "Selecione o fim..." prompt while selecting the end date.
  - **Dark theme** — full custom CSS via `<style>` tag scoped to `.rdp-root` with accent colors from design tokens (`T.accent` #F97316, `T.accentBg`, `T.bg`).
  - **Selected range styling** — solid orange start/end with pill-shaped middle (`range_middle` with `T.accentBg`).
  - **Today indicator** — today's date has an orange border ring.
  - **Inline error** — red warning text when início > fim.
  - **Portuguese locale** — imported `ptBR` from `react-day-picker/locale` for month/day names.
  - **Consultar button** — moved below calendar, full-width, disabled until both dates are selected.
  - **Unused imports cleaned up** — removed `FiCalendarOpen`.

### Notes
Native `<input type="date">` was replaced because browser overlays don't respect custom styling and are inconsistent across browsers/OS. react-day-picker renders inside the React tree so full control over theme, behavior, and UX. Build passes: `npx vite build` ✓ (2512 modules). The previous design (two inputs with connector SVG) was discarded entirely — this is a clean rewrite.

---

### Files changed
- `src/pages/admin/AdminRelatoriosFinanceiros.jsx` — rewritten:
  - **Auto-query on preset tap** — selecting a preset (Hoje, 7 dias, Este mês, etc.) immediately fires the query; no extra click needed.
  - **Animated "Personalizado" panel** — the custom date inputs appear/disappear with a `cubic-bezier(0.2,0,0,1)` opacity + translateY transition (200ms, interruptible via CSS transitions, not keyframes).
  - **Results fade-in** — `<ResultsFadeIn>` wrapper on DRE and Despesas reports splits the enter animation from its container, fading up with a soft 6px `translateY`.
  - **Extracted `PresetPill` component** — clean, reusable `forwardRef` pill with `aria-pressed`, check icon, and blue hover.
  - **Concentric border radius** — card (`rounded-2xl`) > inputs (`rounded-lg`); consistent visual hierarchy.
  - **Tabular-nums on date inputs** — prevents layout shift when dates change.
  - **Hover on date inputs uses blue** (`hover:border-blue-400` per mobile-first guideline).
  - Date inputs use `T.bg` background (darker tone) instead of `T.surface` for better depth contrast.

### Notes
Applied the "make-interfaces-feel-better" skill: CSS transitions instead of keyframes for interruptible animations, specific `transition-property` values (never `transition: all`), `scale(0.96)` on press, 44px minimum touch targets, shadows on Consultar button. Build passes cleanly.

---

## 2026-04-07 — Period selector UI/UX overhaul on Relatorios Financeiros (DRE Module)

### Files changed
- `src/pages/admin/AdminRelatoriosFinanceiros.jsx` — rewritten: added period preset pills (Hoje, 7 dias, Este mês, 30 dias, Trimestre, Mês passado, Personalizado); mobile-first layout (pills scroll horizontally on mobile, expand on sm+); date range summary badge with calendar icon; custom date inputs only show when "Personalizado" is active; all interactive elements are ≥44px touch targets; `active:scale-[0.96]` on buttons; shadows on Consultar button; focus rings on date inputs; smooth transitions throughout

### Notes
Applied "make-interfaces-feel-better" skill principles: concentric border radius (preset chips use rounded-full, card uses rounded-2xl, inputs use rounded-lg), shadows over borders for the Consultar button, scale-on-press at 0.96, minimum 44px hit areas on all interactive elements, mobile-first grid collapse, specific transition properties (no `transition: all`). Build passes cleanly (`vite build` exit 0).

---

## 2026-03-19 — Playwright E2E setup: config, scripts, AGENTS rules

### Files changed
- `playwright.config.js` — rewritten: Chromium only, baseURL=http://localhost:5173, webServer auto-starts `pnpm dev`, HTML reporter, screenshot on failure, trace on retry
- `package.json` — modified: added `test:e2e`, `test:e2e:ui`, `test:e2e:debug`, `test:e2e:report` scripts
- `AGENTS.md` — modified: added Section 14 — Playwright E2E test rules and script reference

### Notes
The webServer block means `pnpm test:e2e` is self-contained — no need to start Vite first. Do not run `pnpm dev` before running tests or port 5173 will conflict (unless using `reuseExistingServer`, which is enabled on local but disabled on CI).

---

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
