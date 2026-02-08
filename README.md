# EEPS

A mobile-first digital ordering system for a local pizza and kebab shop. Customers browse the menu, customize items, add to cart, checkout, and track orders in real-time. An admin dashboard lets staff manage incoming orders through their lifecycle.

Live site: [https://justassav.github.io/eeps/](https://justassav.github.io/eeps/)

## Tech Stack

- **Framework:** Next.js 15 (App Router) with React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4 (mobile-first)
- **State:** Zustand with localStorage persistence
- **Backend:** Supabase (PostgreSQL, Auth, Realtime)
- **Icons:** lucide-react
- **Deployment:** GitHub Pages via GitHub Actions

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com/) project

### Installation

```bash
git clone https://github.com/justasSav/eeps.git
cd eeps
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Deployment

The project is configured to deploy automatically to GitHub Pages on every push to `main`.

### Setup

1. Go to your repository **Settings > Pages > Source** and select **GitHub Actions**
2. Add repository secrets under **Settings > Secrets and variables > Actions**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Push to `main` -- the workflow in `.github/workflows/deploy.yml` builds and deploys the static site

The Next.js app is configured with `output: "export"` for static generation, and the base path is set automatically by the GitHub Pages action.

## Features

- Menu browsing with search and category filtering
- Item customization (pizza sizes/toppings, kebab bread/salad/sauce)
- Shopping cart with modifier-aware deduplication
- Checkout with delivery and collection options
- Real-time order tracking via Supabase Realtime
- Admin dashboard for order management

## Admin Area

The admin dashboard is available at [/admin](https://justassav.github.io/eeps/admin). Staff use it to manage incoming orders in real time. Each order card displays the order ID, fulfillment type (delivery or collection), contact phone, delivery address, line items with prices, optional notes, and the total amount. Staff can advance an order through the status lifecycle (`CREATED → ACCEPTED → PREPARING → READY → COMPLETED`) or cancel it at any stage. The dashboard only shows active (non-completed, non-cancelled) orders, sorted oldest-first so the most urgent orders appear at the top.

## Database

SQL migrations are in `supabase/migrations/`. The schema includes tables for categories, products, modifier groups, modifier options, orders, and order items -- all with row-level security.

**Order status lifecycle:** `CREATED -> ACCEPTED -> PREPARING -> READY -> COMPLETED` (or `CANCELLED`)

## License

MIT
