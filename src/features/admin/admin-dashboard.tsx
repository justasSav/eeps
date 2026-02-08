"use client";

import type { OrderStatus } from "@/types";
import { useOrderStore } from "@/store/orders";
import { useAuthStore } from "@/store/auth";
import { formatPrice } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { AdminLogin } from "@/features/admin/admin-login";
import { RefreshCw, LogOut } from "lucide-react";
import { useMemo, useState } from "react";

const activeStatuses: OrderStatus[] = [
  "CREATED",
  "ACCEPTED",
  "PREPARING",
  "READY",
];

const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  CREATED: "ACCEPTED",
  ACCEPTED: "PREPARING",
  PREPARING: "READY",
  READY: "COMPLETED",
};

const nextLabel: Partial<Record<OrderStatus, string>> = {
  CREATED: "Priimti",
  ACCEPTED: "Pradėti ruošti",
  PREPARING: "Pažymėti paruoštu",
  READY: "Užbaigti",
};

export function AdminDashboard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const allOrders = useOrderStore((s) => s.orders);
  const updateStatus = useOrderStore((s) => s.updateOrderStatus);
  const orders = useMemo(
    () =>
      allOrders
        .filter((o) => activeStatuses.includes(o.status))
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ),
    [allOrders]
  );
  const [, setTick] = useState(0);

  function refresh() {
    setTick((t) => t + 1);
  }

  function handleAdvance(orderId: string, currentStatus: OrderStatus) {
    const next = nextStatus[currentStatus];
    if (!next) return;
    updateStatus(orderId, next);
  }

  function handleCancel(orderId: string) {
    updateStatus(orderId, "CANCELLED");
  }

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Administratoriaus skydelis</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="h-4 w-4" />
            Atnaujinti
          </Button>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Atsijungti
          </Button>
        </div>
      </div>

      {orders.length === 0 && (
        <p className="py-8 text-center text-gray-500">Aktyvių užsakymų nėra.</p>
      )}

      {orders.map((order) => (
        <div
          key={order.id}
          className="overflow-hidden rounded-lg border border-gray-200 bg-white p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-gray-900">
                Užsakymas #{order.id}
              </span>
              <span className="ml-2 text-xs text-gray-500">
                {order.fulfillment_type === "delivery"
                  ? "Pristatymas"
                  : "Atsiėmimas"}
              </span>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <p className="mt-1 break-all text-xs text-gray-500">
            {new Date(order.created_at).toLocaleTimeString("lt-LT", {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            — {order.contact_phone}
          </p>

          {order.delivery_address && (
            <p className="mt-1 break-words text-xs text-gray-500">
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
            <p className="mt-2 break-words rounded bg-yellow-50 p-2 text-xs text-yellow-800">
              Pastaba: {order.notes}
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
              >
                Atšaukti
              </Button>
              {nextStatus[order.status] && (
                <Button
                  size="sm"
                  onClick={() => handleAdvance(order.id, order.status)}
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
