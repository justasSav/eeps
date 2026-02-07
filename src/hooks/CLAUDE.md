# src/hooks/ — Custom React Hooks

## useRealtime.ts

Subscribes to Supabase Realtime PostgreSQL changes on a table.

```typescript
useRealtime(
  table: string,              // e.g., "orders"
  filter: { column: string; value: string } | null,  // e.g., { column: "id", value: orderId }
  onUpdate: (payload: Record<string, unknown>) => void
): void
```

- Creates a Supabase channel subscription for `UPDATE` events
- If `filter` is provided, only listens for rows matching `column=eq.value`
- If `filter` is null, listens for all updates on the table
- Calls `onUpdate` with the new row data (`payload.new`)
- Cleans up subscription on component unmount
- Used by: `OrderTracker` (filtered by order ID), `AdminDashboard` (all orders)

## useLocalStorage.ts

Wrapper around `window.localStorage` with React state sync.

```typescript
useLocalStorage<T>(key: string, initialValue: T): [T, setValue]
```

- Returns `[storedValue, setValue]` tuple (same API as `useState`)
- Reads from localStorage on mount, falls back to `initialValue`
- Writes to localStorage on every `setValue` call
- Handles storage errors gracefully
- Note: The cart store uses Zustand's built-in persist middleware instead of this hook
