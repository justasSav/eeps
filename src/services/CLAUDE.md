# src/services/ — Data Access Layer

This layer abstracts all Supabase database operations. Components never call Supabase directly — they go through these service functions.

## menu.ts — Menu Fetching

### `fetchMenu(): Promise<Category[]>`

Fetches the entire menu structure in 4 parallel Supabase queries:
1. `categories` — ordered by `sort_order`
2. `products` — filtered by `is_available = true`
3. `modifier_groups` — ordered by `sort_order`
4. `modifier_options` — ordered by `sort_order`

Then performs **client-side aggregation** to build the nested structure:
```
categories[].products[].modifier_groups[].options[]
```

This avoids complex joins and lets the client control the shape. The full menu is small enough (4 categories, ~16 products) to fetch entirely.

Called by: `MenuList` (on mount)

## orders.ts — Order CRUD

### `submitOrder(params): Promise<string>`
Creates a new order with its line items. Two Supabase inserts:
1. `orders` table — fulfillment type, status (CREATED), address, phone, notes, total
2. `order_items` table — one row per cart item with snapshot of product_name, base_price, modifiers, item_total

Returns the new order's UUID. Called by: `CheckoutForm`

### `fetchUserOrders(userId): Promise<Order[]>`
Fetches all orders for a user, joining with `order_items`. Ordered by `created_at DESC` (newest first). RLS ensures users only see their own orders.

Called by: `OrderHistory`

### `fetchOrder(orderId): Promise<Order | null>`
Fetches a single order with all its items. Returns null if not found.

Called by: `OrderTracker`

### `updateOrderStatus(orderId, status): Promise<void>`
Updates the status field on an order. The database trigger automatically sets `updated_at`. This triggers a Supabase Realtime event that all subscribers receive.

Called by: `AdminDashboard` (Accept, Prepare, Ready, Complete, Cancel buttons)

### `fetchActiveOrders(): Promise<Order[]>`
Fetches orders with status in `[CREATED, ACCEPTED, PREPARING, READY]`. Ordered by `created_at ASC` (oldest first, so staff process in order). Excludes completed and cancelled orders.

Called by: `AdminDashboard`
