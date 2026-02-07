# src/features/ — Feature Modules

This directory organizes code by business domain. Each subdirectory contains the React components for a specific feature area. All components here use `"use client"`.

## menu/ — Menu Browsing

The customer-facing product catalog.

### menu-list.tsx (Main orchestrator)
- Fetches full menu via `fetchMenu()` on mount
- State: `categories`, `loading`, `activeCategory`, `searchQuery`, `selectedProduct`
- Renders `CategoryFilter` pills + filtered `ProductCard` grid
- Search filters product names (case-insensitive)
- Clicking "Add" on a card opens `ProductCustomizer` modal
- When `selectedProduct` is set, modal overlay appears

### product-card.tsx
- Displays: image thumbnail (optional), name, description (truncated), base price, dietary tags
- Price shown via `formatPrice()`
- Dietary tags rendered as colored `<Badge>` components
- "Add" button triggers `onSelect(product)` callback

### category-filter.tsx
- Horizontal scrollable row of pill buttons
- "All" button + one per category
- Active pill: orange background; inactive: gray
- `onSelect(categoryId | null)` callback

## customizer/ — Item Customization

### product-customizer.tsx (Full-screen modal)
- Fixed overlay (`z-50`, semi-transparent background)
- Renders all `modifier_groups` for the selected product
- **Single-select groups** (max_allowed=1): radio-button behavior (click toggles)
- **Multi-select groups** (max_allowed>1): checkbox behavior (toggle on/off, respect max)
- Validation: checks `min_required` for each group before enabling "Add to Cart"
- Quantity selector: `- / count / +` (min 1)
- Price display: `unitPrice = basePrice + modifiersCost`, `totalPrice = unitPrice * quantity`
- On confirm: calls `useCartStore.addItem()` then `onClose()`

## cart/ — Shopping Cart

### cart-view.tsx
- Lists all cart items via `CartItemRow` components
- Shows total via `useCartStore.getTotal()`
- Empty state: shopping cart icon + "Browse Menu" link
- "Clear all" button (destructive variant)
- "Proceed to Checkout" link to `/checkout`

### cart-item-row.tsx
- Displays: product name, formatted total, modifier summary
- Modifier summary: joins group selections as `"Group: opt1, opt2"` separated by ` · `
- Quantity controls: decrement/increment buttons, current count
- Delete button (trash icon, red)
- Recalculates `item_total` when quantity changes

## orders/ — Order Lifecycle

### checkout-form.tsx
- **Fulfillment toggle:** Pickup vs Delivery (two-button selector)
- **Phone field:** Required for all orders
- **Delivery address:** Conditional fields (street, city, postal code, delivery notes) — required when fulfillment = "delivery"
- **Order notes:** Optional textarea for special requests
- **Order summary:** Table of items with quantities, modifiers, prices
- Validation before submit: phone required, address fields if delivery
- On submit: `submitOrder()` → clears cart → redirects to `/tracking/{orderId}`
- Error state: red alert box

### order-history.tsx
- Fetches all orders for user "guest" via `fetchUserOrders()`
- Each order card links to `/tracking/{id}`
- Shows: order ID (8 chars), status badge, date/time, item count, total
- Empty state: clipboard icon + "Browse Menu"

### order-tracker.tsx
- Fetches single order via `fetchOrder(orderId)`
- Subscribes to realtime updates via `useRealtime("orders", {column: "id", value: orderId})`
- **Progress visualization:** 5 steps (CREATED → COMPLETED)
  - Completed: orange circle + checkmark
  - Current: orange circle + number, bold label
  - Future: gray circle + number
- Cancelled orders show red alert instead of progress
- Order details section: items, address, phone, total

## admin/ — Staff Management

### admin-dashboard.tsx
- Fetches active orders (status in: CREATED, ACCEPTED, PREPARING, READY)
- Realtime listener on all orders table → auto-reloads on any update
- Each order card shows: ID, fulfillment badge, status, time, phone, address, items, notes, total
- **Action buttons per order:**
  - Cancel (red, destructive)
  - Next status button (dynamic label: "Accept" → "Start Preparing" → "Mark Ready" → "Complete")
- `nextStatus` mapping: `{ CREATED: ACCEPTED, ACCEPTED: PREPARING, PREPARING: READY, READY: COMPLETED }`
- Manual refresh button in header
