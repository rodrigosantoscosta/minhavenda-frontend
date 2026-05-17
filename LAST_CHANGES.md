## 2026-05-17 — Header centered search, simplified CategoryNav, minimal SearchBar

### Files changed
- `src/components/layout/Header.tsx` — Search bar centered with `justify-center` and `max-w-md`, removed `flex-1` from search container
- `src/components/home/CategoryNav.tsx` — Simplified to plain text links (no pills, no shadows, no counts), only "Todos" has dark pill background (`bg-foreground text-background`), inactive categories are `text-muted-foreground hover:text-foreground`, removed fade mask edges, removed `scrollbar-hide` dependency on mask
- `src/components/search/SearchBar.tsx` — Simplified: removed clear button, removed submit button, added search icon on left (`pl-9`), input uses `bg-muted/50` with `focus:bg-background`, removed unused `MagnifyingGlassIcon` import
- `src/pages/Home.tsx` — Category nav section: removed `bg-card`, kept only `border-b border-border`, reduced padding (`py-4` → `py-3`)

### Design changes
- **Centered search**: Search bar now centered in header like preview
- **Clean category nav**: Text-only links, only "Todos" highlighted with dark pill
- **Minimal search input**: Icon on left, no buttons, subtle background

### Notes
- 1 lint error (pre-existing in badge.tsx), 69 warnings (pre-existing)
- TypeScript type check passes with zero errors

---

## 2026-05-17 — ProductCard: Remove buttons, add hover text highlight

### Files changed
- `src/components/common/products/ProductCard.tsx` — Removed "Adicionar" button and "Detalhes" link, added hover effect: `hover:border-foreground/20` on card, `group-hover:text-primary` on title, removed `useCart` import and related logic
- `src/components/product/ProductCardSkeleton.tsx` — Removed button placeholder to match new card layout

### Design changes
- **No buttons**: Card is purely informational, entire card is clickable
- **Hover effect**: Border highlight + title color change on hover
- **Cleaner**: Less visual noise, faster perceived performance

### Notes
- 1 lint error (pre-existing in badge.tsx), 69 warnings (pre-existing)
- TypeScript type check passes with zero errors

---

## 2026-05-17 — ProductCard: Vertical layout, compact, match preview design

### Files changed
- `src/components/common/products/ProductCard.tsx` — Switched to vertical layout (`flex-col` always), image `aspect-square` filling card width, added back "Adicionar" button (native, compact, `bg-foreground text-background`) and "Detalhes" text link, price format with comma decimal separator (`R$ 299,90`), original price shown after current price when discounted, reduced padding (`p-3`), reduced font sizes, `rounded-lg`
- `src/components/product/ProductsGrid.tsx` — Default columns changed to 4, grid `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`, gap reduced (`gap-3 sm:gap-4`)
- `src/components/product/ProductCardSkeleton.tsx` — Updated to match new vertical layout: `aspect-square` image, smaller padding, smaller placeholders, `rounded-lg`

### Design changes
- **Vertical layout**: Image on top, content below (matching preview)
- **4 columns on desktop**: `lg:grid-cols-4` for denser grid
- **Compact cards**: Smaller gap, smaller padding, smaller fonts
- **Price format**: Brazilian format with comma (`R$ 299,90`)
- **Button**: Native compact button instead of shadcn Button component
- **Badge**: `rounded` (not `rounded-full`) to match preview

### Notes
- 1 lint error (pre-existing in badge.tsx), 69 warnings (pre-existing)
- TypeScript type check passes with zero errors

---

## 2026-05-17 — Minimalist redesign: Header, SearchBar, ProductCard

### Files changed
- `src/components/layout/Header.tsx` — Removed announcement bar, removed MV badge (plain text "MinhaVenda" only), replaced custom dropdown with shadcn `DropdownMenu` + `Avatar` + `Separator`, reduced padding (`py-3` → `py-2.5`), reduced icon sizes, simplified mobile menu
- `src/components/search/SearchBar.tsx` — Replaced hardcoded colors (`gray-200`, `white`, `gray-900`) with CSS tokens (`border-border`, `bg-background`, `text-foreground`, `placeholder-muted-foreground`), reduced button size (`w-9` → `w-8`), rounded-lg → rounded-md
- `src/components/common/products/ProductCard.tsx` — Flat design (no shadow, no hover translate), compact image (`w-28` → `w-24`, `aspect-[4/3]` → `aspect-square`), only discount badge (removed "Destaque" and "Esgotado"), removed stars, removed hover overlay, removed favorite button, replaced "Detalhes" button with text link (`text-muted-foreground hover:text-foreground`), reduced padding (`p-3 sm:p-4` → `p-2.5 sm:p-3`), reduced font sizes (`text-lg` → `text-base` for price), removed unused imports

### Design principles applied
- **Minimalism**: Removed all decorative elements (announcement bar, MV badge, shadows, hover animations, stars, favorite button, overlay)
- **Flat design**: No shadows, no hover elevation, no translate animations
- **Compact**: Smaller images, less padding, smaller fonts
- **shadcn adoption**: `DropdownMenu`, `Avatar`, `Separator` replacing custom implementations
- **CSS tokens**: All hardcoded colors replaced with design system variables

### Notes
- 1 lint error (pre-existing in badge.tsx), 69 warnings (pre-existing)
- TypeScript type check passes with zero errors

---

## 2026-05-17 — Phase 9: Admin Dashboard Polish & Design System Updates

### Files changed
- `src/components/product/ProductCardSkeleton.tsx` — Updated to match new card design: `rounded-xl`, 4:3 aspect ratio on desktop, design token colors (`bg-card`, `bg-muted`, `border-border`) instead of hardcoded gray
- `src/pages/admin/AdminCategorias.tsx` — Added mobile card layout (`sm:hidden`), aria-labels on all action buttons, moved `ActionBtn` component outside render function to fix fast-refresh error, removed unused `saving` state
- `src/pages/admin/AdminProdutos.tsx` — Added `focus:ring-2 focus:ring-orange-500/50` and `hover:border-blue-400` to search input and filter selects, added `aria-label` to all interactive elements, `min-w-[44px] min-h-[44px]` on mobile action buttons
- `src/pages/admin/AdminEstoque.tsx` — Added `focus:ring-2` and `hover:border-blue-400` to search input and category filter, added `aria-label` attributes
- `src/pages/admin/AdminPedidos.tsx` — Added `role="group"` and `aria-label` to filter tabs, `aria-label` to ID copy span and "Ver Detalhes" links, `role="button"` and `tabIndex` on clickable ID
- `src/pages/admin/AdminPedidoDetail.tsx` — Added `aria-label` to back link and action buttons, `min-h-[44px]` on action buttons
- `src/pages/admin/AdminEditProduto.tsx` — Added `aria-label` to back link, `role="switch"` and `aria-checked` to product active toggle, `min-w-[44px] min-h-[44px]` on toggle
- `src/pages/admin/AdminDLQ.tsx` — Added `aria-label` to requeue buttons, `min-h-[44px]` on touch targets
- `src/utils/adminUtils.tsx` — Updated `inputCls` to use `focus:ring-2 focus:ring-orange-500/50` and added `hover:border-blue-400`

### Principles applied
- **Mobile-first**: Added mobile card layout to AdminCategorias (was desktop-only)
- **Touch targets**: All mobile interactive elements now `min-w-[44px] min-h-[44px]`
- **Focus rings**: All inputs use `focus:ring-2 focus:ring-orange-500/50`
- **Hover states**: Search inputs use `hover:border-blue-400` (not black/dark)
- **Accessibility**: Added `aria-label`, `aria-hidden`, `role`, `tabIndex` throughout admin pages
- **Design tokens**: ProductCardSkeleton uses CSS variables instead of hardcoded colors

### Notes
- 1 lint error (pre-existing in badge.tsx), 69 warnings (pre-existing)
- TypeScript type check passes with zero errors

---

## 2026-05-17 — Apply make-interfaces-feel-better skill principles

### Files changed
- \src/components/common/products/ProductCard.tsx\ — \	ransition-all\ → \	ransition-[box-shadow,transform]\, added image outline, favorite button transition specific properties
- \src/components/common/Pagination.tsx\ — \	ransition-all\ → \	ransition-[background-color,color,transform]\, added \ctive:scale-[0.96]\ for tactile feedback
- \src/pages/Checkout.tsx\ — \	ransition-all\ → \	ransition-[border-color,background-color,color]\ on payment option cards
- \src/components/checkout/AddressForm.tsx\ — \	ransition-all\ → \	ransition-[background-color,border-color,color]\
- \src/pages/admin/AdminEstoque.tsx\ — \	ransition-all\ → \	ransition-[width,background-color]\ on progress bar
- \src/pages/Register.tsx\ — \	ransition-all\ → \	ransition-[width,background-color]\ on password strength bar
- \src/components/product/ImageGallery.tsx\ — \	ransition-all\ → \	ransition-[background-color,transform]\ and \	ransition-[border-color,transform]\
- \src/components/common/StatusBadge.tsx\ — \	ransition-all\ → \	ransition-[background-color,color,transform]\
- \src/pages/Orders.tsx\ — \	ransition-all\ → \	ransition-[background-color,color]\
- \src/components/home/FeaturedCategories.tsx\ — \	ransition-all\ → \	ransition-[background-color,transform,color]\
- \src/components/ui/tabs.tsx\ — \	ransition-all\ → \	ransition-[color,background-color,box-shadow]\
- \src/components/common/Modal.tsx\ — \	ransition-all\ → \	ransition-[opacity,transform]\
- \src/pages/admin/AdminProdutos.tsx\ — replaced \order\ with \outline\ on product images (3 occurrences)
- \src/pages/admin/AdminEditProduto.tsx\ — replaced \order\ with \outline\ on product preview image

### Principles applied
- **Principle 14**: Never use \	ransition: all\ — all 17 occurrences replaced with specific properties
- **Principle 11**: Image outlines — added \outline outline-1 -outline-offset-1 outline-black/10\ to product images
- **Principle 12**: Scale on press — added \ctive:scale-[0.96]\ to pagination buttons

### Notes
- 0 lint errors (66 pre-existing warnings)
- All changes follow the make-interfaces-feel-better skill guidelines

---

## 2026-05-17 — E2E Tests with Real Backend + Mock Disabled
