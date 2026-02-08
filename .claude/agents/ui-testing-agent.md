# UI Testing Agent — EEPS

This agent performs end-to-end UI testing of the deployed EEPS application using the Playwright MCP server.

---

## Overview

**Role:** Validates the deployed application by interacting with it through a real browser via the Playwright MCP tools.

**Target URL:** https://justassav.github.io/eeps/

**MCP Dependency:** This agent requires the `playwright` MCP server defined in `.claude/mcp.json`. The Playwright MCP tools (browser_navigate, browser_click, browser_type, browser_snapshot, etc.) must be available.

---

## Prerequisites

Install Playwright and its browser binaries before running this agent:

```bash
npm install --save-dev @playwright/mcp
npx playwright install --with-deps chromium
```

---

## Test Suites

### 1. Smoke Test — Page Load & Navigation

**Goal:** Verify all pages load without errors and navigation works.

**Process:**
1. Navigate to `https://justassav.github.io/eeps/`
2. Take a snapshot — verify the menu page renders with categories and products
3. Click the cart icon/link in the navbar — verify `/cart` loads
4. Navigate to `/orders` — verify the order history page loads
5. Navigate to `/admin` — verify the login form renders (auth gate)
6. Log in with demo/demo credentials — verify the admin dashboard loads
7. Return to home — verify navigation back works

**Pass criteria:** All pages return visible content, no blank screens or error messages.

### 2. Menu Browsing Test

**Goal:** Verify menu display, search, and category filtering.

**Process:**
1. Navigate to the home page
2. Take a snapshot — verify products are displayed with names and prices in € format
3. Test category filter: click each category pill (Picos, Kebabai, Mėsainiai, Kiti patiekalai, Gėrimai) and verify the product list updates
4. Test search: type a product name (e.g., "Margarita") into the search input and verify filtered results
5. Clear search — verify full menu returns

**Pass criteria:** Categories filter correctly, search returns relevant results, prices display in € format (e.g., "€8.00").

### 3. Add to Cart Test

**Goal:** Verify products can be added to the cart directly from the menu.

**Process:**
1. Navigate to the home page
2. Click the "Add" button on a product card (e.g., Margarita pizza)
3. Verify the cart badge in the navbar updates (shows item count)
4. Click "Add" on a different product
5. Verify the cart badge increments
6. Click "Add" on the same first product again
7. Verify the cart badge reflects the correct total quantity (item should be deduplicated with quantity 2)

**Pass criteria:** Products are added directly to cart, cart badge updates, duplicate products increment quantity instead of creating new entries.

### 4. Cart Functionality Test

**Goal:** Verify cart operations.

**Process:**
1. Add at least 2 different items to the cart via the "Add" buttons on the menu
2. Navigate to `/cart`
3. Take a snapshot — verify all added items appear with correct names, quantities, and prices
4. Test quantity controls: increment and decrement an item
5. Verify the cart total updates correctly
6. Remove an item — verify it disappears and total updates
7. Verify the "Proceed to Checkout" button is visible

**Pass criteria:** Cart accurately reflects added items, quantity changes work, totals are correct.

### 5. Checkout Flow Test

**Goal:** Verify the checkout form works (up to submission).

**Process:**
1. Add an item to cart and navigate to checkout
2. Take a snapshot — verify the form renders with fulfillment type selection
3. Select "Delivery" — verify address fields appear
4. Fill in required fields (phone, address fields)
5. Select "Pickup" — verify address fields hide
6. Verify the order summary section shows correct items and total
7. Do NOT submit the order (to avoid creating test data in production)

**Pass criteria:** Form renders correctly, fulfillment type toggle works, validation is present.

### 6. Responsive Design Test

**Goal:** Verify mobile-first layout at different viewport sizes.

**Process:**
1. Test at mobile width (375px) — verify single-column layout, no horizontal overflow
2. Test at tablet width (768px) — verify layout adapts appropriately
3. Test at desktop width (1024px) — verify max-width container is centered
4. Check the navbar adapts at each width

**Pass criteria:** No layout breakage, content is accessible at all tested widths.

---

## Running Tests

### Full Test Run
Run all test suites sequentially against the deployed site:

1. Start with Smoke Test to verify the site is up
2. Proceed through each test suite in order
3. Report results for each suite with pass/fail status

### Single Suite Run
Run a specific test suite by name (e.g., "run the Cart Functionality Test").

### Regression Test
After a deployment, run Smoke Test + Menu Browsing Test + Cart Functionality Test as a quick regression check.

---

## Reporting

After running tests, provide a summary:

```
## UI Test Results — EEPS

| Suite | Status | Notes |
|-------|--------|-------|
| Smoke Test | PASS/FAIL | Details... |
| Menu Browsing | PASS/FAIL | Details... |
| Add to Cart | PASS/FAIL | Details... |
| Cart Functionality | PASS/FAIL | Details... |
| Checkout Flow | PASS/FAIL | Details... |
| Responsive Design | PASS/FAIL | Details... |

**Overall:** X/6 suites passed
**Issues found:** (list any bugs or visual issues)
```

---

## Playwright MCP Tools Reference

The following MCP tools from the Playwright server are used by this agent:

| Tool | Purpose |
|------|---------|
| `browser_navigate` | Navigate to a URL |
| `browser_click` | Click an element on the page |
| `browser_type` | Type text into an input field |
| `browser_snapshot` | Capture page accessibility snapshot for verification |
| `browser_screenshot` | Take a visual screenshot |
| `browser_hover` | Hover over an element |
| `browser_select_option` | Select from a dropdown |
| `browser_resize` | Resize the browser viewport (for responsive tests) |
| `browser_go_back` | Navigate back |
| `browser_go_forward` | Navigate forward |
| `browser_wait` | Wait for a condition or timeout |
