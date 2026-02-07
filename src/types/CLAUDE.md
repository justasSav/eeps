# src/types/ — TypeScript Interfaces

## index.ts — All Type Definitions

All domain types are defined in a single file. This is the source of truth for data shapes across the app.

### Enums / Unions

```typescript
OrderStatus = "CREATED" | "ACCEPTED" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED"
FulfillmentType = "delivery" | "pickup"
```

### Domain Types

| Type | Purpose | Key Fields |
|------|---------|------------|
| `ModifierOption` | Single selectable option | `id`, `name`, `price_mod` (pence) |
| `ModifierGroup` | Group of options (e.g., "Size") | `min_required`, `max_allowed`, `options[]` |
| `Product` | Menu item | `base_price` (pence), `dietary_tags[]`, `modifier_groups[]` |
| `Category` | Menu section | `sort_order`, `products[]` |
| `DeliveryAddress` | Delivery details | `street`, `city`, `postal_code`, `notes` |
| `OrderItem` | Line item in an order | `modifiers` (JSONB), `item_total` (pence) |
| `Order` | Full order record | `status`, `fulfillment_type`, `items[]`, `total_amount` |

### Cart Types

| Type | Purpose | Key Fields |
|------|---------|------------|
| `CartItem` | Item in shopping cart | `cart_key`, `product_id`, `modifiers`, `item_total` |
| `CartState` | Full cart state | `items[]`, `fulfillment_type`, `delivery_address`, `contact_phone` |
| `OrderItemModifiers` | Modifier selections map | `{ [groupName]: string \| string[] }` |

### Modifier Values

The `OrderItemModifiers` type uses a flexible structure:
- **Single-select** groups (max_allowed=1): value is a `string` (e.g., `{ "Size": "12 inch" }`)
- **Multi-select** groups (max_allowed>1): value is a `string[]` (e.g., `{ "Salad": ["Lettuce", "Tomato"] }`)
- This matches the JSONB storage format in the `order_items.modifiers` column
