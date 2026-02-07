import { supabase } from "@/lib/supabase";
import type { Order, CartItem, FulfillmentType, DeliveryAddress } from "@/types";

interface SubmitOrderParams {
  userId: string;
  items: CartItem[];
  fulfillmentType: FulfillmentType;
  deliveryAddress: DeliveryAddress | null;
  contactPhone: string;
  notes: string;
  totalAmount: number;
}

export async function submitOrder(params: SubmitOrderParams): Promise<string> {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: params.userId,
      fulfillment_type: params.fulfillmentType,
      status: "CREATED",
      delivery_address: params.deliveryAddress,
      contact_phone: params.contactPhone,
      notes: params.notes,
      total_amount: params.totalAmount,
    })
    .select("id")
    .single();

  if (orderError) throw orderError;

  const orderItems = params.items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    product_name: item.product_name,
    quantity: item.quantity,
    base_price: item.base_price,
    modifiers: item.modifiers,
    item_total: item.item_total,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return order.id;
}

export async function fetchUserOrders(userId: string): Promise<Order[]> {
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const result: Order[] = [];

  for (const order of orders ?? []) {
    const { data: items } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);

    result.push({
      id: order.id,
      user_id: order.user_id,
      fulfillment_type: order.fulfillment_type,
      status: order.status,
      delivery_address: order.delivery_address,
      contact_phone: order.contact_phone,
      items: (items ?? []).map((i) => ({
        product_id: i.product_id,
        product_name: i.product_name,
        quantity: i.quantity,
        base_price: i.base_price,
        modifiers: i.modifiers,
        item_total: i.item_total,
      })),
      total_amount: order.total_amount,
      notes: order.notes,
      created_at: order.created_at,
      updated_at: order.updated_at,
    });
  }

  return result;
}

export async function fetchOrder(orderId: string): Promise<Order | null> {
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (error) return null;

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", order.id);

  return {
    id: order.id,
    user_id: order.user_id,
    fulfillment_type: order.fulfillment_type,
    status: order.status,
    delivery_address: order.delivery_address,
    contact_phone: order.contact_phone,
    items: (items ?? []).map((i) => ({
      product_id: i.product_id,
      product_name: i.product_name,
      quantity: i.quantity,
      base_price: i.base_price,
      modifiers: i.modifiers,
      item_total: i.item_total,
    })),
    total_amount: order.total_amount,
    notes: order.notes,
    created_at: order.created_at,
    updated_at: order.updated_at,
  };
}

export async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) throw error;
}

export async function fetchActiveOrders(): Promise<Order[]> {
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .in("status", ["CREATED", "ACCEPTED", "PREPARING", "READY"])
    .order("created_at", { ascending: true });

  if (error) throw error;

  const result: Order[] = [];

  for (const order of orders ?? []) {
    const { data: items } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);

    result.push({
      id: order.id,
      user_id: order.user_id,
      fulfillment_type: order.fulfillment_type,
      status: order.status,
      delivery_address: order.delivery_address,
      contact_phone: order.contact_phone,
      items: (items ?? []).map((i) => ({
        product_id: i.product_id,
        product_name: i.product_name,
        quantity: i.quantity,
        base_price: i.base_price,
        modifiers: i.modifiers,
        item_total: i.item_total,
      })),
      total_amount: order.total_amount,
      notes: order.notes,
      created_at: order.created_at,
      updated_at: order.updated_at,
    });
  }

  return result;
}
