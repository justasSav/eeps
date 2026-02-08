# CLAUDE.md

This file provides guidance for AI assistants working in this repository.

## Project Overview

**EEPS** is a mobile-first digital ordering system for a local pizza and kebab shop. Built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, and Zustand (client-side state with localStorage persistence). Licensed under MIT (2026).

Customers browse a menu, add items to cart, checkout (delivery or pickup), and track orders via a 3-digit order code. An admin dashboard lets staff manage incoming orders through their lifecycle. All data is stored client-side in localStorage — there is no backend database.

> **Note:** The codebase was originally designed for Supabase (PostgreSQL) but has been transitioned to a fully client-side architecture. Stub files remain at `lib/supabase.ts`, `services/orders.ts`, and `hooks/useRealtime.ts` as empty placeholders. SQL migrations in `supabase/migrations/` document the original schema design but are not used by the running application.

## Repository Structure

```
eeps/
├── CLAUDE.md                        # This file — AI assistant guidance
├── LICENSE                          # MIT license
├── .claude/
│   ├── settings.json                # Claude Code project settings
│   ├── mcp.json                     # MCP server config (Playwright)
│   ├── commands/                    # Custom slash commands
│   │   ├── add-feature.md           # /add-feature — scaffold a new feature
│   │   ├── debug-order-flow.md      # /debug-order-flow — trace order issues
│   │   ├── db-migration.md          # /db-migration — create SQL migration (future use)
│   │   ├── add-product.md           # /add-product — add menu item to hardcoded data
│   │   ├── review-component.md      # /review-component — review a component
│   │   └── audit-codebase.md        # /audit-codebase — verify prompts match code
│   └── agents/                      # Agent definitions for research & coding
│       ├── research-plan.md         # Research plan for investigating issues
│       ├── coding-agents.md         # Coding agent workflows
│       └── ui-testing-agent.md      # UI testing via Playwright MCP
├── next.config.ts                   # Next.js config (image remotePatterns)
├── tsconfig.json                    # TypeScript config (strict, path alias @/*)
├── postcss.config.mjs               # PostCSS — Tailwind CSS 4 plugin
├── package.json                     # Dependencies & scripts
├── supabase/
│   └── migrations/                  # SQL schema (reference only, not used at runtime)
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
    │   ├── tracking/page.tsx        # Order tracking (query param: ?id=CODE)
    │   └── admin/page.tsx           # Admin dashboard
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
    ├── data/                        # Hardcoded application data
    │   └── menu.ts                  # Full menu: categories + products (5 categories, 25+ items)
    ├── features/                    # Feature modules (domain-organized)
    │   ├── menu/                    # Menu browsing
    │   │   ├── menu-list.tsx        # Main menu with search & category filter
    │   │   ├── product-card.tsx     # Product preview card with "Add" button
    │   │   └── category-filter.tsx  # Horizontal category pill buttons
    │   ├── cart/                    # Shopping cart
    │   │   ├── cart-view.tsx        # Cart page with item list & total
    │   │   └── cart-item-row.tsx    # Individual cart item with controls
    │   ├── orders/                  # Order lifecycle
    │   │   ├── checkout-form.tsx    # Checkout: fulfillment, address, submit
    │   │   ├── order-history.tsx    # Past orders list
    │   │   └── order-tracker.tsx    # Order progress tracking by code
    │   └── admin/                   # Staff order management
    │       └── admin-dashboard.tsx  # Active orders with status controls
    ├── hooks/                       # Custom React hooks
    │   ├── useRealtime.ts           # (empty stub — Supabase removed)
    │   └── useLocalStorage.ts       # Browser localStorage wrapper
    ├── lib/                         # Utilities & client setup
    │   ├── supabase.ts              # (empty stub — Supabase removed)
    │   └── utils.ts                 # cn(), formatPrice(), generateCartKey()
    ├── services/                    # Data access layer
    │   ├── menu.ts                  # getMenu() — returns hardcoded Category[]
    │   └── orders.ts                # (empty stub — order logic moved to store/orders.ts)
    ├── store/                       # Client state management (Zustand)
    │   ├── cart.ts                  # Cart store with localStorage persistence
    │   └── orders.ts                # Order store: submit, track, update status
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

No environment variables are required. The app runs entirely client-side with hardcoded menu data and localStorage persistence.

### GitHub CLI (`gh`)

When working with GitHub issues or pull requests, install the GitHub CLI first:

```bash
# Fix /tmp permissions if needed (common in containerized environments)
chmod 1777 /tmp
apt-get update -qq && apt-get install -y -qq gh
```

The `gh` command is used to fetch issue details (`gh api repos/<owner>/<repo>/issues/<number>`), create PRs, and interact with GitHub. Always install it as a prerequisite before any GitHub issue-related work.

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 16 (App Router) | All pages under `src/app/` |
| UI | React 19 + Tailwind CSS 4 | Mobile-first, max-w-lg container |
| Components | CVA + clsx + tailwind-merge | shadcn/ui-style variant pattern |
| State | Zustand + persist middleware | Cart + orders in localStorage |
| Data | Hardcoded in `src/data/menu.ts` | No backend database at runtime |
| Icons | lucide-react | Consistent icon set |
| Language | Lithuanian (LT) | All UI labels are in Lithuanian |

## Data Architecture

### Menu Data

Menu is hardcoded in `src/data/menu.ts` as a `Category[]` array. Each category contains nested products. There are no modifier groups or customization options — products are added directly to cart at their base price.

**5 categories, 25+ products:**
- **Picos** (Pizzas) — 9 items, €8.00–€10.00
- **Kebabai** (Kebabs) — 6 items, €5.00–€7.00
- **Mėsainiai** (Burgers) — 3 items, €4.00–€5.00
- **Kiti patiekalai** (Other dishes) — 9 items, €2.00–€6.00
- **Gėrimai** (Drinks) — 5 items, €1.00–€3.50

### Order Storage

Orders are managed by a Zustand store (`src/store/orders.ts`) persisted to localStorage under the key `"eeps-orders"`. Order IDs are 3-digit codes (100–999), not UUIDs.

**Order status lifecycle:** `CREATED → ACCEPTED → PREPARING → READY → COMPLETED` (or `CANCELLED`)

### Cart Storage

Cart is a Zustand store (`src/store/cart.ts`) persisted to localStorage under the key `"pizza-kebab-cart"`. Items are deduplicated by product ID.

## Architecture & Data Flow

### Menu Loading
```
getMenu() → returns hardcodedMenu from src/data/menu.ts → Category[]
```

### Add to Cart
```
ProductCard "Add" button → useCartStore.addItem()
→ generateCartKey(productId) deduplication → localStorage
```

### Order Submission
```
CheckoutForm submit → useOrderStore.submitOrder()
→ generates 3-digit code → persists to localStorage
→ clearCart() → redirect to /tracking?id={code}
```

### Order Tracking
```
/tracking?id=CODE → useOrderStore.getOrder(code)
→ displays order progress (5-step stepper)
```

### Admin Management
```
AdminDashboard → useOrderStore.getActiveOrders()
→ status buttons: Accept → Prepare → Ready → Complete (or Cancel)
→ useOrderStore.updateOrderStatus()
```

## Code Style and Conventions

- **Mobile-first CSS:** Unprefixed = mobile, `sm:` / `md:` for larger breakpoints
- **Feature-based structure:** Domain logic in `src/features/`, not by file type
- **Prices as integers:** All monetary values in cents. Use `formatPrice()` for display (e.g., `800 → "€8.00"`)
- **`"use client"` directive:** Required on all interactive components
- **CVA pattern:** UI primitives use class-variance-authority for type-safe variants
- **Cart key generation:** `generateCartKey(productId)` creates unique keys for deduplication
- **Lithuanian UI:** All user-facing labels and messages are in Lithuanian

## Key Utilities Reference

| Function | Location | Purpose |
|----------|----------|---------|
| `cn(...classes)` | `lib/utils.ts` | Tailwind-aware class merging (clsx + twMerge) |
| `formatPrice(cents)` | `lib/utils.ts` | `800 → "€8.00"` |
| `generateCartKey(productId)` | `lib/utils.ts` | Unique cart item identifier (returns productId) |
| `useCartStore` | `store/cart.ts` | Zustand cart state & actions |
| `useOrderStore` | `store/orders.ts` | Zustand order state: submit, track, update |
| `useLocalStorage(key, initial)` | `hooks/useLocalStorage.ts` | Generic localStorage hook |

## Git Workflow

- **Main branch:** `main`
- **Commit messages:** Clear, descriptive messages summarizing the change
- **Feature branches:** `claude/<description>-<id>` for AI-generated changes

## Key Conventions for AI Assistants

1. **Read before writing.** Always read existing code before making changes.
2. **Minimal changes.** Keep changes focused on the task. No drive-by refactors.
3. **No new dependencies** without justification.
4. **Prices are integers** (cents). Never use floats for money. Use `formatPrice()` for display.
5. **Cart deduplication** uses `generateCartKey(productId)` — same product ID = merged item.
6. **All interactive components** need `"use client"` at the top.
7. **Tailwind CSS 4** — uses `@import "tailwindcss"` syntax, not v3 `@tailwind` directives.
8. **Test with `npm run build`** to catch TypeScript and Next.js errors.
9. **No backend** — all state is client-side. Add products to `src/data/menu.ts`, not SQL.
10. **Lithuanian language** — all UI text should be in Lithuanian to match existing patterns.
