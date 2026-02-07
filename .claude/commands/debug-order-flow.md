# Debug Order Flow

Trace and diagnose issues in the order submission, tracking, or admin management flow.

## Arguments
- $ARGUMENTS: Description of the issue (e.g., "orders not appearing in admin dashboard" or "realtime updates not working")

## Instructions

1. **Identify which part of the order flow is affected.** The full flow is:
   - Cart → Checkout → submitOrder() → Database → Realtime → Tracking/Admin

2. **Check the relevant files based on the issue:**

   **Cart/Checkout issues:**
   - `src/store/cart.ts` — cart state, addItem/removeItem logic, persistence
   - `src/features/orders/checkout-form.tsx` — form validation, submitOrder call
   - `src/lib/utils.ts` — generateCartKey(), calculateModifiersCost()

   **Order submission issues:**
   - `src/services/orders.ts` — submitOrder() function, Supabase inserts
   - `supabase/migrations/001_initial_schema.sql` — RLS policies on orders/order_items
   - Check that user_id matches RLS policy expectations

   **Realtime/tracking issues:**
   - `src/hooks/useRealtime.ts` — Supabase channel subscription setup
   - `src/features/orders/order-tracker.tsx` — realtime callback handling
   - `src/features/admin/admin-dashboard.tsx` — realtime listener for all orders
   - Verify Supabase Realtime is enabled for the orders table

   **Status update issues:**
   - `src/services/orders.ts` — updateOrderStatus() function
   - `src/features/admin/admin-dashboard.tsx` — nextStatus mapping
   - Check the order status CHECK constraint in the schema

3. **Read the identified files** and trace the data flow step by step.

4. **Look for common issues:**
   - RLS policies blocking reads/writes (user_id mismatch)
   - Missing `"use client"` directive on new components
   - Supabase Realtime not enabled on the table
   - Price calculation errors (integer vs float)
   - Cart key generation inconsistencies

5. **Propose a fix** with minimal code changes. Explain what went wrong and why the fix works.

6. **Verify with `npm run build`** after applying the fix.
