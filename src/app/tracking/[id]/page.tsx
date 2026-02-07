import { OrderTracker } from "@/features/orders/order-tracker";

export default async function TrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderTracker orderId={id} />;
}
