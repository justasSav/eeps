import type { Page } from "@playwright/test";

/**
 * Set admin auth state in localStorage so the admin dashboard is accessible.
 * Must be called after navigating to any page (so localStorage is available).
 */
export async function loginAsAdmin(page: Page) {
  await page.evaluate(() => {
    const store = {
      state: { isAuthenticated: true },
      version: 0,
    };
    localStorage.setItem("eeps-admin-auth", JSON.stringify(store));
  });
}

/**
 * Log in via the admin login form UI.
 */
export async function loginViaForm(page: Page, username = "demo", password = "demo") {
  await page.getByLabel("Prisijungimo vardas").fill(username);
  await page.getByLabel("Slaptažodis").fill(password);
  await page.getByRole("button", { name: "Prisijungti" }).click();
}

export interface SeedOrder {
  id: string;
  status: "CREATED" | "ACCEPTED" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";
  fulfillment_type: "delivery" | "pickup";
  contact_phone: string;
  items: {
    product_id: string;
    product_name: string;
    quantity: number;
    base_price: number;
    item_total: number;
  }[];
  total_amount: number;
  delivery_address?: {
    street: string;
    city: string;
    postal_code: string;
    notes: string;
  } | null;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

const defaultItem = {
  product_id: "prod-margarita",
  product_name: "Margarita",
  quantity: 1,
  base_price: 800,
  item_total: 800,
};

export function createOrder(overrides: Partial<SeedOrder> = {}): SeedOrder {
  const now = new Date().toISOString();
  return {
    id: "100",
    status: "CREATED",
    fulfillment_type: "pickup",
    contact_phone: "+37060000000",
    items: [defaultItem],
    total_amount: 800,
    delivery_address: null,
    notes: "",
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

export async function seedOrders(page: Page, orders: SeedOrder[]) {
  await page.evaluate((data) => {
    const store = {
      state: { orders: data },
      version: 0,
    };
    localStorage.setItem("eeps-orders", JSON.stringify(store));
  }, orders);
}
