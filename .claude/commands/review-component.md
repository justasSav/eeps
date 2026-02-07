# Review Component

Perform a thorough code review of a component or module in the EEPS codebase.

## Arguments
- $ARGUMENTS: Component path or name (e.g., "src/features/cart/cart-view.tsx" or "checkout form" or "admin dashboard")

## Instructions

1. **Locate the component.** If a path is given, read it directly. If a name is given, search for it in `src/features/`, `src/components/`, or `src/app/`.

2. **Read the component** and all files it imports from the project (not node_modules).

3. **Review for these categories:**

   ### Correctness
   - Are props typed correctly?
   - Is state managed properly (no stale closures, proper dependency arrays)?
   - Are edge cases handled (empty arrays, null values, loading states)?
   - Do price calculations use integers (pence), not floats?

   ### Security
   - No XSS vulnerabilities (raw HTML injection)
   - No sensitive data in client-side code
   - Supabase RLS policies cover the data access pattern
   - No user input passed directly to queries without sanitization

   ### Performance
   - Unnecessary re-renders (missing useMemo/useCallback where needed)?
   - Large data fetches without pagination?
   - Missing loading states causing layout shift?

   ### Accessibility
   - Interactive elements have proper labels?
   - Color contrast sufficient?
   - Keyboard navigation supported?

   ### Code Style
   - Follows project conventions (CLAUDE.md)?
   - Uses `cn()` for class merging?
   - Uses `formatPrice()` for price display?
   - Has `"use client"` directive if interactive?
   - Mobile-first Tailwind classes?

4. **Output a structured review** with:
   - Summary (1-2 sentences)
   - Issues found (categorized by severity: critical, warning, suggestion)
   - Code snippets showing the issue and proposed fix
   - Overall assessment
