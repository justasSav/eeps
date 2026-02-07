# Research Plan — EEPS Codebase

This document defines structured research workflows for investigating issues, planning features, and understanding behavior in the EEPS ordering system.

---

## 1. Bug Investigation Workflow

When investigating a bug, follow this systematic approach:

### Step 1: Reproduce & Classify
- Identify the affected area: Menu, Cart, Checkout, Tracking, Admin, Auth
- Determine the type: UI glitch, data issue, state corruption, realtime failure, build error
- Note the expected vs actual behavior

### Step 2: Trace the Data Flow
Map the data path for the affected feature:

| Area | Files to Read (in order) |
|------|-------------------------|
| Menu display | `services/menu.ts` → `features/menu/menu-list.tsx` → `features/menu/product-card.tsx` |
| Customizer | `features/customizer/product-customizer.tsx` → `lib/utils.ts` (calculateModifiersCost) |
| Cart | `store/cart.ts` → `features/cart/cart-view.tsx` → `features/cart/cart-item-row.tsx` |
| Checkout | `store/cart.ts` → `features/orders/checkout-form.tsx` → `services/orders.ts` |
| Tracking | `services/orders.ts` → `hooks/useRealtime.ts` → `features/orders/order-tracker.tsx` |
| Admin | `services/orders.ts` → `hooks/useRealtime.ts` → `features/admin/admin-dashboard.tsx` |
| Auth | `lib/supabase.ts` → `app/auth/login/page.tsx` |
| Database | `supabase/migrations/001_initial_schema.sql` (schema + RLS policies) |

### Step 3: Check Common Failure Points
- **RLS policies** — Is user_id correct? Guest user is hardcoded as "guest"
- **Price calculations** — Any floating-point operations instead of integer pence?
- **Cart key mismatch** — generateCartKey producing different keys for same items?
- **Realtime subscription** — Channel name conflicts? Missing filter?
- **State hydration** — Zustand persist middleware SSR issues? (use client directive missing?)
- **Modifier validation** — min_required/max_allowed constraints respected?

### Step 4: Verify Fix
- `npm run build` — catches TypeScript and Next.js errors
- `npm run lint` — catches code style issues
- Manual trace through the fixed code path

---

## 2. Feature Planning Workflow

When planning a new feature:

### Step 1: Scope Definition
- What does the feature do from the user's perspective?
- Which user type: Customer, Admin, or both?
- Does it need new database tables/columns?
- Does it need new API service functions?
- Does it need realtime updates?

### Step 2: Architecture Assessment
- **Database changes:** New tables/columns → create migration file
- **Type changes:** New interfaces → update `src/types/index.ts`
- **Service layer:** New data operations → add to `src/services/`
- **State management:** Client state needed → extend `src/store/cart.ts` or create new store
- **UI components:** New primitives → `src/components/ui/`, feature components → `src/features/<name>/`
- **Routes:** New page → `src/app/<route>/page.tsx`
- **Navigation:** Needs nav link → update `src/components/shared/navbar.tsx`

### Step 3: Impact Analysis
Check which existing files would be affected:
- Will this change the cart item structure? (affects store, checkout, order items)
- Will this change the order schema? (affects services, tracker, admin, types)
- Will this change the menu structure? (affects menu service, product card, customizer)
- Will this add new dependencies? (justify the addition)

### Step 4: Implementation Order
1. Database migration (if needed)
2. Type definitions
3. Service functions
4. Store changes (if needed)
5. Feature components
6. Page route
7. Navigation updates
8. Build verification

---

## 3. Performance Investigation Workflow

### Step 1: Identify the Bottleneck
- **Slow page load:** Check `fetchMenu()` — it fetches all 4 tables
- **Cart lag:** Check localStorage serialization in Zustand persist
- **Realtime delays:** Check Supabase channel subscription setup
- **Render performance:** Check for unnecessary re-renders in list components

### Step 2: Analyze
- Read the component's render logic and state dependencies
- Check for missing React performance patterns (memo, useMemo, useCallback)
- Check if data fetching could be server-side (currently all client-side)
- Check bundle size (lucide-react tree-shaking, unnecessary imports)

### Step 3: Propose Optimizations
- Prioritize by impact and implementation effort
- Avoid premature optimization
- Consider trade-offs (e.g., server-side rendering adds complexity)

---

## 4. Dependency Exploration Workflow

When evaluating whether to add a new dependency:

### Step 1: Justify the Need
- Can this be done with existing tools? (React, Tailwind, Supabase, Zustand)
- How much custom code would it replace?
- Is it actively maintained?

### Step 2: Assess Compatibility
- Check compatibility with: Next.js 15, React 19, Tailwind CSS 4
- Check bundle size impact
- Check if it works with "use client" components

### Step 3: Evaluate Alternatives
- Built-in browser APIs
- Existing utilities in `src/lib/utils.ts`
- Smaller alternatives with fewer dependencies

---

## 5. Database Schema Research Workflow

When investigating or modifying the database:

### Step 1: Read the Schema
- `supabase/migrations/001_initial_schema.sql` — full table definitions
- `supabase/migrations/002_seed_data.sql` — example data showing expected values

### Step 2: Understand Relationships
```
categories ─1:N─ products ─1:N─ modifier_groups ─1:N─ modifier_options

orders ─1:N─ order_items ──references──> products
```

### Step 3: Check Constraints
- NOT NULL columns
- CHECK constraints (status values, fulfillment types)
- Foreign key CASCADE behavior (order_items cascade on order delete)
- RLS policies (who can read/write what)

### Step 4: Plan Changes
- Always create a new migration file (never modify existing ones)
- Consider backward compatibility with existing data
- Update TypeScript types to match schema changes
- Update service functions to use new columns/tables
