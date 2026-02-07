# src/store/ — State Management

## cart.ts — Zustand Cart Store

The cart is managed by a Zustand store with the `persist` middleware, which automatically serializes state to localStorage under the key `"pizza-kebab-cart"`.

### State Shape

```typescript
{
  items: CartItem[]           // All items in cart
  fulfillment_type: "pickup" | "delivery"
  delivery_address: DeliveryAddress | null
  contact_phone: string
  notes: string
}
```

### Actions

| Action | Behavior |
|--------|----------|
| `addItem(item)` | Generates `cart_key` via `generateCartKey()`. If key exists, increments quantity. Otherwise appends new item. |
| `removeItem(cartKey)` | Removes item by its cart key |
| `updateQuantity(cartKey, qty)` | Sets quantity. If qty <= 0, removes item. Recalculates `item_total`. |
| `clearCart()` | Resets all state to defaults |
| `setFulfillmentType(type)` | Sets pickup or delivery |
| `setDeliveryAddress(addr)` | Sets delivery address object |
| `setContactPhone(phone)` | Sets phone number |
| `setNotes(notes)` | Sets order notes |
| `getTotal()` | Returns sum of all `item_total` values |
| `getItemCount()` | Returns sum of all `quantity` values |

### Cart Key Strategy

Items are uniquely identified by `productId::JSON.stringify(sortedModifiers)`. This means:
- Same pizza, same size, same toppings → merged (quantity incremented)
- Same pizza, different size → separate line items
- This is handled by `generateCartKey()` in `lib/utils.ts`

### Persistence

The `persist` middleware handles:
- Auto-save to `localStorage` on every state change
- Auto-load from `localStorage` on app initialization
- Cart survives page refreshes and browser restarts

### Used By

- `Navbar` — reads `getItemCount()` for cart badge
- `ProductCustomizer` — calls `addItem()`
- `CartView` — reads `items`, calls `removeItem()`, `clearCart()`
- `CartItemRow` — calls `updateQuantity()`, `removeItem()`
- `CheckoutForm` — reads full state, calls `clearCart()` after submit
