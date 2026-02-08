import { test, expect } from "@playwright/test";
import { loginViaForm, loginAsAdmin } from "../helpers/seed-orders";

// ---------------------------------------------------------------------------
// 4.1 Login Gate Tests
// ---------------------------------------------------------------------------

test.describe("Login gate", () => {
  test("admin page shows login form when not authenticated", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByText("Administratoriaus prisijungimas")).toBeVisible();
    await expect(page.getByLabel("Prisijungimo vardas")).toBeVisible();
    await expect(page.getByLabel("Slaptažodis")).toBeVisible();
    await expect(page.getByRole("button", { name: "Prisijungti" })).toBeVisible();
  });

  test("admin dashboard is hidden when not authenticated", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByText("Administratoriaus skydelis")).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 4.2 Login Form Tests
// ---------------------------------------------------------------------------

test.describe("Login form", () => {
  test("successful login with demo/demo", async ({ page }) => {
    await page.goto("/admin");
    await loginViaForm(page, "demo", "demo");
    await expect(page.getByText("Administratoriaus skydelis")).toBeVisible();
  });

  test("failed login shows error", async ({ page }) => {
    await page.goto("/admin");
    await loginViaForm(page, "wrong", "wrong");
    await expect(
      page.getByText("Neteisingas prisijungimo vardas arba slaptažodis.")
    ).toBeVisible();
  });

  test("empty fields show validation error", async ({ page }) => {
    await page.goto("/admin");
    await page.getByRole("button", { name: "Prisijungti" }).click();
    await expect(
      page.getByText("Įveskite prisijungimo vardą ir slaptažodį.")
    ).toBeVisible();
  });

  test("wrong username shows error", async ({ page }) => {
    await page.goto("/admin");
    await loginViaForm(page, "admin", "demo");
    await expect(
      page.getByText("Neteisingas prisijungimo vardas arba slaptažodis.")
    ).toBeVisible();
  });

  test("wrong password shows error", async ({ page }) => {
    await page.goto("/admin");
    await loginViaForm(page, "demo", "password");
    await expect(
      page.getByText("Neteisingas prisijungimo vardas arba slaptažodis.")
    ).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 4.3 Session Persistence Tests
// ---------------------------------------------------------------------------

test.describe("Session persistence", () => {
  test("login persists across page reload", async ({ page }) => {
    await page.goto("/admin");
    await loginViaForm(page, "demo", "demo");
    await expect(page.getByText("Administratoriaus skydelis")).toBeVisible();
    await page.reload();
    await expect(page.getByText("Administratoriaus skydelis")).toBeVisible();
  });

  test("login persists when navigating away and back", async ({ page }) => {
    await page.goto("/admin");
    await loginViaForm(page, "demo", "demo");
    await expect(page.getByText("Administratoriaus skydelis")).toBeVisible();
    await page.goto("/");
    await page.goto("/admin");
    await expect(page.getByText("Administratoriaus skydelis")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 4.4 Logout Tests
// ---------------------------------------------------------------------------

test.describe("Logout", () => {
  test("logout button visible when authenticated", async ({ page }) => {
    await page.goto("/admin");
    await loginViaForm(page, "demo", "demo");
    await expect(page.getByRole("button", { name: "Atsijungti" })).toBeVisible();
  });

  test("logout returns to login form", async ({ page }) => {
    await page.goto("/admin");
    await loginViaForm(page, "demo", "demo");
    await expect(page.getByText("Administratoriaus skydelis")).toBeVisible();
    await page.getByRole("button", { name: "Atsijungti" }).click();
    await expect(page.getByText("Administratoriaus prisijungimas")).toBeVisible();
  });

  test("logout persists across reload", async ({ page }) => {
    await page.goto("/admin");
    await loginViaForm(page, "demo", "demo");
    await page.getByRole("button", { name: "Atsijungti" }).click();
    await page.reload();
    await expect(page.getByText("Administratoriaus prisijungimas")).toBeVisible();
  });

  test("can re-login after logout", async ({ page }) => {
    await page.goto("/admin");
    await loginViaForm(page, "demo", "demo");
    await page.getByRole("button", { name: "Atsijungti" }).click();
    await loginViaForm(page, "demo", "demo");
    await expect(page.getByText("Administratoriaus skydelis")).toBeVisible();
  });
});
