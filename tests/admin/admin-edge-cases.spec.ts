import { test, expect } from "@playwright/test";
import { seedOrders, createOrder } from "../helpers/seed-orders";

async function goToAdmin(page: import("@playwright/test").Page) {
  await page.goto("/admin");
  await page.waitForSelector("text=Administratoriaus skydelis");
}

test.describe("Edge cases", () => {
  test("many orders (20+) render without layout issues", async ({ page }) => {
    await page.goto("/");
    const orders = Array.from({ length: 20 }, (_, i) =>
      createOrder({
        id: String(100 + i),
        status: "CREATED",
        created_at: new Date(2026, 0, 1, 0, i).toISOString(),
      })
    );
    await seedOrders(page, orders);
    await goToAdmin(page);

    const cards = page.locator("text=/Užsakymas #\\d+/");
    await expect(cards).toHaveCount(20);
    // Verify the page is scrollable (content height > viewport)
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    expect(bodyHeight).toBeGreaterThan(844);
  });

  test("long phone number doesn't cause horizontal scroll", async ({ page }) => {
    await page.goto("/");
    await seedOrders(page, [
      createOrder({ id: "150", contact_phone: "+370600000001234567890" }),
    ]);
    await goToAdmin(page);
    await expect(page.getByText("+370600000001234567890")).toBeVisible();
    const hasHScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHScroll).toBe(false);
  });

  test("long address doesn't cause horizontal scroll", async ({ page }) => {
    await page.goto("/");
    const longStreet =
      "Labai ilgas gatvės pavadinimas su daugybe žodžių ir numerių 12345 kuri turėtų tilpti į kortelę be horizontalaus slinkimo";
    await seedOrders(page, [
      createOrder({
        id: "151",
        fulfillment_type: "delivery",
        delivery_address: {
          street: longStreet,
          city: "Kaunas",
          postal_code: "LT-44001",
          notes: "",
        },
      }),
    ]);
    await goToAdmin(page);
    await expect(page.getByText(longStreet)).toBeVisible();
    const hasHScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHScroll).toBe(false);
  });

  test("long notes don't cause horizontal scroll", async ({ page }) => {
    await page.goto("/");
    // Use words with spaces so the text can wrap naturally
    const longNotes = Array(50).fill("pastaba žodis").join(" ");
    await seedOrders(page, [createOrder({ id: "152", notes: longNotes })]);
    await goToAdmin(page);
    await expect(page.locator(".bg-yellow-50")).toBeVisible();
    const noteText = await page.locator(".bg-yellow-50").textContent();
    expect(noteText).toContain("pastaba žodis");
    const hasHScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHScroll).toBe(false);
  });

  test("order with many items (15+)", async ({ page }) => {
    await page.goto("/");
    const items = Array.from({ length: 15 }, (_, i) => ({
      product_id: `prod-${i}`,
      product_name: `Product ${i + 1}`,
      quantity: 1,
      base_price: 500,
      item_total: 500,
    }));
    await seedOrders(page, [
      createOrder({ id: "153", items, total_amount: 7500 }),
    ]);
    await goToAdmin(page);
    // Verify all 15 items are listed using exact item text (e.g., "1x Product 1")
    for (let i = 1; i <= 15; i++) {
      await expect(
        page.getByText(`1x Product ${i}`, { exact: true })
      ).toBeVisible();
    }
  });

  test("rapid status changes on multiple orders", async ({ page }) => {
    await page.goto("/");
    await seedOrders(page, [
      createOrder({ id: "160", status: "CREATED", created_at: "2026-01-01T00:00:00Z" }),
      createOrder({ id: "161", status: "CREATED", created_at: "2026-01-01T00:01:00Z" }),
      createOrder({ id: "162", status: "CREATED", created_at: "2026-01-01T00:02:00Z" }),
    ]);
    await goToAdmin(page);

    // Advance all three orders quickly
    const acceptButtons = page.getByRole("button", { name: "Priimti" });
    await acceptButtons.first().click();
    await acceptButtons.first().click();
    await acceptButtons.first().click();

    // All should now show "Priimtas"
    const badges = page.getByText("Priimtas");
    await expect(badges).toHaveCount(3);
  });
});
