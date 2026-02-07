"use client";

import { useState, useEffect, useCallback } from "react";
import type { Order, OrderStatus } from "@/types";
import { fetchOrder } from "@/services/orders";
import { useRealtime } from "@/hooks/useRealtime";
import { formatPrice } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";
import { Loader } from "@/components/shared/loader";
import { CheckCircle2 } from "lucide-react";

const statusSteps: OrderStatus[] = [
  "CREATED",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "COMPLETED",
];

export function OrderTracker({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder(orderId)
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleRealtimeUpdate = useCallback(
    (payload: Record<string, unknown>) => {
      setOrder((prev) =>
        prev ? { ...prev, status: payload.status as OrderStatus } : prev
      );
    },
    []
  );

  useRealtime("orders", { column: "id", value: orderId }, handleRealtimeUpdate);

  if (loading) return <Loader />;
  if (!order) {
    return (
      <p className="py-8 text-center text-gray-500">Order not found.</p>
    );
  }

  const currentIndex = statusSteps.indexOf(order.status);
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-900">Order Tracking</h1>
        <p className="mt-1 text-sm text-gray-500">
          Order #{order.id.slice(0, 8).toUpperCase()}
        </p>
        <div className="mt-2">
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* Progress steps */}
      {!isCancelled && (
        <div className="mx-auto max-w-xs">
          <div className="space-y-3">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentIndex;
              const isCurrent = index === currentIndex;
              return (
                <div key={step} className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      isCompleted
                        ? "bg-orange-600 text-white"
                        : "border-2 border-gray-300 text-gray-400"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <span className="text-xs">{index + 1}</span>
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      isCurrent
                        ? "font-semibold text-orange-600"
                        : isCompleted
                        ? "text-gray-600"
                        : "text-gray-400"
                    }`}
                  >
                    {step === "CREATED"
                      ? "Order Submitted"
                      : step === "ACCEPTED"
                      ? "Order Accepted"
                      : step === "PREPARING"
                      ? "In the Kitchen"
                      : step === "READY"
                      ? "Ready"
                      : "Completed"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="rounded-lg bg-red-50 p-4 text-center">
          <p className="font-medium text-red-800">This order was cancelled.</p>
        </div>
      )}

      {/* Order details */}
      <div className="rounded-lg border border-gray-200 p-4">
        <h2 className="mb-2 font-semibold text-gray-900">Order Details</h2>
        <div className="space-y-1 text-sm">
          <p>
            <span className="text-gray-500">Type:</span>{" "}
            {order.fulfillment_type === "delivery" ? "Delivery" : "Pickup"}
          </p>
          <p>
            <span className="text-gray-500">Phone:</span> {order.contact_phone}
          </p>
          {order.delivery_address && (
            <p>
              <span className="text-gray-500">Address:</span>{" "}
              {order.delivery_address.street}, {order.delivery_address.city}{" "}
              {order.delivery_address.postal_code}
            </p>
          )}
        </div>
        <div className="mt-3 border-t border-gray-200 pt-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span>
                {item.quantity}x {item.product_name}
              </span>
              <span>{formatPrice(item.item_total)}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-gray-100 pt-2 font-bold">
            <span>Total</span>
            <span className="text-orange-600">
              {formatPrice(order.total_amount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
