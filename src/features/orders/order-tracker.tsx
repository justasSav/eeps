"use client";

import type { OrderStatus } from "@/types";
import { useOrderStore } from "@/store/orders";
import { formatPrice } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";
import { CheckCircle2 } from "lucide-react";

const statusSteps: OrderStatus[] = [
  "CREATED",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "COMPLETED",
];

const stepLabels: Record<string, string> = {
  CREATED: "Užsakymas pateiktas",
  ACCEPTED: "Užsakymas priimtas",
  PREPARING: "Ruošiamas",
  READY: "Paruoštas",
  COMPLETED: "Įvykdytas",
};

export function OrderTracker({ orderId }: { orderId: string }) {
  const order = useOrderStore(
    (s) => s.orders.find((o) => o.id === orderId) ?? null
  );

  if (!order) {
    return (
      <p className="py-8 text-center text-gray-500">Užsakymas nerastas.</p>
    );
  }

  const currentIndex = statusSteps.indexOf(order.status);
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-900">Užsakymo sekimas</h1>
        <p className="mt-1 text-sm text-gray-500">
          Užsakymas #{order.id}
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
                    {stepLabels[step]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="rounded-lg bg-red-50 p-4 text-center">
          <p className="font-medium text-red-800">Šis užsakymas buvo atšauktas.</p>
        </div>
      )}

      {/* Order details */}
      <div className="rounded-lg border border-gray-200 p-4">
        <h2 className="mb-2 font-semibold text-gray-900">Užsakymo informacija</h2>
        <div className="space-y-1 text-sm">
          <p>
            <span className="text-gray-500">Tipas:</span>{" "}
            {order.fulfillment_type === "delivery" ? "Pristatymas" : "Atsiėmimas"}
          </p>
          <p>
            <span className="text-gray-500">Telefonas:</span> {order.contact_phone}
          </p>
          {order.delivery_address && (
            <p>
              <span className="text-gray-500">Adresas:</span>{" "}
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
            <span>Iš viso</span>
            <span className="text-orange-600">
              {formatPrice(order.total_amount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
