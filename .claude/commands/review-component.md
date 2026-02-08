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
   - Do price calculations use integers (cents), not floats?
   - Is the Zustand store accessed correctly (selector pattern to avoid re-renders)?

   ### Security
   - No XSS vulnerabilities (raw HTML injection)
   - No sensitive data in client-side code
   - No user input passed unsanitized to dangerous operations
   - localStorage data is validated when read back

   ### Performance
   - Unnecessary re-renders (missing useMemo/useCallback where needed)?
   - Zustand selectors granular enough (avoid subscribing to entire store)?
   - Missing loading states causing layout shift?
   - Large data structures being copied unnecessarily?

   ### Accessibility
   - Interactive elements have proper labels?
   - Color contrast sufficient?
   - Keyboard navigation supported?

   ### Code Style
   - Follows project conventions (CLAUDE.md)?
   - Uses `cn()` for class merging?
   - Uses `formatPrice()` for price display (not manual formatting)?
   - Has `"use client"` directive if interactive?
   - Mobile-first Tailwind classes?
   - UI text in Lithuanian?

4. **Output a structured review** with:
   - Summary (1-2 sentences)
   - Issues found (categorized by severity: critical, warning, suggestion)
   - Code snippets showing the issue and proposed fix
   - Overall assessment
