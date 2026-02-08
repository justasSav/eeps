import { test, expect } from "@playwright/test";
import { loginAsAdmin, loginViaForm } from "../helpers/seed-orders";

// ---------------------------------------------------------------------------
// 5.1 Client Purchase → Admin Sees It (full cross-area E2E)
// ---------------------------------------------------------------------------

test.describe("Client purchase → Admin visibility", () => {
  test("add single product, checkout, admin sees the order", async ({ page }) => {
    // 1. Browse menu and add a product
    await page.goto("/");
    await page.waitForSelector("text=Margarita");
    const addButtons = page.getByRole("button", { name: "Pridėti" });
    await addButtons.first().click();

    // Verify cart badge shows 1 item
    await expect(page.locator(".bg-orange-600").getByText("1")).toBeVisible();

    // 2. Go to cart and verify item is there
    await page.goto("/cart");
    await expect(page.getByText("Margarita")).toBeVisible();

    // 3. Checkout
    await page.goto("/checkout");
    await page.waitForSelector("text=Gavimo būdas");
    await page.getByPlaceholder("+370 600 00000").fill("+37061234567");
    await page.getByRole("button", { name: "Pateikti užsakymą" }).click();

    // 4. Should redirect to tracking page with order code
    await page.waitForURL(/\/tracking\?id=\d{3}/);
    const orderCode = new URL(page.url()).searchParams.get("id")!;
    expect(orderCode).toMatch(/^\d{3}$/);

    // 5. Log in to admin and verify the order appears
    await loginAsAdmin(page);
    await page.goto("/admin");
    await page.waitForSelector("text=Administratoriaus skydelis");
    await expect(page.getByText(`Užsakymas #${orderCode}`)).toBeVisible();
    await expect(page.getByText("Pateiktas")).toBeVisible();
    await expect(page.getByText("Margarita")).toBeVisible();
    await expect(page.getByText("+37061234567")).toBeVisible();
  });

  test("add multiple products, checkout delivery, admin sees all items", async ({
    page,
  }) => {
    // 1. Add multiple products
    await page.goto("/");
    await page.waitForSelector("text=Margarita");

    // Add Margarita (first product)
    const addButtons = page.getByRole("button", { name: "Pridėti" });
    await addButtons.first().click();

    // Add a second product — click the second "Pridėti" button
    await addButtons.nth(1).click();

    // Verify cart badge shows 2 items
    await expect(page.locator(".bg-orange-600").getByText("2")).toBeVisible();

    // 2. Checkout with delivery
    await page.goto("/checkout");
    await page.waitForSelector("text=Gavimo būdas");

    // Switch to delivery
    await page.getByText("Pristatymas").click();

    // Fill in delivery address fields
    await page.getByPlaceholder("Gatvė").fill("Gedimino pr. 1");
    await page.getByPlaceholder("Miestas").fill("Vilnius");
    await page.getByPlaceholder("Pašto kodas").fill("LT-01103");

    // Fill in phone number
    await page.getByPlaceholder("+370 600 00000").fill("+37069876543");

    // Submit
    await page.getByRole("button", { name: "Pateikti užsakymą" }).click();

    // 3. Get order code from tracking page
    await page.waitForURL(/\/tracking\?id=\d{3}/);
    const orderCode = new URL(page.url()).searchParams.get("id")!;

    // 4. Admin sees the order with delivery info
    await loginAsAdmin(page);
    await page.goto("/admin");
    await page.waitForSelector("text=Administratoriaus skydelis");
    await expect(page.getByText(`Užsakymas #${orderCode}`)).toBeVisible();
    await expect(page.getByText("Pristatymas")).toBeVisible();
    await expect(page.getByText("Gedimino pr. 1")).toBeVisible();
    await expect(page.getByText("Vilnius")).toBeVisible();
  });

  test("admin processes order through full lifecycle after client purchase", async ({
    page,
  }) => {
    // 1. Client places an order
    await page.goto("/");
    await page.waitForSelector("text=Margarita");
    await page.getByRole("button", { name: "Pridėti" }).first().click();

    await page.goto("/checkout");
    await page.waitForSelector("text=Gavimo būdas");
    await page.getByPlaceholder("+370 600 00000").fill("+37060000001");
    await page.getByRole("button", { name: "Pateikti užsakymą" }).click();

    await page.waitForURL(/\/tracking\?id=\d{3}/);
    const orderCode = new URL(page.url()).searchParams.get("id")!;

    // 2. Admin logs in via the form
    await page.goto("/admin");
    await loginViaForm(page, "demo", "demo");
    await page.waitForSelector("text=Administratoriaus skydelis");
    await expect(page.getByText(`Užsakymas #${orderCode}`)).toBeVisible();

    // 3. Process through full lifecycle
    await page.getByRole("button", { name: "Priimti" }).click();
    await expect(page.getByText("Priimtas")).toBeVisible();

    await page.getByRole("button", { name: "Pradėti ruošti" }).click();
    await expect(page.getByText("Ruošiamas")).toBeVisible();

    await page.getByRole("button", { name: "Pažymėti paruoštu" }).click();
    await expect(page.getByText("Paruoštas")).toBeVisible();

    await page.getByRole("button", { name: "Užbaigti" }).click();
    await expect(page.getByText(`Užsakymas #${orderCode}`)).not.toBeVisible();
    await expect(page.getByText("Aktyvių užsakymų nėra.")).toBeVisible();
  });

  test("add product with notes, admin sees the notes", async ({ page }) => {
    // 1. Client places an order with notes
    await page.goto("/");
    await page.waitForSelector("text=Margarita");
    await page.getByRole("button", { name: "Pridėti" }).first().click();

    await page.goto("/checkout");
    await page.waitForSelector("text=Gavimo būdas");
    await page.getByPlaceholder("+370 600 00000").fill("+37060000002");

    // Add notes if there's a notes field
    const notesField = page.getByPlaceholder("Pastabos");
    if (await notesField.isVisible()) {
      await notesField.fill("Be svogūnų");
    }

    await page.getByRole("button", { name: "Pateikti užsakymą" }).click();
    await page.waitForURL(/\/tracking\?id=\d{3}/);
    const orderCode = new URL(page.url()).searchParams.get("id")!;

    // 2. Admin sees the order
    await loginAsAdmin(page);
    await page.goto("/admin");
    await page.waitForSelector("text=Administratoriaus skydelis");
    await expect(page.getByText(`Užsakymas #${orderCode}`)).toBeVisible();
  });

  test("multiple orders from different clients appear in admin", async ({
    page,
  }) => {
    // 1. First client order
    await page.goto("/");
    await page.waitForSelector("text=Margarita");
    await page.getByRole("button", { name: "Pridėti" }).first().click();

    await page.goto("/checkout");
    await page.waitForSelector("text=Gavimo būdas");
    await page.getByPlaceholder("+370 600 00000").fill("+37060000010");
    await page.getByRole("button", { name: "Pateikti užsakymą" }).click();
    await page.waitForURL(/\/tracking\?id=\d{3}/);
    const code1 = new URL(page.url()).searchParams.get("id")!;

    // 2. Second client order
    await page.goto("/");
    await page.waitForSelector("text=Margarita");
    await page.getByRole("button", { name: "Pridėti" }).first().click();

    await page.goto("/checkout");
    await page.waitForSelector("text=Gavimo būdas");
    await page.getByPlaceholder("+370 600 00000").fill("+37060000011");
    await page.getByRole("button", { name: "Pateikti užsakymą" }).click();
    await page.waitForURL(/\/tracking\?id=\d{3}/);
    const code2 = new URL(page.url()).searchParams.get("id")!;

    // 3. Admin sees both orders
    await loginAsAdmin(page);
    await page.goto("/admin");
    await page.waitForSelector("text=Administratoriaus skydelis");
    await expect(page.getByText(`Užsakymas #${code1}`)).toBeVisible();
    await expect(page.getByText(`Užsakymas #${code2}`)).toBeVisible();
  });
});
