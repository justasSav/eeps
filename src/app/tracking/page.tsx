"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { OrderTracker } from "@/features/orders/order-tracker";

function TrackingContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  if (!id) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="text-lg font-semibold text-gray-900">
          No order ID provided
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Please check your order link and try again.
        </p>
      </div>
    );
  }

  return <OrderTracker orderId={id} />;
}

export default function TrackingPage() {
  return (
    <Suspense>
      <TrackingContent />
    </Suspense>
  );
}
