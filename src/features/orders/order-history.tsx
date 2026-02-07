"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Order } from "@/types";
import { fetchUserOrders } from "@/services/orders";
import { formatPrice } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";
import { Loader } from "@/components/shared/loader";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserOrders("guest")
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <ClipboardList className="h-16 w-16 text-gray-300" />
        <h2 className="mt-4 text-lg font-semibold text-gray-900">
          No orders yet
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Place your first order from our menu!
        </p>
        <Link href="/" className="mt-6">
          <Button>Browse Menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Order History</h1>
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/tracking/${order.id}`}
          className="block rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">
              #{order.id.slice(0, 8).toUpperCase()}
            </span>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {new Date(order.created_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {order.items.length} item{order.items.length !== 1 ? "s" : ""}
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
