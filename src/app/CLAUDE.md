# src/app/ — Next.js App Router Pages

This directory contains all route pages using the Next.js 15 App Router convention.

## How It Works

Each subdirectory maps to a URL route. The `page.tsx` file in each directory is the page component rendered at that route.

### Route Map

| Route | File | Component Rendered | Purpose |
|-------|------|-------------------|---------|
| `/` | `page.tsx` | `<MenuList />` | Home page — browse menu |
| `/cart` | `cart/page.tsx` | `<CartView />` | Shopping cart |
| `/checkout` | `checkout/page.tsx` | `<CheckoutForm />` | Order form |
| `/orders` | `orders/page.tsx` | `<OrderHistory />` | Past orders list |
| `/tracking/:id` | `tracking/[id]/page.tsx` | `<OrderTracker />` | Real-time order tracking |
| `/admin` | `admin/page.tsx` | `<AdminDashboard />` | Staff order management |
| `/auth/login` | `auth/login/page.tsx` | Login form (inline) | Admin login |

### Root Layout (`layout.tsx`)

- Sets page metadata (title, description)
- Renders `<Navbar />` (sticky header) above all pages
- Wraps content in `<main>` with `max-w-lg mx-auto` (mobile-optimized)
- Background: `bg-gray-50`

### Global Styles (`globals.css`)

Single line: `@import "tailwindcss"` — this is the Tailwind CSS 4 syntax.

## Key Patterns

- **Page components are thin.** Each `page.tsx` just renders the corresponding feature component.
- **Dynamic routes** use the `[param]` folder convention. `tracking/[id]/page.tsx` receives `params.id`.
- **Next.js 15 async params:** The `params` prop is awaited: `const { id } = await params;`
- **No API routes.** All data access goes through Supabase client directly in services.
- **No server components doing data fetching.** All pages render client components that fetch on mount.

## Adding a New Page

1. Create `src/app/<route>/page.tsx`
2. Create the feature component in `src/features/<domain>/`
3. Import and render the feature component from the page
4. Add navigation link in `src/components/shared/navbar.tsx` if needed
