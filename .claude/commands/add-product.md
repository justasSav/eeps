# Add Product

Add a new menu item to the EEPS seed data with optional modifier groups.

## Arguments
- $ARGUMENTS: Product details (e.g., "Garlic Pizza Bread in Sides category, £4.50, vegetarian" or "Lamb Shish kebab, £10.50, with bread and salad modifiers")

## Instructions

1. **Parse the product details** from the arguments:
   - Product name
   - Category (Pizzas, Kebabs, Sides, Drinks, or new category)
   - Price in pounds (convert to pence: £4.50 → 450)
   - Dietary tags if mentioned (vegetarian, vegan, spicy, gluten-free)
   - Whether it needs modifier groups

2. **Read the existing seed data** in `supabase/migrations/002_seed_data.sql` to:
   - Find the UUID for the target category
   - Understand the existing modifier group patterns
   - Check for naming conflicts

3. **Create a new migration file** (e.g., `supabase/migrations/003_add_<product>.sql`) with:

   ```sql
   -- Add <product name>
   INSERT INTO products (id, category_id, name, description, base_price, dietary_tags)
   VALUES (
     gen_random_uuid(),
     '<category-uuid>',
     '<Product Name>',
     '<description>',
     <price_in_pence>,
     ARRAY['<tags>']
   );
   ```

4. **Add modifier groups** if the product is a pizza or kebab (or if specified):
   - For pizzas: Size (required, 1), Crust (required, 1), Extra Toppings (optional, up to 5)
   - For kebabs: Bread (required, 1), Salad (optional, up to 6), Sauce (optional, up to 3)
   - Use existing modifier option patterns and pricing

5. **Use subqueries** to reference the new product ID:
   ```sql
   WITH new_product AS (
     INSERT INTO products (...) VALUES (...) RETURNING id
   )
   INSERT INTO modifier_groups (product_id, name, min_required, max_allowed, sort_order)
   SELECT id, 'Size', 1, 1, 1 FROM new_product;
   ```

6. **Verify the SQL** is syntactically correct and follows existing patterns.

7. **Note:** Prices are always in pence. £4.50 = 450, £10.99 = 1099.
