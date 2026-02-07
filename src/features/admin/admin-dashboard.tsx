"use client";

import { useState, useEffect, useCallback } from "react";
import type { Order, OrderStatus } from "@/types";
import { fetchActiveOrders, updateOrderStatus } from "@/services/orders";
import { formatPrice } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";
import { Loader } from "@/components/shared/loader";
import { Button } from "@/components/ui/button";
import { useRealtime } from "@/hooks/useRealtime";
import { RefreshCw } from "lucide-react";

const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  CREATED: "ACCEPTED",
  ACCEPTED: "PREPARING",
  PREPARING: "READY",
  READY: "COMPLETED",
};

const nextLabel: Partial<Record<OrderStatus, string>> = {
  CREATED: "Accept",
  ACCEPTED: "Start Preparing",
  PREPARING: "Mark Ready",
  READY: "Complete",
};

export function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const loadOrders = useCallback(() => {
    setLoading(true);
    fetchActiveOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Listen for realtime updates to reload the order list
  const handleRealtimeUpdate = useCallback(() => {
    loadOrders();
  }, [loadOrders]);

  useRealtime("orders", null, handleRealtimeUpdate);

  async function handleAdvance(orderId: string, currentStatus: OrderStatus) {
    const next = nextStatus[currentStatus];
    if (!next) return;

    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, next);
      setOrders((prev) =>
        prev
          .map((o) => (o.id === orderId ? { ...o, status: next } : o))
          .filter((o) => o.status !== "COMPLETED")
      );
    } catch (err) {
      console.error("Failed to update order:", err);
    } finally {
      setUpdating(null);
    }
  }

  async function handleCancel(orderId: string) {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, "CANCELLED");
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err) {
      console.error("Failed to cancel order:", err);
    } finally {
      setUpdating(null);
    }
  }

  if (loading) return <Loader />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
        <Button variant="outline" size="sm" onClick={loadOrders}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {orders.length === 0 && (
        <p className="py-8 text-center text-gray-500">No active orders.</p>
      )}

      {orders.map((order) => (
        <div
          key={order.id}
          className="rounded-lg border border-gray-200 bg-white p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-gray-900">
                #{order.id.slice(0, 8).toUpperCase()}
              </span>
              <span className="ml-2 text-xs text-gray-500">
                {order.fulfillment_type === "delivery"
                  ? "Delivery"
                  : "Pickup"}
              </span>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <p className="mt-1 text-xs text-gray-500">
            {new Date(order.created_at).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            — {order.contact_phone}
          </p>

          {order.delivery_address && (
            <p className="mt-1 text-xs text-gray-500">
              {order.delivery_address.street}, {order.delivery_address.city}{" "}
              {order.delivery_address.postal_code}
            </p>
          )}

          <div className="mt-2 space-y-0.5 text-sm">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between">
                <span>
                  {item.quantity}x {item.product_name}
                </span>
                <span className="text-gray-500">
                  {formatPrice(item.item_total)}
                </span>
              </div>
            ))}
          </div>

          {order.notes && (
            <p className="mt-2 rounded bg-yellow-50 p-2 text-xs text-yellow-800">
              Note: {order.notes}
            </p>
          )}

          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
            <span className="font-bold text-orange-600">
              {formatPrice(order.total_amount)}
            </span>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleCancel(order.id)}
                disabled={updating === order.id}
              >
                Cancel
              </Button>
              {nextStatus[order.status] && (
                <Button
                  size="sm"
                  onClick={() => handleAdvance(order.id, order.status)}
                  disabled={updating === order.id}
                >
                  {nextLabel[order.status]}
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
