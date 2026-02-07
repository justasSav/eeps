# Add Feature

Scaffold a new feature module in the EEPS ordering system.

## Arguments
- $ARGUMENTS: Feature name and brief description (e.g., "promotions - discount code system")

## Instructions

1. **Parse the feature name** from the arguments. Create a kebab-case directory name.

2. **Create the feature directory** at `src/features/<feature-name>/`.

3. **Scaffold the component files:**
   - Create the main feature component (e.g., `<feature-name>.tsx`)
   - Add `"use client"` directive at the top
   - Import relevant types from `@/types`
   - Import UI components from `@/components/ui/`
   - Import utilities from `@/lib/utils` (cn, formatPrice if dealing with prices)
   - Set up basic component structure with loading state

4. **Create the page route** if this is a customer-facing feature:
   - Create `src/app/<route>/page.tsx`
   - Import and render the feature component

5. **Add service functions** if the feature needs data access:
   - Create or extend files in `src/services/`
   - Use the Supabase client from `@/lib/supabase`
   - Follow existing patterns (async functions returning typed data)

6. **Add types** if needed:
   - Extend `src/types/index.ts` with new interfaces
   - Follow existing naming conventions

7. **Update navigation** if the feature needs a nav link:
   - Add icon + link in `src/components/shared/navbar.tsx`

8. **Verify the build** passes:
   - Run `npm run build`
   - Fix any TypeScript errors

Follow all conventions from CLAUDE.md: prices as integers, mobile-first Tailwind, feature-based organization.
