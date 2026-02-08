import { supabase } from "@/lib/supabase";
import type {
  Order,
  OrderStatus,
  CartItem,
  FulfillmentType,
  DeliveryAddress,
  OrderItem,
} from "@/types";

async function getOrCreateUserId(): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.user?.id) return session.user.id;

  // Sign in anonymously to get a user_id for RLS
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw new Error(`Auth failed: ${error.message}`);
  return data.user!.id;
}

export async function submitOrderToSupabase(params: {
  items: CartItem[];
  fulfillmentType: FulfillmentType;
  deliveryAddress: DeliveryAddress | null;
  contactPhone: string;
  notes: string;
  totalAmount: number;
}): Promise<Order> {
  const userId = await getOrCreateUserId();

  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      fulfillment_type: params.fulfillmentType,
      status: "CREATED",
      delivery_address: params.deliveryAddress,
      contact_phone: params.contactPhone,
      notes: params.notes,
      total_amount: params.totalAmount,
    })
    .select()
    .single();

  if (orderError) {
    throw new Error(`Failed to create order: ${orderError.message}`);
  }

  const orderItems = params.items.map((item) => ({
    order_id: orderRow.id,
    product_id: item.product_id,
    product_name: item.product_name,
    quantity: item.quantity,
    base_price: item.base_price,
    item_total: item.item_total,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    throw new Error(`Failed to create order items: ${itemsError.message}`);
  }

  return {
    id: orderRow.id,
    fulfillment_type: orderRow.fulfillment_type as FulfillmentType,
    status: orderRow.status as OrderStatus,
    delivery_address: orderRow.delivery_address as DeliveryAddress | null,
    contact_phone: orderRow.contact_phone,
    items: orderItems.map(
      (item): OrderItem => ({
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        base_price: item.base_price,
        item_total: item.item_total,
      })
    ),
    total_amount: orderRow.total_amount,
    notes: orderRow.notes,
    created_at: orderRow.created_at,
    updated_at: orderRow.updated_at,
  };
}

export async function fetchOrder(orderId: string): Promise<Order | null> {
  const { data: orderRow, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (error || !orderRow) return null;

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  return {
    id: orderRow.id,
    fulfillment_type: orderRow.fulfillment_type as FulfillmentType,
    status: orderRow.status as OrderStatus,
    delivery_address: orderRow.delivery_address as DeliveryAddress | null,
    contact_phone: orderRow.contact_phone,
    items: (items ?? []).map(
      (item): OrderItem => ({
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        base_price: item.base_price,
        item_total: item.item_total,
      })
    ),
    total_amount: orderRow.total_amount,
    notes: orderRow.notes,
    created_at: orderRow.created_at,
    updated_at: orderRow.updated_at,
  };
}

export async function fetchUserOrders(): Promise<Order[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user?.id) return [];

  const { data: orderRows, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch user orders: ${error.message}`);
  if (!orderRows) return [];

  const orders: Order[] = [];
  for (const row of orderRows) {
    const { data: items } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", row.id);

    orders.push({
      id: row.id,
      fulfillment_type: row.fulfillment_type as FulfillmentType,
      status: row.status as OrderStatus,
      delivery_address: row.delivery_address as DeliveryAddress | null,
      contact_phone: row.contact_phone,
      items: (items ?? []).map(
        (item): OrderItem => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          base_price: item.base_price,
          item_total: item.item_total,
        })
      ),
      total_amount: row.total_amount,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
    });
  }

  return orders;
}

export async function updateOrderStatusInSupabase(
  orderId: string,
  status: OrderStatus
): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) {
    throw new Error(`Failed to update order status: ${error.message}`);
  }
}

export async function fetchAllOrders(): Promise<Order[]> {
  const { data: orderRows, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch all orders: ${error.message}`);
  if (!orderRows) return [];

  const orders: Order[] = [];
  for (const row of orderRows) {
    const { data: items } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", row.id);

    orders.push({
      id: row.id,
      fulfillment_type: row.fulfillment_type as FulfillmentType,
      status: row.status as OrderStatus,
      delivery_address: row.delivery_address as DeliveryAddress | null,
      contact_phone: row.contact_phone,
      items: (items ?? []).map(
        (item): OrderItem => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          base_price: item.base_price,
          item_total: item.item_total,
        })
      ),
      total_amount: row.total_amount,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
    });
  }

  return orders;
}
