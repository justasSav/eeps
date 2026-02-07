import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format price from cents integer to display string (e.g. 700 -> "€7.00") */
export function formatPrice(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

/** Generate a unique cart key from product ID */
export function generateCartKey(productId: string): string {
  return productId;
}
