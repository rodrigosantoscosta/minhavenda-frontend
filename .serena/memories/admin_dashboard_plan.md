# Admin Dashboard MVP — Implementation Plan
# VERIFIED AGAINST NESTJS SOURCE — all endpoints, DTOs and field names confirmed

## Status: COMPLETE — committed on branch dev-nestjs (commit 2761834)

## Core Reality
The existing project is a customer-facing storefront (JSX, Tailwind, react-icons, react-router-dom v6).
The admin dashboard must be added as a parallel section under `/admin/*` routes in the same project.
Stay with JSX throughout — no TypeScript migration.

---

## What Already Exists (Reusable)
- `AuthContext` + `authService` — login/logout/token mgmt → reuse directly
- `AdminRoute` in `src/components/common/ProtectedRoute.jsx` — already exists, checks `user.role === 'ADMIN'` → wire it up
- `src/services/api.js` — axios instance with Bearer token interceptor (reads `localStorage.getItem('token')`) → use for all admin calls
- `ToastProvider` context → already wraps the whole app, admin toasts work automatically
- Tailwind CSS → already installed

---

## CRITICAL: Auth Response Shape (verified from AuthResponseDto)
`POST /api/auth/login` returns:
```json
{ "token": "...", "email": "...", "nome": "..." }
```
**NO `tipo` or `role` field is returned.** The existing `authService.js` tries to extract `tipo` but gets `undefined`.
`AdminRoute` checks `user.role === 'ADMIN'` which will NEVER pass as-is.

### Fix (mandatory before admin routes work):
Decode the JWT payload on login to extract `tipo`. `jwtHelper.js` already exists.
In `authService.js`, after storing the token, decode it and add `tipo` to the user object:
```js
import jwtHelper from '../utils/jwtHelper'
// after login success:
const payload = jwtHelper.decodeToken(data.token)  // check actual method name in jwtHelper.js
const user = { nome: data.nome, email: data.email, tipo: payload?.tipo, role: payload?.tipo }
```
Then `AdminRoute`'s `user.role === 'ADMIN'` check will pass for admin users.
The JWT `tipo` claim value is the string `'ADMIN'` (from `TipoUsuario.ADMIN` enum).

---

## CRITICAL: Estoque URL paths (verified from EstoqueController)
The MVP spec was WRONG. Real backend URLs:
```
GET /api/estoque/produto/:produtoId           ← NOT /api/estoque/:produtoId
POST /api/estoque/produto/:produtoId/adicionar
POST /api/estoque/produto/:produtoId/remover
PUT  /api/estoque/produto/:produtoId/ajustar  ← PUT not POST
```

---

## CRITICAL: PagarPedidoDto (verified from source)
```json
{ "metodoPagamento": "CARTAO" | "PIX" | "BOLETO", "valorPago": number (optional) }
```
The `metodoPagamento` field MUST be one of exactly: `CARTAO`, `PIX`, `BOLETO` (validated by `@IsIn`).
The form dropdown must use these exact values, not free text.

---

## CRITICAL: CategoriaDto (verified from source)
Real shape has TWO extra fields the MVP spec omitted:
```ts
{ id: number, nome: string, descricao: string, ativo: boolean, dataCadastro: Date }
```
`CriarCategoriaDto` accepts optional `ativo` boolean (defaults to true).

---

## CRITICAL: CancelarPedidoDto (verified from source)
```json
{ "motivo": "string" }   ← required, max 500 chars
```
Confirmed correct — matches the plan.

---

## CRITICAL: EnviarPedidoDto (verified from source)
```json
{ "codigoRastreio": "string", "transportadora": "string" }
```
Both fields required, max lengths 255 and 100. Confirmed correct — matches the plan.

---

## CRITICAL: GET /api/produtos — pagination aware
`GET /api/produtos` returns either `ProdutoDto[]` (flat array) OR `PageDto<ProdutoDto>` (paginated envelope)
depending on whether `page` + `size` query params are present.
For the admin products list: do NOT send `page`/`size` params → always get flat array.
Available filter params: `nome`, `termo`, `categoriaId`, `precoMin`, `precoMax`, `ativo`, `sort`.

---

## CRITICAL: No GET /api/admin/dashboard endpoint
Confirmed absent from the backend. Dashboard page MUST show graceful degradation banner.

---

## Verified DTO Shapes Summary

### AuthResponseDto
`{ token, email, nome }` — role must be decoded from JWT payload

### PedidoDto
`{ id, status, subtotal, valorFrete, valorDesconto, valorTotal, quantidadeItens, enderecoEntrega, codigoRastreio, transportadora, dataCriacao, dataAtualizacao, dataPagamento, dataEnvio, dataEntrega }`
Note: dates are `Date` objects on backend, serialised as ISO strings over JSON — treat as strings on frontend.

### PedidoDetalhadoDto extends PedidoDto
`{ ...PedidoDto, observacoes: string|null, itens: ItemPedidoDto[] }`

### ItemPedidoDto
`{ id, produtoId, produtoNome, quantidade, precoUnitario, subtotal }`

### ProdutoDto
`{ id, nome, descricao, preco, moeda, urlImagem, pesoKg, alturaCm, larguraCm, comprimentoCm, categoriaId, categoriaNome, ativo, dataCadastro }`

### EstoqueDto
`{ id: number, produtoId, produtoNome, quantidade, atualizadoEm }`

### CategoriaDto
`{ id: number, nome, descricao, ativo: boolean, dataCadastro }`

### StatusPedido enum values
`'CRIADO' | 'PAGO' | 'ENVIADO' | 'ENTREGUE' | 'CANCELADO'`

### TipoUsuario enum values
`'ADMIN' | 'CLIENTE'`

---

## Verified Admin API Endpoints

### Pedidos (all require ADMIN JWT)
- `GET  /api/admin/pedidos` → `PedidoDto[]`
- `GET  /api/admin/pedidos/status/:status` → `PedidoDto[]`
- `GET  /api/admin/pedidos/:id` → `PedidoDetalhadoDto`
- `POST /api/admin/pedidos/:id/pagar` body: `{ metodoPagamento: 'CARTAO'|'PIX'|'BOLETO', valorPago?: number }` → `PedidoDetalhadoDto`
- `POST /api/admin/pedidos/:id/enviar` body: `{ codigoRastreio, transportadora }` → `PedidoDetalhadoDto`
- `POST /api/admin/pedidos/:id/entregar` body: `{}` → `PedidoDetalhadoDto`
- `POST /api/admin/pedidos/:id/cancelar` body: `{ motivo }` → `PedidoDetalhadoDto`

### Produtos (GET public, mutations require ADMIN JWT)
- `GET    /api/produtos?nome=&categoriaId=&precoMin=&precoMax=&ativo=&sort=` → `ProdutoDto[]`
- `GET    /api/produtos/:id` → `ProdutoDto`
- `POST   /api/produtos` → `ProdutoDto` (201)
- `PUT    /api/produtos/:id` → `ProdutoDto`
- `DELETE /api/produtos/:id` → 204

### Estoque (all require ADMIN JWT)
- `GET  /api/estoque/produto/:produtoId` → `EstoqueDto`
- `POST /api/estoque/produto/:produtoId/adicionar` body: `{ quantidade: number }` → `EstoqueDto`
- `POST /api/estoque/produto/:produtoId/remover`   body: `{ quantidade: number }` → `EstoqueDto`
- `PUT  /api/estoque/produto/:produtoId/ajustar`   body: `{ quantidade: number }` → `EstoqueDto`

### Categorias (GET public, mutations require ADMIN JWT)
- `GET    /api/categorias` → `CategoriaDto[]`
- `GET    /api/categorias/:id` → `CategoriaDto`
- `POST   /api/categorias` body: `{ nome, descricao, ativo? }` → `CategoriaDto` (201)
- `PUT    /api/categorias/:id` body: `{ nome, descricao, ativo? }` → `CategoriaDto`
- `DELETE /api/categorias/:id` → 204

### DLQ (all require ADMIN JWT)
- `GET  /api/admin/dlq/queues` → `{ dlqs: string[], dica: string, managementUI: string }`
- `POST /api/admin/dlq/requeue/:queue` → `{ dlq, mensagensReenfileiradas, status }` or `{ erro, dlqsValidas }`
- `POST /api/admin/dlq/requeue-all` → `{ resultadoPorDlq: Record<string,number>, totalMensagensReenfileiradas, status }`

### Health (public)
- `GET /api/health` → `{ status: 'ok', timestamp: string }`

---

## What Must Be Built

### Step 0 (prerequisite): Fix auth role extraction
Edit `src/services/authService.js` to decode JWT and set `role`/`tipo` on the user object.
Check `src/utils/jwtHelper.js` for the decode method name before editing.

### Step 1: Install recharts
`pnpm add recharts`

### Step 2: src/services/adminService.js
All admin API calls using the existing `api.js` axios instance.

### Step 3: src/components/admin/AdminLayout.jsx
Sidebar nav: Dashboard, Pedidos, Produtos, Estoque, Categorias, DLQ, Logout.
Dark theme: bg `#0A0B0E`, surface `#111318`, border `#1E2028`, accent `#F97316`.
Must suppress existing Header/Footer — wrap admin routes to not render them (patch App.jsx).

### Step 4: Patch App.jsx
- Conditionally hide `<Header />` and `<Footer />` for `/admin/*` paths (use `useLocation`)
- Uncomment AdminRoute + add all 8 admin route imports

### Step 5-12: Pages under src/pages/admin/
| File | Route | Notes |
|---|---|---|
| `AdminDashboard.jsx` | `/admin/dashboard` | Graceful degradation — no backend endpoint yet |
| `AdminPedidos.jsx` | `/admin/pedidos` | Status filter tabs |
| `AdminPedidoDetail.jsx` | `/admin/pedidos/:id` | Timeline, items, action modals |
| `AdminProdutos.jsx` | `/admin/produtos` | Flat array (no page/size params) |
| `AdminEditProduto.jsx` | `/admin/produtos/:id` | |
| `AdminEstoque.jsx` | `/admin/estoque` | Use `/api/estoque/produto/:id` URLs |
| `AdminCategorias.jsx` | `/admin/categorias` | Show `ativo` column, send `ativo` on create |
| `AdminDLQ.jsx` | `/admin/dlq` | |

---

## Implementation Order
1. Check `jwtHelper.js` decode method → fix authService.js role extraction
2. `pnpm add recharts`
3. `adminService.js`
4. `AdminLayout.jsx`
5. Patch `App.jsx`
6. Pages: Dashboard → Pedidos → PedidoDetail → Produtos → EditProduto → Estoque → Categorias → DLQ
