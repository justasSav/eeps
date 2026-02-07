# CLAUDE.md

This file provides guidance for AI assistants working in this repository.

## Project Overview

**EEPS** is a mobile-first digital ordering system for a local pizza and kebab shop. Built with Next.js 15, React 19, TypeScript, Tailwind CSS 4, and Supabase (PostgreSQL backend). Licensed under MIT (2026).

## Repository Structure

```
eeps/
├── CLAUDE.md
├── LICENSE
├── .env.example             # Required env vars template
├── next.config.ts           # Next.js configuration
├── tsconfig.json            # TypeScript config
├── postcss.config.mjs       # PostCSS + Tailwind CSS 4
├── package.json
├── supabase/
│   └── migrations/          # SQL schema and seed data
│       ├── 001_initial_schema.sql
│       └── 002_seed_data.sql
└── src/
    ├── app/                 # Next.js App Router pages
    │   ├── layout.tsx       # Root layout with Navbar
    │   ├── page.tsx         # Home — menu listing
    │   ├── globals.css      # Tailwind CSS entry
    │   ├── cart/            # Cart page
    │   ├── checkout/        # Checkout form
    │   ├── orders/          # Order history
    │   ├── tracking/[id]/   # Real-time order tracking
    │   ├── admin/           # Admin dashboard
    │   └── auth/login/      # Login page (no signup)
    ├── components/
    │   ├── ui/              # Reusable UI primitives (button, input, badge, textarea)
    │   └── shared/          # Navbar, Loader, StatusBadge
    ├── features/
    │   ├── menu/            # MenuList, ProductCard, CategoryFilter
    │   ├── customizer/      # ProductCustomizer (pizza/kebab builder)
    │   ├── cart/            # CartView, CartItemRow
    │   ├── orders/          # CheckoutForm, OrderTracker, OrderHistory
    │   └── admin/           # AdminDashboard
    ├── hooks/               # useRealtime, useLocalStorage
    ├── lib/                 # Supabase client, cn(), formatPrice(), pricing utils
    ├── services/            # API layer (menu fetching, order CRUD)
    ├── store/               # Zustand cart store with localStorage persistence
    └── types/               # TypeScript interfaces
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

- **Framework:** Next.js 15 (App Router)
- **UI:** React 19, Tailwind CSS 4, shadcn/ui-style components
- **State:** Zustand with persist middleware
- **Backend:** Supabase (PostgreSQL, Auth, Realtime)
- **Icons:** lucide-react
- **Utilities:** clsx, tailwind-merge, class-variance-authority

## Database

SQL migrations are in `supabase/migrations/`. Tables: categories, products, modifier_groups, modifier_options, orders, order_items. Row-Level Security is enabled on all tables.

## Code Style and Conventions

- Mobile-first Tailwind CSS (unprefixed = mobile, `sm:` / `md:` for larger)
- Feature-based directory structure under `src/features/`
- Prices stored as integers (pence/cents) to avoid floating-point errors
- `"use client"` directive on all interactive components

## Git Workflow

- **Main branch:** `main`
- **Commit messages:** Use clear, descriptive messages summarizing the change

## Key Conventions for AI Assistants

- Read existing code before making changes
- Keep changes minimal and focused on the task at hand
- Do not introduce new dependencies without justification
- Prices are always integers (pence). Use `formatPrice()` from `@/lib/utils` for display
- Cart items are keyed by product ID + serialized modifiers via `generateCartKey()`
- No signup flow — authentication is login-only
