import type { Page } from "@playwright/test";

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
