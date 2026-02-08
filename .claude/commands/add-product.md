# Add Product

Add a new menu item to the EEPS hardcoded menu data.

## Arguments
- $ARGUMENTS: Product details (e.g., "Garlic Pizza Bread in Sides category, €4.50, vegetarian" or "Lamb Shish kebab in Kebabs, €10.50")

## Instructions

1. **Parse the product details** from the arguments:
   - Product name (in Lithuanian if possible, or transliterate)
   - Category: Picos, Kebabai, Mėsainiai, Kiti patiekalai, Gėrimai (or a new category)
   - Price in euros (convert to cents: €4.50 → 450)
   - Dietary tags if mentioned: `"vegetariškas"`, `"aštrus"` (spicy), etc.
   - Description in Lithuanian

2. **Read the existing menu data** in `src/data/menu.ts` to:
   - Find the target category by name
   - Understand the existing product structure and ID patterns
   - Check for naming conflicts

3. **Add the product** to the appropriate category in `src/data/menu.ts`:
   ```typescript
   {
     id: "prod-<kebab-case-name>",
     category_id: "<category-id>",
     name: "<Product Name>",
     description: "<Lithuanian description>",
     base_price: <price_in_cents>,
     image_url: "https://images.unsplash.com/photo-<relevant>?w=200&h=200&fit=crop",
     is_available: true,
     dietary_tags: ["<tags>"],
   },
   ```

4. **Follow existing patterns:**
   - Product IDs: `"prod-<kebab-case>"` (e.g., `"prod-margarita"`, `"prod-kebabas-lavase-vistiena"`)
   - Category IDs: `"cat-<kebab-case>"` (e.g., `"cat-picos"`, `"cat-kebabai"`)
   - Prices are always in cents: €4.50 = 450, €10.99 = 1099
   - Use Unsplash URLs for images (pick a relevant food photo)
   - Descriptions should be brief and in Lithuanian

5. **If adding a new category**, create a new object in the `hardcodedMenu` array:
   ```typescript
   {
     id: "cat-<name>",
     name: "<Lithuanian Name>",
     sort_order: <next number>,
     products: [
       // ... products
     ],
   },
   ```

6. **Update types** if the product introduces new fields:
   - Extend `src/types/index.ts` if needed

7. **Verify the build** passes:
   - Run `npm run build`
   - Fix any TypeScript errors

**Note:** Products are added to `src/data/menu.ts`, NOT to SQL migration files. The Supabase migrations in `supabase/migrations/` are reference-only and not used at runtime.
