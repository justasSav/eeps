# src/lib/ — Utilities & Client Setup

## supabase.ts — Supabase Client

Initializes and exports the Supabase client singleton:

```typescript
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
```

- Uses public anon key (safe for client-side)
- Row-Level Security policies enforce access control at the database level
- Imported by `services/menu.ts`, `services/orders.ts`, `hooks/useRealtime.ts`, and `auth/login/page.tsx`

## utils.ts — Helper Functions

### `cn(...inputs: ClassValue[]): string`
Merges CSS class names using clsx + tailwind-merge. Prevents conflicting Tailwind classes (e.g., `cn("px-2", "px-4")` → `"px-4"`).

Used by every UI component for className composition.

### `formatPrice(pence: number): string`
Converts integer pence to display string with pound sign.
- `formatPrice(1099)` → `"£10.99"`
- `formatPrice(0)` → `"£0.00"`

All prices in the app are stored as integers (pence) to avoid floating-point rounding errors. This function is the single point of conversion to human-readable format.

### `calculateModifiersCost(modifiers: OrderItemModifiers, groups: ModifierGroup[]): number`
Calculates total price adjustment from selected modifiers.
- Iterates over selected modifier values
- Looks up `price_mod` from the matching `ModifierOption` in the group
- Handles both single-select (string value) and multi-select (string[] value)
- Returns total adjustment in pence (can be 0 if all modifiers are free)

### `generateCartKey(productId: string, modifiers: OrderItemModifiers): string`
Creates a unique identifier for cart items: `productId::JSON.stringify(modifiers)`
- Two items with same product but different modifiers get different keys
- Two items with same product AND same modifiers get the same key (merged in cart)
- Modifier keys are sorted for consistent serialization
