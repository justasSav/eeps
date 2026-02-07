# supabase/ — Database Schema & Seed Data

## migrations/

SQL migration files executed in order. These define the full database schema.

### 001_initial_schema.sql

Creates all tables, indexes, RLS policies, and triggers.

**Tables:**
- `categories` — Menu sections (Pizzas, Kebabs, Sides, Drinks)
- `products` — Menu items with base_price, dietary_tags, availability flag
- `modifier_groups` — Customization categories per product (Size, Crust, Toppings, Bread, Salad, Sauce)
- `modifier_options` — Individual choices within groups, each with a price_mod adjustment
- `orders` — Customer orders with status lifecycle and delivery details
- `order_items` — Denormalized line items with snapshot of product data at order time

**Row-Level Security:**
- All tables have RLS enabled
- Menu tables (categories, products, modifier_groups, modifier_options): public read access
- Orders/items: users can only read/create their own (filtered by `user_id`)

**Key Design Decisions:**
- `base_price` and `price_mod` are INTEGER (pence) — no floating point
- `orders.status` uses CHECK constraint: `CREATED|ACCEPTED|PREPARING|READY|COMPLETED|CANCELLED`
- `orders.fulfillment_type` uses CHECK constraint: `delivery|pickup`
- `orders.delivery_address` is JSONB (nullable for pickup orders)
- `order_items.modifiers` is JSONB — flexible storage for varying modifier structures
- `updated_at` trigger auto-fires on order updates

### 002_seed_data.sql

Populates the menu with realistic data:

**4 Categories:** Pizzas, Kebabs, Sides, Drinks

**16 Products:** 4 pizzas, 4 kebabs, 4 sides, 4 drinks with prices from £1.00 to £11.99

**Modifier Groups:**
- Pizzas: Size (required), Crust (required), Extra Toppings (optional, up to 5)
- Kebabs: Bread (required), Salad (optional, up to 6), Sauce (optional, up to 3)
- Sides/Drinks: no modifiers

**Modifier Options:** ~40+ options with price adjustments:
- Size upgrades: 12" (+£2.00), 14" (+£4.00)
- Stuffed Crust: +£2.00
- Extra toppings: £1.00–£2.50 each
- Naan bread: +£1.00
- Salads and sauces: free (£0.00 price_mod)

## Adding New Menu Items

1. Add product INSERT to `002_seed_data.sql` (or create `003_new_items.sql`)
2. Use existing category UUIDs or create new categories
3. Add modifier_groups if the product needs customization
4. Add modifier_options for each group
5. Price values are always in pence (e.g., 899 = £8.99)
