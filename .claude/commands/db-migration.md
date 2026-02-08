# Database Migration

Create a new SQL migration file for the EEPS database schema.

> **Note:** The EEPS application currently runs entirely client-side with hardcoded data in `src/data/menu.ts` and Zustand stores persisted to localStorage. The Supabase backend has been removed. SQL migrations in `supabase/migrations/` serve as reference documentation for the original schema design and may be used if a database backend is re-introduced in the future.

## Arguments
- $ARGUMENTS: Description of the schema change (e.g., "add loyalty_points column to orders" or "create promotions table")

## Instructions

1. **Determine the next migration number.** Check existing files in `supabase/migrations/` and increment (e.g., if `002_seed_data.sql` exists, create `003_<name>.sql`).

2. **Create the migration file** at `supabase/migrations/<number>_<description>.sql`.

3. **Write the SQL** following existing conventions:
   - Use `UUID` primary keys with `gen_random_uuid()` default
   - Use `TIMESTAMPTZ` for dates with `NOW()` default
   - Use `INTEGER` for prices (cents, not euros)
   - Add appropriate indexes for frequently queried columns
   - Enable RLS: `ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;`
   - Add RLS policies matching the access pattern:
     - Public read: `CREATE POLICY "..." ON <table> FOR SELECT USING (true);`
     - User-scoped: `CREATE POLICY "..." ON <table> FOR SELECT USING (auth.uid()::text = user_id);`
   - Use CHECK constraints for enum-like columns

4. **Follow the naming pattern:**
   - File: `003_add_promotions.sql`
   - Tables: lowercase, plural (e.g., `promotions`, `loyalty_points`)
   - Columns: lowercase with underscores

5. **If adding columns to existing tables**, use `ALTER TABLE`:
   ```sql
   ALTER TABLE orders ADD COLUMN discount_code TEXT;
   ```

6. **If the change affects TypeScript types**, update `src/types/index.ts` accordingly.

7. **If the change affects runtime data**, also update the relevant files:
   - Menu data → `src/data/menu.ts`
   - Order logic → `src/store/orders.ts`
   - Cart logic → `src/store/cart.ts`

8. **Verify the SQL syntax** is valid PostgreSQL.
