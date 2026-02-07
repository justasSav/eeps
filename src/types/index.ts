// === Database / Domain Types ===

export type OrderStatus =
  | "CREATED"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

export type FulfillmentType = "delivery" | "pickup";

export interface ModifierOption {
  id: string;
  name: string;
  price_mod: number; // in pence/cents
}

export interface ModifierGroup {
  id: string;
  name: string;
  min_required: number;
  max_allowed: number;
  options: ModifierOption[];
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  description: string;
  base_price: number; // in pence/cents
  image_url: string | null;
  is_available: boolean;
  dietary_tags: string[]; // e.g. ["vegetarian", "spicy"]
  modifier_groups: ModifierGroup[];
}

export interface Category {
  id: string;
  name: string;
  sort_order: number;
  products: Product[];
}

export interface DeliveryAddress {
  street: string;
  city: string;
  postal_code: string;
  notes: string;
}

export interface OrderItemModifiers {
  [groupName: string]: string | string[] | number;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  base_price: number;
  modifiers: OrderItemModifiers;
  item_total: number; // base_price + modifier adjustments * quantity
}

export interface Order {
  id: string;
  fulfillment_type: FulfillmentType;
  status: OrderStatus;
  delivery_address: DeliveryAddress | null;
  contact_phone: string;
  items: OrderItem[];
  total_amount: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

// === Cart Types ===

export interface CartItem {
  /** Unique key combining product_id + serialized modifiers */
  cart_key: string;
  product_id: string;
  product_name: string;
  quantity: number;
  base_price: number;
  modifiers: OrderItemModifiers;
  item_total: number;
}

export interface CartState {
  items: CartItem[];
  fulfillment_type: FulfillmentType;
  delivery_address: DeliveryAddress | null;
  contact_phone: string;
  notes: string;
}

// === Menu Response (nested) ===

export interface MenuResponse {
  categories: Category[];
}
