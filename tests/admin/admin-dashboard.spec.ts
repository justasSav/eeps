import { test, expect } from "@playwright/test";
import { seedOrders, createOrder, loginAsAdmin } from "../helpers/seed-orders";

// Navigate to /admin after seeding localStorage and setting auth state.
// Navigates to "/" first if needed so localStorage is available for seeding.
async function goToAdmin(page: import("@playwright/test").Page) {
  // Ensure we have a page loaded so localStorage is available
  const url = page.url();
  if (url === "about:blank" || !url.startsWith("http")) {
    await page.goto("/");
  }
  await loginAsAdmin(page);
  await page.goto("/admin");
  // Wait for the admin heading to confirm the page rendered
  await page.waitForSelector("text=Administratoriaus skydelis");
}

// ---------------------------------------------------------------------------
// 3.1 Empty State Tests
// ---------------------------------------------------------------------------

test.describe("Empty state", () => {
  test("shows empty state message when no orders", async ({ page }) => {
    await goToAdmin(page);
    await expect(page.getByText("Aktyvių užsakymų nėra.")).toBeVisible();
  });

  test("refresh button visible on empty state", async ({ page }) => {
    await goToAdmin(page);
    await expect(page.getByRole("button", { name: "Atnaujinti" })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 3.2 Order Display Tests
// ---------------------------------------------------------------------------

test.describe("Order display", () => {
  test("displays active orders", async ({ page }) => {
    await page.goto("/");
    await seedOrders(page, [
      createOrder({ id: "101", status: "CREATED" }),
      createOrder({ id: "102", status: "ACCEPTED" }),
      createOrder({ id: "103", status: "PREPARING" }),
    ]);
    await goToAdmin(page);
    await expect(page.getByText("Užsakymas #101")).toBeVisible();
    await expect(page.getByText("Užsakymas #102")).toBeVisible();
    await expect(page.getByText("Užsakymas #103")).toBeVisible();
  });

  test("excludes completed orders", async ({ page }) => {
    await page.goto("/");
    await seedOrders(page, [
      createOrder({ id: "201", status: "COMPLETED" }),
      createOrder({ id: "202", status: "CREATED" }),
    ]);
    await goToAdmin(page);
    await expect(page.getByText("Užsakymas #202")).toBeVisible();
    await expect(page.getByText("Užsakymas #201")).not.toBeVisible();
  });

  test("excludes cancelled orders", async ({ page }) => {
    await page.goto("/");
    await seedOrders(page, [
      createOrder({ id: "301", status: "CANCELLED" }),
      createOrder({ id: "302", status: "CREATED" }),
    ]);
    await goToAdmin(page);
    await expect(page.getByText("Užsakymas #302")).toBeVisible();
    await expect(page.getByText("Užsakymas #301")).not.toBeVisible();
  });

  test("orders sorted oldest first", async ({ page }) => {
    await page.goto("/");
    await seedOrders(page, [
      createOrder({
        id: "403",
        status: "CREATED",
        created_at: "2026-01-03T12:00:00Z",
      }),
      createOrder({
        id: "401",
        status: "CREATED",
        created_at: "2026-01-01T12:00:00Z",
      }),
      createOrder({
        id: "402",
        status: "CREATED",
        created_at: "2026-01-02T12:00:00Z",
      }),
    ]);
    await goToAdmin(page);

    const cards = page.locator("text=/Užsakymas #\\d+/");
    const texts = await cards.allTextContents();
    expect(texts[0]).toContain("#401");
    expect(texts[1]).toContain("#402");
    expect(texts[2]).toContain("#403");
  });

  test("order card shows order ID", async ({ page }) => {
    await page.goto("/");
    await seedOrders(page, [createOrder({ id: "123" })]);
    await goToAdmin(page);
    await expect(page.getByText("Užsakymas #123")).toBeVisible();
  });

  test("order card shows fulfillment badge — delivery", async ({ page }) => {
    await page.goto("/");
    await seedOrders(page, [
      createOrder({ id: "500", fulfillment_type: "delivery" }),
    ]);
    await goToAdmin(page);
    await expect(page.getByText("Pristatymas")).toBeVisible();
  });

  test("order card shows fulfillment badge — pickup", async ({ page }) => {
    await page.goto("/");
    await seedOrders(page, [
      createOrder({ id: "501", fulfillment_type: "pickup" }),
    ]);
    await goToAdmin(page);
    await expect(page.getByText("Atsiėmimas")).toBeVisible();
  });

  test("order card shows status badge", async ({ page }) => {
    await page.goto("/");
    await seedOrders(page, [createOrder({ id: "502", status: "CREATED" })]);
    await goToAdmin(page);
    await expect(page.getByText("Pateiktas")).toBeVisible();
  });

  test("order card shows timestamp", async ({ page }) => {
    await page.goto("/");
    await seedOrders(page, [
      createOrder({ id: "503", created_at: "2026-01-15T14:30:00Z" }),
    ]);
    await goToAdmin(page);
    // The time displayed depends on locale; check that some HH:mm pattern is present
    // 14:30 UTC could be displayed differently depending on system tz, so just check page has a time-like pattern
    const timeText = page.locator("text=/\\d{2}:\\d{2}/");
    await expect(timeText.first()).toBeVisible();
  });

  test("order card shows phone number", async ({ page }) => {
    await page.goto("/");
    await seedOrders(page, [
      createOrder({ id: "504", contact_phone: "+37060000000" }),
    ]);
    await goToAdmin(page);
    await expect(page.getByText("+37060000000")).toBeVisible();
  });

  test("order card shows delivery address", async ({ page }) => {
    await page.goto("/");
    await seedOrders(page, [
      createOrder({
        id: "505",
        fulfillment_type: "delivery",
        delivery_address: {
          street: "Vilniaus g. 10",
          city: "Kaunas",
          postal_code: "LT-44001",
          notes: "",
        },
      }),
    ]);
    await goToAdmin(page);
    await expect(page.getByText("Vilniaus g. 10")).toBeVisible();
    await expect(page.getByText("Kaunas")).toBeVisible();
  });

  test("order card hides address for pickup", async ({ page }) => {
    await page.goto("/");
    await seedOrders(page, [
      createOrder({
        id: "506",
        fulfillment_type: "pickup",
        delivery_address: null,
      }),
    ]);
    await goToAdmin(page);
    // The address section should not render
    await expect(page.getByText("Vilniaus g.")).not.toBeVisible();
  });

  test("order card shows items list", async ({ page }) => {
    await page.goto("/");
    await seedOrders(page, [
      createOrder({
        id: "507",
        items: [
          {
            product_id: "p1",
            product_name: "Margarita",
            quantity: 2,
            base_price: 800,
            item_total: 1600,
          },
          {
            product_id: "p2",
            product_name: "Kebabas",
            quantity: 1,
            base_price: 500,
            item_total: 500,
          },
        ],
        total_amount: 2100,
      }),
    ]);
    await goToAdmin(page);
    await expect(page.getByText("2x Margarita")).toBeVisible();
    await expect(page.getByText("1x Kebabas")).toBeVisible();
  });

  test("order card shows item prices", async ({ page }) => {
    await page.goto("/");
    await seedOrders(page, [
      createOrder({
        id: "508",
        items: [
          {
            product_id: "p1",
            product_name: "Margarita",
            quantity: 2,
            base_price: 800,
            item_total: 1600,
          },
        ],
        total_amount: 1600,
      }),
    ]);
    await goToAdmin(page);
    // formatPrice(1600) → "€16.00" — item price is in a text-gray-500 span
    await expect(page.locator(".text-gray-500").getByText("€16.00")).toBeVisible();
  });

  test("order card shows total", async ({ page }) => {
    await page.goto("/");
    await seedOrders(page, [createOrder({ id: "509", total_amount: 2500 })]);
    await goToAdmin(page);
    await expect(page.getByText("€25.00")).toBeVisible();
  });

  test("order card shows notes", async ({ page }) => {
    await page.goto("/");
    await seedOrders(page, [
      createOrder({ id: "510", notes: "Extra sauce" }),
    ]);
    await goToAdmin(page);
    await expect(page.getByText("Extra sauce")).toBeVisible();
    // Should be inside the yellow alert box
    const noteBox = page.locator(".bg-yellow-50");
    await expect(noteBox).toBeVisible();
  });

  test("order card hides notes when empty", async ({ page }) => {
    await page.goto("/");
    await seedOrders(page, [createOrder({ id: "511", notes: "" })]);
    await goToAdmin(page);
    // No yellow alert box
    const noteBox = page.locator(".bg-yellow-50");
    await expect(noteBox).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 3.3 Status Transition Tests
// ---------------------------------------------------------------------------

test.describe("Status transitions", () => {
  test("CREATED -> ACCEPTED", async ({ page }) => {
    await page.goto("/");
    await seedOrders(page, [createOrder({ id: "600", status: "CREATED" })]);
    await goToAdmin(page);
    await page.getByRole("button", { name: "Priimti" }).click();
    await expect(page.getByText("Priimtas")).toBeVisible();
  });

  test("ACCEPTED -> PREPARING", async ({ page }) => {
    await page.goto("/");
    await seedOrders(page, [createOrder({ id: "601", status: "ACCEPTED" })]);
    await goToAdmin(page);
    await page.getByRole("button", { name: "Pradėti ruošti" }).click();
    await expect(page.getByText("Ruošiamas")).toBeVisible();
  });

  test("PREPARING -> READY", async ({ page }) => {
    await page.goto("/");
    await seedOrders(page, [createOrder({ id: "602", status: "PREPARING" })]);
    await goToAdmin(page);
    await page.getByRole("button", { name: "Pažymėti paruoštu" }).click();
    await expect(page.getByText("Paruoštas")).toBeVisible();
  });

  test("READY -> COMPLETED (disappears)", async ({ page }) => {
    await page.goto("/");
    await seedOrders(page, [createOrder({ id: "603", status: "READY" })]);
    await goToAdmin(page);
    await expect(page.getByText("Užsakymas #603")).toBeVisible();
    await page.getByRole("button", { name: "Užbaigti" }).click();
    await expect(page.getByText("Užsakymas #603")).not.toBeVisible();
    await expect(page.getByText("Aktyvių užsakymų nėra.")).toBeVisible();
  });

  test("correct button labels per status", async ({ page }) => {
    await page.goto("/");
    await seedOrders(page, [
      createOrder({ id: "610", status: "CREATED" }),
      createOrder({ id: "611", status: "ACCEPTED" }),
      createOrder({ id: "612", status: "PREPARING" }),
      createOrder({ id: "613", status: "READY" }),
    ]);
    await goToAdmin(page);
    await expect(page.getByRole("button", { name: "Priimti" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Pradėti ruošti" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Pažymėti paruoštu" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Užbaigti" })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 3.4 Cancel Functionality Tests
// ---------------------------------------------------------------------------

test.describe("Cancel functionality", () => {
  for (const status of ["CREATED", "ACCEPTED", "PREPARING", "READY"] as const) {
    test(`cancel ${status} order`, async ({ page }) => {
      await page.goto("/");
      await seedOrders(page, [createOrder({ id: "700", status })]);
      await goToAdmin(page);
      await expect(page.getByText("Užsakymas #700")).toBeVisible();
      await page.getByRole("button", { name: "Atšaukti" }).click();
      await expect(page.getByText("Užsakymas #700")).not.toBeVisible();
    });
  }

  test("cancel button always visible on active orders", async ({ page }) => {
    await page.goto("/");
    await seedOrders(page, [
      createOrder({ id: "710", status: "CREATED" }),
      createOrder({ id: "711", status: "ACCEPTED" }),
      createOrder({ id: "712", status: "PREPARING" }),
      createOrder({ id: "713", status: "READY" }),
    ]);
    await goToAdmin(page);
    const cancelButtons = page.getByRole("button", { name: "Atšaukti" });
    await expect(cancelButtons).toHaveCount(4);
  });
});

// ---------------------------------------------------------------------------
// 3.5 Refresh Functionality Tests
// ---------------------------------------------------------------------------

test.describe("Refresh functionality", () => {
  test("refresh button re-renders after status change", async ({ page }) => {
    await page.goto("/");
    await seedOrders(page, [createOrder({ id: "800", status: "CREATED" })]);
    await goToAdmin(page);
    await expect(page.getByText("Pateiktas")).toBeVisible();

    // Advance status via UI
    await page.getByRole("button", { name: "Priimti" }).click();
    await expect(page.getByText("Priimtas")).toBeVisible();

    // Click refresh — verify the updated state is still shown
    await page.getByRole("button", { name: "Atnaujinti" }).click();
    await expect(page.getByText("Priimtas")).toBeVisible();
    await expect(page.getByText("Užsakymas #800")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 3.6 Persistence Tests
// ---------------------------------------------------------------------------

test.describe("Persistence", () => {
  test("orders survive page reload", async ({ page }) => {
    await page.goto("/");
    await seedOrders(page, [createOrder({ id: "900", status: "CREATED" })]);
    await goToAdmin(page);
    await expect(page.getByText("Užsakymas #900")).toBeVisible();
    await page.reload();
    await page.waitForSelector("text=Administratoriaus skydelis");
    await expect(page.getByText("Užsakymas #900")).toBeVisible();
  });

  test("status changes persist on reload", async ({ page }) => {
    await page.goto("/");
    await seedOrders(page, [createOrder({ id: "901", status: "CREATED" })]);
    await goToAdmin(page);
    await page.getByRole("button", { name: "Priimti" }).click();
    await expect(page.getByText("Priimtas")).toBeVisible();
    await page.reload();
    await page.waitForSelector("text=Administratoriaus skydelis");
    await expect(page.getByText("Priimtas")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 3.7 Full Workflow E2E Test
// ---------------------------------------------------------------------------

test.describe("Full workflow", () => {
  test("customer order → admin processes full lifecycle", async ({ page }) => {
    // 1. Go to home page and add an item to cart
    await page.goto("/");
    await page.waitForSelector("text=Margarita");
    // Click the first "Pridėti" button to add Margarita
    const addButtons = page.getByRole("button", { name: "Pridėti" });
    await addButtons.first().click();

    // 2. Go to checkout
    await page.goto("/checkout");
    await page.waitForSelector("text=Gavimo būdas");

    // Fill in phone number (pickup is default)
    await page.getByPlaceholder("+370 600 00000").fill("+37069999999");

    // Submit order
    await page.getByRole("button", { name: "Pateikti užsakymą" }).click();

    // Should redirect to tracking page
    await page.waitForURL(/\/tracking\?id=\d{3}/);
    const url = page.url();
    const orderCode = new URL(url).searchParams.get("id")!;

    // 3. Log in and navigate to admin to verify the order is visible
    await loginAsAdmin(page);
    await page.goto("/admin");
    await page.waitForSelector("text=Administratoriaus skydelis");
    await expect(page.getByText(`Užsakymas #${orderCode}`)).toBeVisible();
    await expect(page.getByText("Pateiktas")).toBeVisible();

    // 4. Advance through the full lifecycle
    await page.getByRole("button", { name: "Priimti" }).click();
    await expect(page.getByText("Priimtas")).toBeVisible();

    await page.getByRole("button", { name: "Pradėti ruošti" }).click();
    await expect(page.getByText("Ruošiamas")).toBeVisible();

    await page.getByRole("button", { name: "Pažymėti paruoštu" }).click();
    await expect(page.getByText("Paruoštas")).toBeVisible();

    await page.getByRole("button", { name: "Užbaigti" }).click();
    // Order should disappear from admin
    await expect(page.getByText(`Užsakymas #${orderCode}`)).not.toBeVisible();
    await expect(page.getByText("Aktyvių užsakymų nėra.")).toBeVisible();
  });
});
