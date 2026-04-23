# Search System — Frontend Integration

## Backend Implementation (minhavenda-nestjs)
The backend provides full-text search using PostgreSQL tsvector with cursor-based pagination.

## Frontend Integration

### API Endpoints

#### Products Search
```
GET /api/produtos?termo=...&categoriaId=...&precoMin=...&precoMax=...&ativo=...&sort=...&sortDir=...
```

**Three response modes:**
1. **Flat array** (no `page`/`size`/`cursor` params): `ProdutoDto[]`
2. **Offset pagination** (has `page` + `size`): `PageDto<ProdutoDto>`
   ```typescript
   { content: ProdutoDto[], totalElements: number, totalPages: number, number: number, size: number, first: boolean, last: boolean }
   ```
3. **Cursor pagination** (has `size` but NO `page`): `CursorPageDto<ProdutoDto>`
   ```typescript
   { content: ProdutoDto[], size: number, hasMore: boolean, nextCursor: string }
   ```

**Cursor format:** Base64-encoded JSON `{ v: sortValue, id: entityId }` — opaque to frontend

#### Categories Search
```
GET /api/categorias?termo=...&ativo=...&sort=...&sortDir=...&cursor=...&size=...
```

**Two response modes:**
1. **Flat array** (no cursor/size params): `CategoriaDto[]`
2. **Cursor pagination** (has `size` param): `CursorPageDto<CategoriaDto>`

### Search Parameters

#### Products (`FiltrosProduto`)
- `termo`: string — full-text search (tsvector, uses `websearch_to_tsquery`)
- `nome`: string — ILike match on product name
- `categoriaId`: string/number — filter by category
- `precoMin`: number — minimum price filter
- `precoMax`: number — maximum price filter
- `ativo`: boolean — active products only
- `cursor`: string — opaque cursor for pagination
- `size`: number — page size for cursor mode
- `sort`: string — sort field (`dataCadastro`, `preco`, `nome`)
- `sortDir`: `'ASC'` | `'DESC'` — sort direction

#### Categories (`FiltroCategoria`)
- `termo`: string — full-text search
- `ativo`: boolean — filter by active status
- `cursor`: string — opaque cursor
- `size`: number — page size
- `sort`: string — sort field
- `sortDir`: `'ASC'` | `'DESC'`

### Frontend Service Implementation

**File:** `src/services/searchService.ts`

The search service wraps the product/category endpoints and handles:
- Parameter validation and transformation
- Cursor encoding/decoding (base64 JSON)
- Response normalization across all 3 modes
- Integration with `searchService.ts` for the SearchPage UI

### Key Implementation Details

1. **Sort field is `dataCadastro`** (NOT `dataCriacao`) — matches backend entity field
2. **Cursor pagination** is triggered by `size` param WITHOUT `page` param
3. **`websearch_to_tsquery`** handles natural language queries (multi-word, operators)
4. **Money values** are numbers (from `Decimal.valor.toNumber()` on backend)
5. **Category IDs** may come as strings from PG driver — convert with `Number()` if needed

### Usage Examples

```typescript
// Full-text search with offset pagination
const results = await buscarProdutos({
  termo: 'smart tv bluetooth',
  categoriaId: 'cat-1',
  precoMin: 100,
  precoMax: 5000,
  page: 0,
  size: 12,
  sort: 'dataCadastro',
  sortDir: 'DESC'
})

// Cursor-based pagination (better for infinite scroll)
const results = await buscarProdutos({
  termo: 'gamer',
  size: 12,
  sort: 'preco',
  sortDir: 'ASC'
})
// If results.hasMore: next call includes results.nextCursor
```

### Caching
- Backend caches search results with keys: `PRODUTOS_LISTA:<serialized-filters>` and `CATEGORIAS_LISTA:<serialized-filters>`
- Frontend should not rely on cache invalidation — backend handles it

### Testing
- Backend has 272 unit tests + 89 integration tests for search
- Tests cover: flat list, tsvector full-text, cursor pagination, sortDir, combined filters
- Use `pnpm test:e2e` to run frontend E2E tests (mock the search endpoints)
