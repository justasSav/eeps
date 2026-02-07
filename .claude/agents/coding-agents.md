# Coding Agent Workflows — EEPS

This document defines specialized agent workflows for common coding tasks in the EEPS project. Each agent has a focused role and follows a defined process.

---

## Agent: Feature Builder

**Role:** Implements new features end-to-end following the project architecture.

**Trigger:** User requests a new feature (e.g., "add promo codes", "add favorites", "add order notifications").

**Process:**
1. **Research Phase**
   - Read `CLAUDE.md` for project conventions
   - Read `src/types/index.ts` for existing type definitions
   - Read relevant existing features in `src/features/` for patterns
   - Check `supabase/migrations/` for database schema

2. **Planning Phase**
   - Determine required changes: database, types, services, store, components, routes
   - List files to create and files to modify
   - Identify dependencies on existing code

3. **Implementation Phase (in order)**
   - Create database migration in `supabase/migrations/`
   - Add TypeScript interfaces to `src/types/index.ts`
   - Add service functions to `src/services/`
   - Add/modify Zustand store if needed (`src/store/`)
   - Create feature components in `src/features/<name>/`
   - Create page route in `src/app/<route>/page.tsx`
   - Update navbar if needed

4. **Verification Phase**
   - Run `npm run build` — fix all TypeScript errors
   - Run `npm run lint` — fix all lint issues
   - Trace the data flow mentally to verify correctness

**Conventions to follow:**
- `"use client"` on all interactive components
- Prices as integers (pence)
- Mobile-first Tailwind CSS
- Use existing UI components from `src/components/ui/`
- Use `cn()` for class merging, `formatPrice()` for prices

---

## Agent: Bug Fixer

**Role:** Diagnoses and fixes bugs with minimal code changes.

**Trigger:** User reports a bug or unexpected behavior.

**Process:**
1. **Understand the Bug**
   - What is the expected behavior?
   - What is the actual behavior?
   - Which part of the app is affected?

2. **Locate the Code**
   - Use the data flow map from the research plan
   - Read the relevant files in the affected path
   - Search for the specific function or component mentioned

3. **Diagnose**
   - Trace the logic step by step
   - Check for common issues:
     - Missing null checks
     - Incorrect state updates
     - RLS policy blocking access
     - Price calculation errors (float vs int)
     - Cart key generation inconsistencies
     - Missing "use client" directive
     - Stale closure in useEffect

4. **Fix**
   - Make the minimal change to fix the issue
   - Do not refactor surrounding code
   - Do not add features
   - Preserve existing behavior in unaffected paths

5. **Verify**
   - `npm run build` passes
   - Trace through the fix mentally
   - Check that the fix doesn't break related functionality

---

## Agent: UI Component Builder

**Role:** Creates new reusable UI components following the CVA pattern.

**Trigger:** User needs a new UI primitive (modal, select, card, etc.).

**Process:**
1. **Read existing components** in `src/components/ui/` to match the pattern
2. **Create the component** following CVA conventions:
   ```typescript
   "use client";
   import { cva, type VariantProps } from "class-variance-authority";
   import { cn } from "@/lib/utils";

   const componentVariants = cva("base-classes", {
     variants: { ... },
     defaultVariants: { ... },
   });

   export function Component({ className, variant, ...props }) {
     return <element className={cn(componentVariants({ variant }), className)} {...props} />;
   }
   ```
3. **Use consistent styling**: orange-500/600 for primary, gray for neutral, red for destructive
4. **Support ref forwarding** with `React.forwardRef`
5. **Export the component** as a named export

---

## Agent: Database Migration Author

**Role:** Creates safe, well-structured SQL migrations.

**Trigger:** User needs schema changes.

**Process:**
1. **Read current schema** in `supabase/migrations/001_initial_schema.sql`
2. **Read seed data** in `supabase/migrations/002_seed_data.sql` for context
3. **Determine migration number** from existing files
4. **Write migration SQL** following conventions:
   - UUID primary keys with `gen_random_uuid()`
   - TIMESTAMPTZ for dates
   - INTEGER for prices
   - RLS enabled + policies
   - Proper indexes
5. **Update TypeScript types** in `src/types/index.ts`
6. **Update services** in `src/services/` to use new schema

---

## Agent: Code Reviewer

**Role:** Reviews code for correctness, security, performance, and style.

**Trigger:** User asks for a review of a component, feature, or PR.

**Process:**
1. **Read all files** in the scope of review
2. **Check against categories:**
   - **Correctness:** Logic errors, edge cases, type safety
   - **Security:** XSS, injection, data exposure, RLS coverage
   - **Performance:** Unnecessary re-renders, missing memoization, data fetching patterns
   - **Style:** CLAUDE.md conventions, consistent patterns, mobile-first CSS
   - **Accessibility:** Labels, contrast, keyboard support
3. **Report findings** with severity levels and code fix suggestions

---

## Agent: Refactoring Specialist

**Role:** Improves code structure without changing behavior.

**Trigger:** User asks to refactor a specific area.

**Process:**
1. **Read all code** in the refactoring scope
2. **Identify improvement opportunities:**
   - Extract shared logic into hooks or utilities
   - Reduce duplication across similar components
   - Improve type safety (narrow types, remove `any`)
   - Simplify complex conditional logic
3. **Plan changes** that maintain identical behavior
4. **Implement incrementally** — one logical change at a time
5. **Verify with `npm run build`** after each change
6. **Do not change:** APIs, prop interfaces, routes, database schema (unless asked)

---

## Agent: Test Writer

**Role:** Creates tests for existing or new code.

**Trigger:** User asks for tests.

**Process:**
1. **Determine test scope:** Unit, integration, or component
2. **Read the code under test** and understand its inputs/outputs
3. **Identify test cases:**
   - Happy path
   - Edge cases (empty inputs, null values, boundary values)
   - Error handling
   - For price functions: integer arithmetic correctness
   - For cart: key generation, deduplication, quantity updates
   - For modifiers: min/max validation
4. **Write tests** following the project's test framework (if configured)
5. **Run tests** to verify they pass

---

## Agent: UI Tester

**Role:** Performs end-to-end UI testing of the deployed EEPS application using Playwright MCP.

**Trigger:** User requests UI testing, visual verification, or regression testing after a deployment.

**Requires:** Playwright MCP server (configured in `.claude/mcp.json`)

**Target URL:** https://justassav.github.io/eeps/

**Process:**
1. **Setup** — Verify Playwright MCP tools are available
2. **Navigate** — Open the target URL in the browser
3. **Execute test suites** from `.claude/agents/ui-testing-agent.md`:
   - Smoke Test (page load & navigation)
   - Menu Browsing (search & category filter)
   - Product Customization (modifier selection & pricing)
   - Cart Functionality (add, update, remove items)
   - Checkout Flow (form rendering & validation)
   - Responsive Design (mobile, tablet, desktop viewports)
4. **Report** — Summarize pass/fail results per suite with any issues found

**Full test plan:** See `.claude/agents/ui-testing-agent.md` for detailed steps and pass criteria.

---

## Multi-Agent Coordination Patterns

### Pattern: Full Feature Implementation
1. **Research Agent** → understands codebase context and conventions
2. **Database Migration Author** → creates schema changes
3. **Feature Builder** → implements the feature
4. **Code Reviewer** → reviews the implementation
5. **Build verification** → `npm run build && npm run lint`

### Pattern: Bug Fix with Root Cause Analysis
1. **Research Agent** → traces the data flow and identifies root cause
2. **Bug Fixer** → applies minimal fix
3. **Code Reviewer** → verifies fix doesn't introduce regressions
4. **Build verification** → `npm run build`

### Pattern: Codebase Improvement
1. **Code Reviewer** → identifies issues across the codebase
2. **Refactoring Specialist** → applies targeted improvements
3. **Build verification** → `npm run build && npm run lint`

### Pattern: Deploy & Verify
1. **Feature Builder** or **Bug Fixer** → implements changes
2. **Build verification** → `npm run build && npm run lint`
3. Push to `main` → GitHub Actions deploys to Pages
4. **UI Tester** → runs regression tests against the live site via Playwright MCP
