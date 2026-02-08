import { test } from "@playwright/test";
import path from "path";

function getScreenshotDir(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  return path.join("screenshots", `${yyyy}-${mm}-${dd}-${hh}`);
}

const screenshotDir = getScreenshotDir();

test.describe("Visual verification screenshots", () => {
  test("home page - menu", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.screenshot({
      path: path.join(screenshotDir, "01-home-menu.png"),
      fullPage: true,
    });
  });

  test("cart page", async ({ page }) => {
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");
    await page.screenshot({
      path: path.join(screenshotDir, "02-cart.png"),
      fullPage: true,
    });
  });

  test("checkout page", async ({ page }) => {
    await page.goto("/checkout");
    await page.waitForLoadState("networkidle");
    await page.screenshot({
      path: path.join(screenshotDir, "03-checkout.png"),
      fullPage: true,
    });
  });

  test("orders page", async ({ page }) => {
    await page.goto("/orders");
    await page.waitForLoadState("networkidle");
    await page.screenshot({
      path: path.join(screenshotDir, "04-orders.png"),
      fullPage: true,
    });
  });

  test("tracking page", async ({ page }) => {
    await page.goto("/tracking");
    await page.waitForLoadState("networkidle");
    await page.screenshot({
      path: path.join(screenshotDir, "05-tracking.png"),
      fullPage: true,
    });
  });

  test("admin page", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");
    await page.screenshot({
      path: path.join(screenshotDir, "06-admin.png"),
      fullPage: true,
    });
  });
});
