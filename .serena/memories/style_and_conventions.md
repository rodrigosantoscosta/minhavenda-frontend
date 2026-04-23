# Code Style & Conventions — minhavenda-frontend

## Language & Framework
- **React 19** with TypeScript (strict mode)
- **Vite** as bundler and dev server
- **Tailwind CSS** for styling (mobile-first)
- **pnpm** as package manager

## File Naming
- Components: `PascalCase.tsx` (e.g., `ProductCard.tsx`, `AdminLayout.tsx`)
- Services: `camelService.ts` (e.g., `authService.ts`, `cartService.ts`)
- Utils: `camelCase.ts` (e.g., `jwtHelper.ts`, `imageHelper.ts`)
- Hooks: `useCamelCase.ts` (e.g., `useAuthToken.ts`, `useNotifications.ts`)
- Contexts: `PascalCaseContext.tsx` (e.g., `AuthContext.tsx`, `CartContext.tsx`)
- Pages: `PascalCase.tsx` (e.g., `Home.tsx`, `AdminPedidos.tsx`)
- Types: `index.ts` in `src/types/`
- Mocks: `camelCase.ts` in `src/mocks/` (e.g., `factories.ts`, `mockProductService.ts`)

## Code Organization
- **Mobile-first responsive design** — start with base styles for mobile, scale up with `sm:`, `md:`, `lg:` breakpoints
- **Functional components** with hooks (no class components)
- **Type imports** use `import type { ... }` syntax
- **No `any` types** — use proper type definitions or `unknown` with type guards
- **Logging**: Use `logger` from `utils/logger` (pino), not `console.log`
- **No emojis** in production code (debug only, must be removed)

## Component Guidelines
- Keep components under 300 lines; extract smaller components if needed
- Co-locate related state management
- Use semantic selectors in tests: `getByRole` → `getByLabel` → `getByText` → `getByTestId`
- Minimum touch targets: `44×44px` (use `min-h-[44px] min-w-[44px]` or `p-3`)
- Hover effects on inputs: `hover:border-blue-400` (never black/dark)
- Focus rings: `focus:ring-blue-500 focus:border-blue-500`

## TypeScript Patterns
- Define interfaces in `src/types/index.ts` for shared types
- Use `Omit<T, K>` when extending types with modifications
- Avoid `as any` — use `Error & { response?: { status: number } }` pattern for error typing
- Export types with `export type { TypeName }` for use across modules

## API Service Patterns
- All services use `api` axios instance from `services/api.ts`
- Generic return types: `api.get<T>(url)`, `api.post<T>(url, data)`
- Use `import type` for DTOs and response types
- Mock services have fallback pattern: `withFallback(realFn, mockFn)`

## Portuguese Naming
- Domain entities in Portuguese: `Pedido`, `Carrinho`, `Usuario`, `Produto`, `Categoria`
- Status values: `CRIADO`, `PAGO`, `ENVIADO`, `ENTREGUE`, `CANCELADO`
- UI labels and messages in Portuguese (user-facing)
- Variable names in English (code consistency)

## Form Handling
- Use `e.preventDefault()` in form `onSubmit` handlers
- Use `react-hook-form` for complex forms
- Store form errors in state, display with field-level feedback

## Auth State Management
- `AuthContext` `loading` state changes can trigger component remounts
- `PublicRoute` and `ProtectedRoute` only show loading spinners during initial auth check
- Never show spinners during active login/register operations (causes component remount)

## Error Display Pattern
```typescript
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

## Tailwind Breakpoint Order
```
base (mobile) → sm: (≥640px) → md: (≥768px) → lg: (≥1024px) → xl: (≥1280px)
```
Always write classes in this order. Never skip breakpoints without a documented reason.

## Product Cards
- Mobile: horizontal list layout (image left ~30%, content right)
- `sm:` and above: vertical grid card with `aspect-square` image
