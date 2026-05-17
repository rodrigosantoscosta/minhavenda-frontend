# Phase 9: Polish & Admin Pages Redesign

## Status: Pending

## Scope
Final refinements across the entire frontend plus redesign of all admin pages to match the new design system.

## Customer-Facing Polish

### 9.1 Responsive Breakpoints
Verify all redesigned pages work correctly at:
- Mobile (<640px): single column, hamburger nav, stacked layouts
- Tablet (640-1024px): 2-column grids, adjusted spacing
- Desktop (1024-1440px): full layouts as designed
- Large (>1440px): max-width containers centered

Pages to verify: Home, ProductDetail, Cart, Checkout, Products, SearchPage, Login, Register, Profile, Orders, OrderDetail, NotFound

### 9.2 Animation Consistency
- All transitions: `150ms` duration
- UI interactions: `ease-spring` (cubic-bezier(0.2, 0, 0, 1))
- Enter animations: `ease-out` for fadeInUp, fadeIn, slideIn
- Stagger delays: `80ms` increments for sequential elements
- Verify `active:scale-[0.96]` on all interactive buttons

### 9.3 Loading States
Update `ProductCardSkeleton` to match new card design:
- `rounded-xl` (0.75rem)
- 4:3 aspect ratio image placeholder
- Same content structure as redesigned ProductCard
- Update all other skeleton components (cart items, checkout summary, etc.)

### 9.4 Accessibility
- Verify focus rings on all interactive elements (use `focus:ring-2 focus:ring-ring/50`)
- Check aria-labels on icon-only buttons (cart, favorite, share, quantity controls)
- Verify keyboard navigation through all forms and navigation
- Check color contrast ratios (especially muted text on backgrounds)
- Ensure all form inputs have associated labels

### 9.5 Image Optimization
- Add `loading="lazy"` to all below-fold product images
- Verify `onError` fallbacks on all `<img>` tags
- Consider adding aspect-ratio containers to prevent layout shift

### 9.6 Performance
- Lazy-load below-fold sections (FeaturesSection on home)
- Verify image srcset for responsive images
- Check bundle size impact of new components

## Admin Pages Redesign

### Pages to Redesign
All pages under `src/pages/admin/`:
- `AdminDashboard.tsx` — Dashboard overview with KPIs
- `AdminPedidos.tsx` — Orders list
- `AdminPedidoDetail.tsx` — Order detail view
- `AdminProdutos.tsx` — Products management
- `AdminEditProduto.tsx` — Product edit form
- `AdminEstoque.tsx` — Stock management
- `AdminCategorias.tsx` — Categories management
- `AdminRelatoriosFinanceiros.tsx` — Financial reports
- `AdminDLQ.tsx` — Dead letter queue

### Admin Design Principles
- Use same design tokens (HSL variables, radius, shadows)
- Dark sidebar with light content area (or consistent with storefront)
- Data tables with proper spacing, hover states, and pagination
- Form inputs consistent with checkout/address forms
- Status badges using semantic colors (success, warning, destructive)
- KPI cards with shadow-card styling
- Charts/graphs should use `--chart-*` color tokens

### Admin Components to Create/Update
- `AdminLayout.tsx` — Sidebar + header layout for admin
- `AdminDataTable.tsx` — Reusable data table with sorting, pagination
- `AdminStatCard.tsx` — KPI stat cards
- `AdminStatusBadge.tsx` — Order/product status badges
- `AdminFormSection.tsx` — Consistent form section wrapper

### Admin Layout Structure
```
┌─────────────────────────────────────┐
│  Admin Sidebar  │  Admin Header     │
│  Navigation     │  Search + User    │
│                 ├───────────────────┤
│  - Dashboard    │                   │
│  - Pedidos      │   Page Content    │
│  - Produtos     │                   │
│  - Estoque      │                   │
│  - Categorias   │                   │
│  - Relatórios   │                   │
│  - DLQ          │                   │
└─────────────────────────────────────┘
```

## Files to Modify
- `src/components/common/products/ProductCardSkeleton.tsx`
- `src/components/admin/*` (new components)
- `src/pages/admin/*.tsx` (all admin pages)
- `src/components/layout/Header.tsx` (verify responsive)
- `src/components/layout/Footer.tsx` (verify responsive)
- `src/components/checkout/AddressForm.tsx` (update styling)
- `src/components/checkout/OrderSummary.tsx` (update styling)
- `src/components/product/ImageGallery.tsx` (update styling)
- `src/components/product/QuantitySelector.tsx` (update styling)
- `src/components/search/SearchBar.tsx` (update styling)
- `src/components/common/Loading.tsx` (update styling)
- `src/components/common/EmptyState.tsx` (update styling)
- `src/components/common/Pagination.tsx` (update styling)

## Execution Order
1. Update skeleton components
2. Update remaining shared components (AddressForm, OrderSummary, ImageGallery, etc.)
3. Create admin layout and shared admin components
4. Redesign each admin page one by one
5. Final responsive/accessibility pass across all pages
6. Performance optimization

## Notes
- Admin pages currently use their own AdminLayout — preserve the sidebar navigation pattern but update styling
- Financial reports page may have charts — ensure chart colors use design tokens
- DLQ page is technical — keep it functional but consistent
- All admin forms should use the same input styling as checkout