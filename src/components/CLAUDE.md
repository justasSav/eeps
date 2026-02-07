# src/components/ — Reusable Components

This directory contains components shared across the application, split into two categories.

## ui/ — Primitive UI Components

Low-level, design-system components using the CVA (class-variance-authority) pattern. These are styled with Tailwind CSS and provide type-safe variant props.

### button.tsx
- **Variants:** `default` (orange), `secondary` (gray), `outline`, `ghost`, `destructive` (red)
- **Sizes:** `default` (h-10), `sm` (h-8), `lg` (h-12), `icon` (h-10 w-10)
- Uses `React.forwardRef` for ref forwarding
- Orange focus ring (`ring-orange-500`)

### input.tsx
- Standard text input with orange focus ring
- Disabled state: `cursor-not-allowed`, `opacity-50`
- Uses `React.forwardRef`

### badge.tsx
- **Variants:** `default` (orange), `vegetarian` (green), `spicy` (red), `status` (blue)
- Used for dietary tags on products and status indicators
- Pill shape with `rounded-full`

### textarea.tsx
- Multi-line input, `min-h-[80px]`
- Used in checkout for order notes

## shared/ — Application Components

Higher-level components used across multiple features.

### navbar.tsx
- Sticky header (`sticky top-0 z-50`)
- Logo text "EEPS" links to home
- Navigation icons: Orders, Admin, Cart
- Cart icon shows dynamic badge with item count from `useCartStore`
- Uses `"use client"` — accesses Zustand store

### loader.tsx
- Animated `Loader2` icon (lucide-react) with `animate-spin`
- Orange color, centered layout
- Used as loading state in all data-fetching components

### status-badge.tsx
- Maps `OrderStatus` enum to human labels and Tailwind colors
- CREATED → "Submitted" (gray), ACCEPTED → "Accepted" (blue), PREPARING → "In the Kitchen" (yellow), READY → "Ready" (green), COMPLETED → "Completed" (gray), CANCELLED → "Cancelled" (red)

## Pattern: Adding a New UI Component

1. Create file in `src/components/ui/<name>.tsx`
2. Use CVA for variants: `const variants = cva("base-classes", { variants: { ... } })`
3. Export with `React.forwardRef` and extend native HTML element props
4. Use `cn()` from `@/lib/utils` to merge custom classNames
