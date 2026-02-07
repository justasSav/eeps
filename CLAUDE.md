# CLAUDE.md

This file provides guidance for AI assistants working in this repository.

## Project Overview

**EEPS** is a mobile-first digital ordering system for a local pizza and kebab shop. Built with Next.js 15, React 19, TypeScript, Tailwind CSS 4, and Supabase (PostgreSQL backend). Licensed under MIT (2026).

Customers browse a menu, customize items (pizza sizes/toppings, kebab bread/salad/sauce), add to cart, checkout, and track orders in real-time. An admin dashboard lets staff manage incoming orders through their lifecycle.

## Repository Structure

```
eeps/
├── CLAUDE.md                        # This file — AI assistant guidance
├── LICENSE                          # MIT license
├── .env.example                     # Required env vars template
├── .claude/
│   ├── settings.json                # Claude Code project settings
│   ├── commands/                    # Custom slash commands
│   │   ├── add-feature.md           # /add-feature — scaffold a new feature
│   │   ├── debug-order-flow.md      # /debug-order-flow — trace order issues
│   │   ├── db-migration.md          # /db-migration — create SQL migration
│   │   ├── add-product.md           # /add-product — add menu item to seed data
│   │   └── review-component.md      # /review-component — review a component
│   └── agents/                      # Agent definitions for research & coding
│       ├── research-plan.md         # Research plan for investigating issues
│       └── coding-agents.md         # Coding agent workflows
├── next.config.ts                   # Next.js config (image remotePatterns)
├── tsconfig.json                    # TypeScript config (strict, path alias @/*)
├── postcss.config.mjs               # PostCSS — Tailwind CSS 4 plugin
├── package.json                     # Dependencies & scripts
├── supabase/
│   └── migrations/                  # SQL schema and seed data
│       ├── 001_initial_schema.sql   # Tables, RLS policies, triggers
│       └── 002_seed_data.sql        # Menu categories, products, modifiers
└── src/
    ├── app/                         # Next.js App Router pages
    │   ├── layout.tsx               # Root layout (Navbar + main container)
    │   ├── page.tsx                 # Home — menu listing
    │   ├── globals.css              # Tailwind CSS entry (@import "tailwindcss")
    │   ├── cart/page.tsx            # Cart page
    │   ├── checkout/page.tsx        # Checkout form
    │   ├── orders/page.tsx          # Order history
    │   ├── tracking/[id]/page.tsx   # Real-time order tracking (dynamic route)
    │   ├── admin/page.tsx           # Admin dashboard
    │   └── auth/login/page.tsx      # Login page (no signup)
    ├── components/
    │   ├── ui/                      # Reusable UI primitives (CVA pattern)
    │   │   ├── button.tsx           # Button with variants & sizes
    │   │   ├── input.tsx            # Text input
    │   │   ├── badge.tsx            # Tag/status badges
    │   │   └── textarea.tsx         # Multi-line input
    │   └── shared/                  # Application-level shared components
    │       ├── navbar.tsx           # Sticky header with cart badge
    │       ├── loader.tsx           # Animated spinner
    │       └── status-badge.tsx     # Order status label + color
    ├── features/                    # Feature modules (domain-organized)
    │   ├── menu/                    # Menu browsing
    │   │   ├── menu-list.tsx        # Main menu with search & category filter
    │   │   ├── product-card.tsx     # Product preview card
    │   │   └── category-filter.tsx  # Horizontal category pill buttons
    │   ├── customizer/              # Item customization
    │   │   └── product-customizer.tsx  # Modal: modifier selection + quantity
    │   ├── cart/                    # Shopping cart
    │   │   ├── cart-view.tsx        # Cart page with item list & total
    │   │   └── cart-item-row.tsx    # Individual cart item with controls
    │   ├── orders/                  # Order lifecycle
    │   │   ├── checkout-form.tsx    # Checkout: fulfillment, address, submit
    │   │   ├── order-history.tsx    # Past orders list
    │   │   └── order-tracker.tsx    # Real-time progress tracking
    │   └── admin/                   # Staff order management
    │       └── admin-dashboard.tsx  # Active orders with status controls
    ├── hooks/                       # Custom React hooks
    │   ├── useRealtime.ts           # Supabase realtime subscription
    │   └── useLocalStorage.ts       # Browser localStorage wrapper
    ├── lib/                         # Utilities & client setup
    │   ├── supabase.ts              # Supabase client (anon key)
    │   └── utils.ts                 # cn(), formatPrice(), calculateModifiersCost(), generateCartKey()
    ├── services/                    # API / data access layer
    │   ├── menu.ts                  # fetchMenu() — nested category structure
    │   └── orders.ts                # submitOrder(), fetchOrder(), updateOrderStatus(), etc.
    ├── store/                       # Client state management
    │   └── cart.ts                  # Zustand store with localStorage persistence
    └── types/                       # TypeScript interfaces
        └── index.ts                 # Product, Category, Order, CartItem, etc.
```

## Development Setup

- **Runtime:** Node.js 18+
- **Package manager:** npm
- **Install:** `npm install`
- **Dev server:** `npm run dev`
- **Build:** `npm run build`
- **Lint:** `npm run lint`

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 15 (App Router) | All pages under `src/app/` |
| UI | React 19 + Tailwind CSS 4 | Mobile-first, max-w-lg container |
| Components | CVA + clsx + tailwind-merge | shadcn/ui-style variant pattern |
| State | Zustand + persist middleware | Cart state in localStorage |
| Backend | Supabase (PostgreSQL) | Auth, Realtime, RLS |
| Icons | lucide-react | Consistent icon set |

## Database

SQL migrations live in `supabase/migrations/`. Six tables with RLS:

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `categories` | Menu groups | name, sort_order |
| `products` | Menu items | name, base_price (pence), dietary_tags[], is_available |
| `modifier_groups` | Customization groups | min_required, max_allowed (validation rules) |
| `modifier_options` | Individual options | name, price_mod (pence adjustment) |
| `orders` | Customer orders | status (lifecycle), fulfillment_type, delivery_address (JSONB) |
| `order_items` | Line items per order | modifiers (JSONB), item_total (denormalized) |

**Order status lifecycle:** `CREATED → ACCEPTED → PREPARING → READY → COMPLETED` (or `CANCELLED`)

## Architecture & Data Flow

### Menu Loading
```
fetchMenu() → 4 parallel Supabase queries → client-side aggregation
→ Category[] with nested products[].modifier_groups[].options[]
```

### Add to Cart
```
ProductCard click → ProductCustomizer modal → modifier selection
→ useCartStore.addItem() → generateCartKey() deduplication → localStorage
```

### Order Submission
```
CheckoutForm submit → submitOrder() → INSERT orders + order_items
→ clearCart() → redirect to /tracking/{orderId}
```

### Real-time Tracking
```
useRealtime("orders", {id: orderId}) → Supabase PostgreSQL changes
→ status updates pushed to OrderTracker + AdminDashboard simultaneously
```

## Code Style and Conventions

- **Mobile-first CSS:** Unprefixed = mobile, `sm:` / `md:` for larger breakpoints
- **Feature-based structure:** Domain logic in `src/features/`, not by file type
- **Prices as integers:** All monetary values in pence. Use `formatPrice()` for display
- **`"use client"` directive:** Required on all interactive components
- **CVA pattern:** UI primitives use class-variance-authority for type-safe variants
- **Cart key generation:** `generateCartKey(productId, modifiers)` creates unique keys for deduplication
- **No signup flow:** Authentication is login-only (admin use)

## Key Utilities Reference

| Function | Location | Purpose |
|----------|----------|---------|
| `cn(...classes)` | `lib/utils.ts` | Tailwind-aware class merging (clsx + twMerge) |
| `formatPrice(pence)` | `lib/utils.ts` | `1099 → "£10.99"` |
| `calculateModifiersCost(mods, groups)` | `lib/utils.ts` | Sum price_mod for selected options |
| `generateCartKey(id, mods)` | `lib/utils.ts` | Unique cart item identifier |
| `useRealtime(table, filter, cb)` | `hooks/useRealtime.ts` | Subscribe to Supabase realtime |
| `useCartStore` | `store/cart.ts` | Zustand cart state & actions |

## Git Workflow

- **Main branch:** `main`
- **Commit messages:** Clear, descriptive messages summarizing the change
- **Feature branches:** `claude/<description>-<id>` for AI-generated changes

## Key Conventions for AI Assistants

1. **Read before writing.** Always read existing code before making changes.
2. **Minimal changes.** Keep changes focused on the task. No drive-by refactors.
3. **No new dependencies** without justification.
4. **Prices are integers** (pence). Never use floats for money. Use `formatPrice()` for display.
5. **Cart deduplication** uses `generateCartKey()` — same product + same modifiers = merged item.
6. **No signup flow** — authentication is login-only for admin access.
7. **All interactive components** need `"use client"` at the top.
8. **Tailwind CSS 4** — uses `@import "tailwindcss"` syntax, not v3 `@tailwind` directives.
9. **Test with `npm run build`** to catch TypeScript and Next.js errors.
10. **Modifier validation:** Respect `min_required` and `max_allowed` constraints from modifier_groups.
