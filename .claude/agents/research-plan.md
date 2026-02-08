# Research Plan — EEPS Codebase

This document defines structured research workflows for investigating issues, planning features, and understanding behavior in the EEPS ordering system.

> **Architecture note:** EEPS runs entirely client-side. Menu data is hardcoded in `src/data/menu.ts`. Orders and cart state are managed by Zustand stores persisted to localStorage. There is no backend database, no authentication, and no realtime subscriptions. Supabase stub files (`lib/supabase.ts`, `services/orders.ts`, `hooks/useRealtime.ts`) exist as empty placeholders.

---

## Prerequisites for GitHub Issue Work

When investigating or implementing a GitHub issue, install the GitHub CLI (`gh`) first:

```bash
chmod 1777 /tmp  # Fix /tmp permissions if needed
apt-get update -qq && apt-get install -y -qq gh
```

Then fetch the full issue details:

```bash
gh api repos/<owner>/<repo>/issues/<number>
```

Always read the complete issue description before starting work. After completing the task, verify all changes against the issue requirements.

---

## 1. Bug Investigation Workflow

When investigating a bug, follow this systematic approach:

### Step 1: Reproduce & Classify
- Identify the affected area: Menu, Cart, Checkout, Tracking, Admin, Order History
- Determine the type: UI glitch, state corruption, price calculation error, localStorage issue, build error
- Note the expected vs actual behavior

### Step 2: Trace the Data Flow
Map the data path for the affected feature:

| Area | Files to Read (in order) |
|------|-------------------------|
| Menu display | `data/menu.ts` → `services/menu.ts` → `features/menu/menu-list.tsx` → `features/menu/product-card.tsx` |
| Cart | `store/cart.ts` → `features/cart/cart-view.tsx` → `features/cart/cart-item-row.tsx` |
| Checkout | `store/cart.ts` → `features/orders/checkout-form.tsx` → `store/orders.ts` |
| Tracking | `store/orders.ts` → `app/tracking/page.tsx` → `features/orders/order-tracker.tsx` |
| Admin | `store/orders.ts` → `features/admin/admin-dashboard.tsx` |
| Order History | `store/orders.ts` → `features/orders/order-history.tsx` |

### Step 3: Check Common Failure Points
- **Price calculations** — Any floating-point operations instead of integer cents?
- **Cart key mismatch** — `generateCartKey(productId)` not deduplicating correctly?
- **Zustand hydration** — SSR/client mismatch with `persist` middleware? Missing `"use client"`?
- **localStorage** — Quota exceeded? JSON serialization failure? Stale data?
- **Order code collisions** — Only 900 possible codes (100–999). Multiple orders with same code?
- **Status transitions** — Admin dashboard status buttons mapping to wrong next status?
- **Query params** — Tracking page not reading `?id=` correctly?

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
- Does it need new data in `src/data/`?
- Does it need a new Zustand store in `src/store/`?
- Does it need new types in `src/types/index.ts`?

### Step 2: Architecture Assessment
- **Data changes:** Static data → add to `src/data/`. Dynamic state → create Zustand store in `src/store/`
- **Type changes:** New interfaces → update `src/types/index.ts`
- **Service layer:** Data access functions → add to `src/services/`
- **State management:** Client state → Zustand store with `persist` middleware for localStorage
- **UI components:** New primitives → `src/components/ui/`, feature components → `src/features/<name>/`
- **Routes:** New page → `src/app/<route>/page.tsx`
- **Navigation:** Needs nav link → update `src/components/shared/navbar.tsx`

### Step 3: Impact Analysis
Check which existing files would be affected:
- Will this change the cart item structure? (affects `store/cart.ts`, checkout, order items)
- Will this change the order schema? (affects `store/orders.ts`, tracker, admin, types)
- Will this change the menu structure? (affects `data/menu.ts`, menu service, product card)
- Will this add new dependencies? (justify the addition)

### Step 4: Implementation Order
1. Type definitions
2. Data files (if static data needed)
3. Zustand store (if client state needed)
4. Service functions
5. Feature components
6. Page route
7. Navigation updates
8. Build verification

---

## 3. Performance Investigation Workflow

### Step 1: Identify the Bottleneck
- **Slow page load:** Menu is hardcoded so should be instant — check component render logic
- **Cart lag:** Check localStorage serialization in Zustand persist
- **Re-render storms:** Check Zustand selector granularity (subscribing to entire store vs specific fields)
- **Bundle size:** Check lucide-react tree-shaking, unnecessary imports

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
- Can this be done with existing tools? (React, Tailwind, Zustand, browser APIs)
- How much custom code would it replace?
- Is it actively maintained?

### Step 2: Assess Compatibility
- Check compatibility with: Next.js 16, React 19, Tailwind CSS 4
- Check bundle size impact
- Check if it works with "use client" components

### Step 3: Evaluate Alternatives
- Built-in browser APIs
- Existing utilities in `src/lib/utils.ts`
- Smaller alternatives with fewer dependencies

---

## 5. Data Schema Research Workflow

When investigating or modifying data structures:

### Step 1: Read the Current Structures
- `src/types/index.ts` — all TypeScript interfaces (Product, Category, Order, CartItem, etc.)
- `src/data/menu.ts` — hardcoded menu with 5 categories and 25+ products
- `src/store/cart.ts` — cart state shape and actions
- `src/store/orders.ts` — order state shape and actions

### Step 2: Understand Relationships
```
Category[] → each contains Product[]
CartItem → references product_id from Product
Order → contains OrderItem[] (derived from CartItem at submission time)
```

### Step 3: Check Constraints
- Prices must be integers (cents)
- Order IDs are 3-digit string codes (100–999)
- Order status must be one of: CREATED, ACCEPTED, PREPARING, READY, COMPLETED, CANCELLED
- Fulfillment type must be "delivery" or "pickup"
- Cart items are deduplicated by `generateCartKey(productId)`

### Step 4: Plan Changes
- Update `src/types/index.ts` with new/modified interfaces
- Update affected data files (`src/data/`) or stores (`src/store/`)
- Update affected components that consume the changed types
- Run `npm run build` to catch type errors

### Reference: SQL Schema (not used at runtime)
The original database schema is documented in `supabase/migrations/001_initial_schema.sql` and `supabase/migrations/002_seed_data.sql`. These files describe a more complete schema with modifier groups, RLS policies, and UUID-based IDs that may be useful if a database backend is re-introduced.
