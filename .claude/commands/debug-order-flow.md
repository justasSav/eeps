# Debug Order Flow

Trace and diagnose issues in the order submission, tracking, or admin management flow.

## Arguments
- $ARGUMENTS: Description of the issue (e.g., "orders not appearing in admin dashboard" or "cart total incorrect")

## Instructions

0. **If working from a GitHub issue**, install the GitHub CLI and fetch the issue details first:
   ```bash
   chmod 1777 /tmp && apt-get update -qq && apt-get install -y -qq gh
   gh api repos/<owner>/<repo>/issues/<number>
   ```
   Use the issue description as the source of truth for requirements.

1. **Identify which part of the order flow is affected.** The full flow is:
   - Menu → Cart → Checkout → Order Store → Tracking/Admin

2. **Check the relevant files based on the issue:**

   **Menu/Add-to-cart issues:**
   - `src/data/menu.ts` — hardcoded product data (prices, availability, categories)
   - `src/services/menu.ts` — `getMenu()` returns the hardcoded menu
   - `src/features/menu/menu-list.tsx` — search, category filtering, add-to-cart trigger
   - `src/features/menu/product-card.tsx` — product display, "Add" button callback
   - `src/lib/utils.ts` — `generateCartKey()`, `formatPrice()`

   **Cart issues:**
   - `src/store/cart.ts` — Zustand store: addItem, removeItem, updateQuantity, getTotal
   - `src/features/cart/cart-view.tsx` — cart page rendering, total display
   - `src/features/cart/cart-item-row.tsx` — quantity controls, item removal
   - `src/lib/utils.ts` — `generateCartKey(productId)` for deduplication

   **Checkout/submission issues:**
   - `src/features/orders/checkout-form.tsx` — form validation, fulfillment type, submitOrder call
   - `src/store/orders.ts` — `submitOrder()`: generates 3-digit code, persists to localStorage
   - `src/store/cart.ts` — `clearCart()` called after successful submission

   **Tracking issues:**
   - `src/app/tracking/page.tsx` — reads `?id=` query param, renders OrderTracker
   - `src/features/orders/order-tracker.tsx` — fetches order from store, displays progress stepper
   - `src/store/orders.ts` — `getOrder(code)` lookup

   **Admin authentication issues:**
   - `src/store/auth.ts` — `useAuthStore`: login(username, password), logout(), isAuthenticated
   - `src/features/admin/admin-login.tsx` — login form (demo/demo credentials)

   **Admin/status update issues:**
   - `src/features/admin/admin-dashboard.tsx` — auth gate + lists active orders, status transition buttons
   - `src/store/orders.ts` — `getActiveOrders()`, `updateOrderStatus(code, status)`
   - `src/components/shared/status-badge.tsx` — status label + color mapping

   **Order history issues:**
   - `src/features/orders/order-history.tsx` — lists all past orders
   - `src/store/orders.ts` — `getAllOrders()`, `getOrdersByPhone(phone)`

3. **Read the identified files** and trace the data flow step by step.

4. **Look for common issues:**
   - Price calculation errors (integer cents vs float)
   - Cart key generation inconsistencies (same product not deduplicating)
   - Missing `"use client"` directive on new/modified components
   - Zustand persist hydration issues (SSR vs client mismatch)
   - localStorage quota or serialization errors
   - Order code collisions (3-digit codes only allow 900 unique orders)
   - Status transition logic errors in admin dashboard
   - Query param not being read correctly on tracking page

5. **Propose a fix** with minimal code changes. Explain what went wrong and why the fix works.

6. **Verify with `npm run build`** after applying the fix.
