"use client";

import Link from "next/link";
import { ShoppingCart, Pizza, ClipboardList, Shield } from "lucide-react";
import { useCartStore } from "@/store/cart";

export function Navbar() {
  const items = useCartStore((s) => s.items);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-orange-600">
          <Pizza className="h-6 w-6" />
          <span className="text-lg">EEPS</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/orders"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <ClipboardList className="h-5 w-5" />
          </Link>
          <Link
            href="/admin"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <Shield className="h-5 w-5" />
          </Link>
          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-[10px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
