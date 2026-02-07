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
          Užsakymo ID nenurodytas
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Patikrinkite savo užsakymo nuorodą ir bandykite dar kartą.
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
