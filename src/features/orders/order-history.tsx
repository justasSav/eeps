"use client";

import Link from "next/link";
import { useOrderStore } from "@/store/orders";
import { formatPrice } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useMemo } from "react";

export function OrderHistory() {
  const allOrders = useOrderStore((s) => s.orders);
  const orders = useMemo(
    () =>
      [...allOrders].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    [allOrders]
  );

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <ClipboardList className="h-16 w-16 text-gray-300" />
        <h2 className="mt-4 text-lg font-semibold text-gray-900">
          Užsakymų dar nėra
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Pateikite pirmąjį užsakymą iš mūsų meniu!
        </p>
        <Link href="/" className="mt-6">
          <Button>Naršyti meniu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Užsakymų istorija</h1>
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/tracking?id=${order.id}`}
          className="block rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">
              Užsakymas #{order.id}
            </span>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {new Date(order.created_at).toLocaleDateString("lt-LT", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {order.items.length}{" "}
              {order.items.length === 1
                ? "prekė"
                : order.items.length < 10 && order.items.length > 1
                ? "prekės"
                : "prekių"}
            </span>
            <span className="font-semibold text-orange-600">
              {formatPrice(order.total_amount)}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
