"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { CartItemRow } from "./cart-item-row";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";

export function CartView() {
  const items = useCartStore((s) => s.items);
  const getTotal = useCartStore((s) => s.getTotal);
  const clearCart = useCartStore((s) => s.clearCart);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <ShoppingCart className="h-16 w-16 text-gray-300" />
        <h2 className="mt-4 text-lg font-semibold text-gray-900">
          Jūsų krepšelis tuščias
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Pridėkite skanių patiekalų iš mūsų meniu!
        </p>
        <Link href="/" className="mt-6">
          <Button>Naršyti meniu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Jūsų krepšelis</h1>
        <button
          onClick={clearCart}
          className="text-sm text-red-600 hover:text-red-700"
        >
          Išvalyti viską
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <CartItemRow key={item.cart_key} item={item} />
        ))}
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center justify-between text-lg font-bold">
          <span>Iš viso</span>
          <span className="text-orange-600">{formatPrice(getTotal())}</span>
        </div>
      </div>

      <Link href="/checkout" className="block">
        <Button className="w-full" size="lg">
          Pereiti prie apmokėjimo
        </Button>
      </Link>
    </div>
  );
}
