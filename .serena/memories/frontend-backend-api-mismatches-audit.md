# Frontend-Backend API Mismatches Audit

## Audit Date
April 7, 2026

## Methodology
Compared every `api.get/post/put/delete` call in `src/services/` and `src/pages/` against the NestJS backend DTOs, controllers, and query handlers at `E:\code\minhavenda-nestjs\src/`.

---

## HIGH Severity — Must Fix

### 1. `sort: 'dataCriacao,desc'` → `sort: 'dataCadastro'` + `sortDir: 'DESC'`
- **File:** `src/pages/Home.tsx:77`
- **Frontend sends:** `sort=dataCriacao,desc`
- **Backend expects:** `sort=dataCadastro&sortDir=DESC`
- **Status:** ✅ **Fixed** — split into two params with correct field name.

### 2. `cartService.ts` reads wrong field names on Carrinho
- **File:** `src/services/cartService.ts:89,91`
- **Frontend reads:** `carrinho.quantidadeItens` and `carrinho.valorDesconto`
- **Backend returns:** `quantidadeTotal` (not `quantidadeItens`); `valorDesconto` doesn't exist on `CarrinhoDto`
- **Impact:** These fields will be `undefined` if `getResumo()` is ever called. Currently unused (CartContext reads data directly), but future code will break.
- **Fix:** Change to `carrinho.quantidadeTotal`; remove `valorDesconto` reference.

---

## LOW Severity — Cosmetic / Mock-only

### 3. Mock product sort uses wrong field name
- **File:** `src/mocks/mockProductService.ts:41`
- **Mock code:** `sort: 'dataCriacao,desc'`
- **Backend uses:** `dataCadastro`
- **Impact:** Mock falls through to string comparison — works but is semantically wrong. Fix if mock ever needs date sorting.

### 4. Mock factories use wrong date field
- **File:** `src/mocks/factories.ts:~103`
- **Mock creates:** `dataCriacao` on mock products
- **Backend DTO uses:** `dataCadastro`
- **Impact:** Mock product objects use non-existent field name. Cosmetic since mock data doesn't round-trip through the backend.

### 5. Client-side status filter on `meus-pedidos`
- **File:** `src/services/orderService.ts:~69`
- **Issue:** `getMyOrders` fetches ALL orders, then filters by status client-side instead of passing a filter param.
- **Impact:** Unnecessary data transfer. The backend endpoint supports filters.

### 6. SSE event maps `pedido.criado` to `PENDENTE`
- **File:** `src/services/notificationService.ts:165` and `src/services/orderService.ts` (`mapStatus()`)
- **Issue:** Frontend maps backend `CRIADO` → `PENDENTE` for display. Backend-native status is `CRIADO`.
- **Impact:** Client-side only. Consistent convention but creates a vocabulary mismatch. Be aware when comparing frontend status values to backend docs.

### 7. `cartService.sincronizar` is a stub
- **File:** `src/services/cartService.ts:76-79`
- **Issue:** Returns `{ sincronizado: false }`. No `/carrinho/sincronizar` endpoint exists on backend.
- **Impact:** Misleading method. CartContext uses a different sync strategy, so this is dead code.

### 8. `productService` returns 3 possible shapes
- **File:** `src/services/productService.ts:38-50`
- **Issue:** `_getProdutos` returns `response.data` which can be `ProdutoDto[]`, `PageDto<ProdutoDto>`, or `CursorPageDto<ProdutoDto>`. Callers must handle all three shapes.
- **Impact:** Not a bug per se — it's the expected behavior — but undocumented and easy for future callers to forget.

---

## Confirmed Correct — No Issues

- **Sort params** in `searchService.ts` — uses `sort` + `sortDir` with `ASC`/`DESC` ✅
- **Filter params** (`termo`, `categoriaId`, `precoMin`, `precoMax`, `ativo`) — match backend exactly ✅
- **HTTP methods** — all match ✅
- **URL paths** — all match their respective controllers ✅
- **Request body fields** for checkout, pay, cancel, send — all match DTOs ✅
- **Admin order status tabs** — use backend-native `CRIADO`/`PAGO`/`ENVIADO`/`ENTREGUE`/`CANCELADO` ✅
- **Admin relatorios query params** — `inicio` and `fim` match `DrePeriodoQueryDto` ✅
- **SSE event names** — match backend exactly ✅
- **Date fields for Pedido** — match `PedidoDto` exactly ✅
- **Stock management URLs** — `/estoque/produto/:produtoId/adicionar|remover|ajustar` match ✅

---

## Lessons Learned

1. **Sort params** are the #1 source of silent 400 errors — frontend uses combined `field,dir` format, backend expects separate `sort` + `sortDir` params.
2. **Field name drift** — the frontend was originally built against the Java Spring Boot backend which uses `dataCriacao`. The NestJS port uses `dataCadastro`. These diverge silently.
3. **Mock fallback masks bugs** — the frontend's `withFallback()` pattern in services hides 400/500 errors, making API bugs invisible to the user (they see mock data instead).
4. **Audit frequency** — re-run this audit whenever new endpoints are added or existing DTOs are modified.

---

## How to Re-Run This Audit

1. Search frontend for all `api.get`, `api.post`, `api.put`, `api.patch`, `api.delete` calls in `src/services/` and `src/pages/`
2. For each call, compare params/body against the corresponding backend DTO and controller
3. Key things to verify: field names, sort format, enum values, HTTP method, URL path, required vs optional fields
