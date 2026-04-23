# Memory Alignment — Frontend & Backend Projects

## Alignment Date
April 8, 2026

## Purpose
Ensure minhavenda-frontend and minhavenda-nestjs Serena memories are synchronized so agents working on either project have consistent, shared context about the full stack.

## Memories in Both Projects

### ✅ Aligned Memories (exist in BOTH projects)

| Memory Name | Frontend | Backend | Description |
|---|---|---|---|
| `project_overview` | ✅ Updated | ✅ Exists | Stack, architecture, key directories, branch strategy |
| `style_and_conventions` | ✅ Created | ✅ Exists | Code style, naming, TypeScript patterns, mobile-first rules |
| `frontend-backend-api-mismatches-audit` | ✅ Created | ✅ Exists | API audit results, field name mismatches, sort param issues |
| `search_system` | ✅ Created | ✅ Exists | Full-text search implementation, cursor pagination, tsvector |
| `financial-reports-plan` | ✅ Created | ✅ Exists | DRE reports implementation, DTOs, UI (inline date inputs) |
| `suggested_commands` | ✅ Updated | ✅ Exists | pnpm scripts, Windows notes, dev server info |
| `admin_dashboard_plan` | ✅ Updated | N/A | Admin dashboard MVP plan (frontend-specific, updated for TS) |

### 📋 Backend-Only Memories (not needed in frontend)

| Memory Name | Why Frontend Doesn't Need It |
|---|---|
| `corrections_applied` | Backend implementation details (TypeORM, migrations) |
| `dre-date-ui-implementation` | Backend DTO/validator details |
| `integration_test_plan` | Backend e2e test infrastructure |
| `load_test_plan` | Backend performance testing (k6, Artillery) |
| `owasp_security_review` | Backend security (SQL injection, rate limiting, JWT) |
| `task_completion` | Backend use-case completion status |

### 🎯 Frontend-Only Memories (not needed in backend)

| Memory Name | Why Backend Doesn't Need It |
|---|---|
| `admin_dashboard_plan` | Frontend admin UI implementation details |

## Key Alignment Decisions

### 1. API Mismatches Audit
- **Shared** because it documents the contract between frontend and backend
- Both agents need to know about `dataCriacao` vs `dataCadastro` drift
- Sort param format differences (`field,dir` vs `sort` + `sortDir`)
- Field name mismatches (`quantidadeItens` vs `quantidadeTotal`)

### 2. Search System
- **Shared** because backend implements search, frontend consumes it
- Documents cursor pagination protocol (opaque base64 cursors)
- Lists all filter params and response shapes
- Backend has implementation details, frontend has integration details

### 3. Style & Conventions
- **Both projects** have this but with project-specific rules
- Backend: TypeScript, NestJS patterns, Domain-Driven Design, Portuguese use cases
- Frontend: React 19, TypeScript, Tailwind, mobile-first, component patterns
- Shared rules: no `any` types, strict mode, UTF-8 encoding

### 4. Project Overview
- **Updated frontend** to include TypeScript migration status (April 2026)
- Added architecture details (contexts, services, hooks, mocks)
- Backend overview remains NestJS-focused (TypeORM, RabbitMQ, modules)

### 5. Financial Reports (DRE)
- **Shared** because it's a full-stack feature
- Backend: DTOs, TypeORM queries, migrations V15-V16
- Frontend: UI components, date inputs, API service calls
- Both need to know the DTO shapes and date format expectations

## TypeScript Migration Status

### Frontend (minhavenda-frontend)
- **Status:** ✅ COMPLETE (April 8, 2026)
- All 86 source files: `.ts`/`.tsx`
- Strict mode enabled
- Zero implicit `any` types
- Mock services type-checked against backend DTOs

### Backend (minhavenda-nestjs)
- **Status:** ✅ COMPLETE (from project start)
- NestJS 11 with TypeScript
- TypeORM entities typed
- All DTOs, use cases, and controllers typed
- 272 unit tests + 89 integration tests passing

## Shared Conventions

### Naming
- Domain entities in Portuguese: `Pedido`, `Carrinho`, `Usuario`, `Produto`, `Categoria`
- Status enums: `CRIADO`, `PAGO`, `ENVIADO`, `ENTREGUE`, `CANCELADO`
- User types: `ADMIN`, `CLIENTE`

### Date Fields
- Backend uses `dataCadastro` (NOT `dataCriacao`)
- Frontend was migrated from Java Spring Boot which used `dataCriacao`
- **Both projects now use `dataCadastro`**

### Sort Parameters
- Backend expects: `sort` + `sortDir` as separate query params
- Frontend must NOT use combined `field,dir` format
- Sort direction: `'ASC'` | `'DESC'` (not `'asc'`/`'desc'`)

### API Response Shapes
- Products: `ProdutoDto[]` OR `PageDto<ProdutoDto>` OR `CursorPageDto<ProdutoDto>`
- Categories: `CategoriaDto[]` OR `CursorPageDto<CategoriaDto>`
- Orders: `PedidoDto[]` OR `PedidoDetalhadoDto`
- All dates as ISO strings

## How to Keep Aligned

### When to Update Shared Memories
1. **API changes** — update `frontend-backend-api-mismatches-audit`
2. **New endpoints** — audit and document in both projects
3. **DTO shape changes** — update audit memory
4. **Convention changes** — update `style_and_conventions` in both
5. **Architecture changes** — update `project_overview` in both

### When NOT to Sync
- Backend-specific implementation details (TypeORM, RabbitMQ listeners)
- Frontend-specific UI patterns (component structure, Tailwind classes)
- Test infrastructure specifics (different tools are OK)
- Dev environment setup (Docker vs Vite)

## Re-Running Alignment
To re-sync memories:
1. Activate both projects
2. List memories in each: `list_memories`
3. Compare memory names
4. Read backend memories that should be shared
5. Create/update corresponding frontend memories
6. Document what was aligned in this memory
