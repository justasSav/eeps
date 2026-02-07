import type { OrderStatus } from "@/types";

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  CREATED: { label: "Pateiktas", color: "bg-gray-100 text-gray-800" },
  ACCEPTED: { label: "Priimtas", color: "bg-blue-100 text-blue-800" },
  PREPARING: { label: "Ruošiamas", color: "bg-yellow-100 text-yellow-800" },
  READY: { label: "Paruoštas", color: "bg-green-100 text-green-800" },
  COMPLETED: { label: "Įvykdytas", color: "bg-gray-100 text-gray-600" },
  CANCELLED: { label: "Atšauktas", color: "bg-red-100 text-red-800" },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}
    >
      {config.label}
    </span>
  );
}
