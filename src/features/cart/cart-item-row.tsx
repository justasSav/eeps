"use client";

import type { CartItem } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { Minus, Plus, Trash2 } from "lucide-react";

export function CartItemRow({ item }: { item: CartItem }) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3">
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-gray-900">{item.product_name}</h3>
          <span className="shrink-0 font-semibold text-orange-600">
            {formatPrice(item.item_total)}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={() => updateQuantity(item.cart_key, item.quantity - 1)}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="w-6 text-center text-sm font-medium">
            {item.quantity}
          </span>
          <button
            onClick={() => updateQuantity(item.cart_key, item.quantity + 1)}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
          >
            <Plus className="h-3 w-3" />
          </button>
          <button
            onClick={() => removeItem(item.cart_key)}
            className="ml-auto flex h-7 w-7 items-center justify-center rounded-full text-red-500 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
