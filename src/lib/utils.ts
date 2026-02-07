import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ModifierGroup, OrderItemModifiers } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format price from pence/cents integer to display string (e.g. 1099 -> "£10.99") */
export function formatPrice(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

/** Calculate total price adjustments from selected modifiers against their groups */
export function calculateModifiersCost(
  modifiers: OrderItemModifiers,
  groups: ModifierGroup[]
): number {
  let total = 0;

  for (const group of groups) {
    const selection = modifiers[group.name];
    if (!selection) continue;

    const selectedNames = Array.isArray(selection) ? selection : [selection];

    for (const name of selectedNames) {
      if (typeof name !== "string") continue;
      const option = group.options.find((o) => o.name === name);
      if (option) {
        total += option.price_mod;
      }
    }
  }

  return total;
}

/** Generate a unique cart key from product ID and modifiers */
export function generateCartKey(
  productId: string,
  modifiers: OrderItemModifiers
): string {
  const sorted = JSON.stringify(modifiers, Object.keys(modifiers).sort());
  return `${productId}::${sorted}`;
}
