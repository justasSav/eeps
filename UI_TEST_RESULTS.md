# UI Test Results — EEPS

**Date:** 2026-02-07
**Test method:** Static export analysis + source code review (Playwright browser binaries unavailable in CI environment)
**Build:** `npm run build` passed successfully (Next.js 16.1.6 Turbopack)
**TypeScript:** `npx tsc --noEmit` passed — no type errors

---

## Test Suite Results

| Suite | Status | Notes |
|-------|--------|-------|
| Smoke Test | PASS (with issues) | All 7 pages build and serve HTML; tracking page has blank pre-render |
| Menu Browsing | PASS (structural) | MenuList component loads correctly; SSR shows loader only |
| Product Customization | FAIL | Critical cart integration bugs (quantity/price mismatch) |
| Cart Functionality | FAIL | Floating-point price corruption; deduplication bug |
| Checkout Flow | PASS (with issues) | Form renders correctly; missing delivery validation |
| Responsive Design | PASS | Mobile-first layout with max-w-lg container; no overflow issues in markup |

**Overall: 2/6 suites fully passed, 2 passed with issues, 2 failed**

---

## Critical Bugs Found

### BUG 1: Admin dashboard realtime subscription never activates
- **Files:** `src/hooks/useRealtime.ts:16`, `src/features/admin/admin-dashboard.tsx:49`
- **Severity:** CRITICAL
- The `useRealtime` hook returns early when `filter` is `null` (line 16), but the admin dashboard passes `null` to listen for ALL order updates (line 49). The realtime subscription is silently never created. Staff will never see live order updates.

### BUG 2: Customizer sends pre-multiplied item_total but store forces quantity to 1
- **Files:** `src/features/customizer/product-customizer.tsx:32-33,68`, `src/store/cart.ts:61`
- **Severity:** CRITICAL
- The customizer calculates `totalPrice = unitPrice * quantity` and passes it as `item_total`. But the store always forces `quantity: 1` for new items. If a customer selects quantity 3 at 500p each, the cart shows 1 item at 1500p instead of 3 items at 500p. Subsequent quantity adjustments will use incorrect unit price (1500p instead of 500p).

### BUG 3: Floating-point price corruption in cart quantity updates
- **Files:** `src/store/cart.ts:51,84`
- **Severity:** CRITICAL
- Both `addItem` (existing items) and `updateQuantity` derive unit price via division: `(i.item_total / i.quantity) * newQuantity`. When not evenly divisible, this introduces fractional pence (e.g., `1199 / 3 * 4 = 1598.666...`). The app convention requires prices as integers in pence.

### BUG 4: Cart deduplication fails for multi-select modifiers in different order
- **File:** `src/lib/utils.ts:44`
- **Severity:** CRITICAL
- `generateCartKey` sorts top-level modifier group keys but does NOT sort array values within groups. Selecting toppings `["Cheese", "Mushroom"]` vs `["Mushroom", "Cheese"]` produces different cart keys, creating duplicate line items for identical customizations.

### BUG 5: useRealtime causes infinite re-subscription loop
- **File:** `src/hooks/useRealtime.ts:37`, `src/features/orders/order-tracker.tsx:40`
- **Severity:** HIGH
- The `filter` parameter is an inline object literal `{ column: "id", value: orderId }` created on every render. Since objects are compared by reference in the useEffect dependency array, the effect re-runs every render — continuously tearing down and recreating Supabase channel subscriptions.

### BUG 6: Tracking page renders completely blank during initial load
- **File:** `src/app/tracking/page.tsx:29`
- **Severity:** HIGH
- The `<Suspense>` wrapping `useSearchParams()` has no `fallback` prop. During static export, `useSearchParams()` triggers a bailout to client-side rendering, and without a fallback, the page renders as an empty `<template data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING">` — users see nothing until JS hydrates.

### BUG 7: No authentication guard on admin dashboard
- **Files:** `src/app/admin/page.tsx`, `src/features/admin/admin-dashboard.tsx`
- **Severity:** HIGH
- The admin dashboard at `/admin` is publicly accessible. Any visitor can advance or cancel customer orders. The login page exists but is not enforced.

---

## Medium-Severity Issues

| # | File | Issue |
|---|------|-------|
| 8 | `src/services/orders.ts:129` | `updateOrderStatus` parameter typed as `string` instead of `OrderStatus` |
| 9 | `src/features/customizer/product-customizer.tsx:156` | Negative price modifiers (discounts) hidden from users |
| 10 | `src/services/orders.ts:62,101,152` | `order_items` query errors silently swallowed |
| 11 | `src/features/menu/menu-list.tsx`, `order-history.tsx`, `order-tracker.tsx` | No user-facing error states — errors logged to console only |
| 12 | `src/features/orders/checkout-form.tsx:36-39` | Delivery orders don't validate city or postal code |
| 13 | `src/features/orders/checkout-form.tsx:31` | Checkout page with empty cart shows full form + enabled submit button |
| 14 | `src/services/orders.ts:60-87,149-177` | N+1 query pattern for order items |
| 15 | `src/components/shared/navbar.tsx:8` | Zustand persist hydration mismatch risk |

---

## Low-Severity / Quality Issues

| # | File | Issue |
|---|------|-------|
| 16 | `src/components/ui/badge.tsx:22` | References `React.HTMLAttributes` without importing `React` |
| 17 | `product-customizer.tsx`, `cart-item-row.tsx` | Icon-only buttons missing `aria-label` |
| 18 | `product-customizer.tsx` | No Escape key handler to close modal |
| 19 | `checkout-form.tsx`, `auth/login/page.tsx` | Labels not associated with inputs via `htmlFor`/`id` |
| 20 | `src/store/cart.ts:19-22,93-96` | Dead code: checkout-related store fields never used |
| 21 | `src/types/index.ts:54` | `number` in `OrderItemModifiers` union is unused |
| 22 | `src/features/menu/product-card.tsx:19-23` | Raw `<img>` instead of Next.js `<Image>` |
| 23 | `src/hooks/useLocalStorage.ts:6-7` | Flash of initial value before localStorage read |
| 24 | `CLAUDE.md` | Documents `tracking/[id]/page.tsx` but actual file is `tracking/page.tsx` with query params |

---

## Build/Config Issues

| Issue | Severity |
|-------|----------|
| No ESLint config — `npm run lint` fails | Medium |
| `eslint` and `eslint-config-next` missing from devDependencies | Medium |
| `@types/node`, `@types/react`, `typescript` in `dependencies` instead of `devDependencies` | Low |
| No `.env.local` — Supabase client initialized with undefined values at runtime | High (runtime) |
| `images.remotePatterns` in next.config.ts is redundant with `unoptimized: true` | Low |
