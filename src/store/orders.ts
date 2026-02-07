"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Order,
  OrderStatus,
  CartItem,
  FulfillmentType,
  DeliveryAddress,
} from "@/types";

function generateOrderCode(): string {
  return String(Math.floor(100 + Math.random() * 900));
}

interface OrderStoreState {
  orders: Order[];
}

interface OrderStoreActions {
  submitOrder: (params: {
    items: CartItem[];
    fulfillmentType: FulfillmentType;
    deliveryAddress: DeliveryAddress | null;
    contactPhone: string;
    notes: string;
    totalAmount: number;
  }) => string;
  getOrder: (orderCode: string) => Order | null;
  getOrdersByPhone: (phone: string) => Order[];
  getAllOrders: () => Order[];
  getActiveOrders: () => Order[];
  updateOrderStatus: (orderCode: string, status: OrderStatus) => void;
}

export const useOrderStore = create<OrderStoreState & OrderStoreActions>()(
  persist(
    (set, get) => ({
      orders: [],

      submitOrder: (params) => {
        let code = generateOrderCode();
        const existing = get().orders;
        // Ensure unique code
        while (existing.some((o) => o.id === code)) {
          code = generateOrderCode();
        }

        const now = new Date().toISOString();
        const order: Order = {
          id: code,
          fulfillment_type: params.fulfillmentType,
          status: "CREATED",
          delivery_address: params.deliveryAddress,
          contact_phone: params.contactPhone,
          items: params.items.map((item) => ({
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            base_price: item.base_price,
            modifiers: item.modifiers,
            item_total: item.item_total,
          })),
          total_amount: params.totalAmount,
          notes: params.notes,
          created_at: now,
          updated_at: now,
        };

        set((state) => ({ orders: [order, ...state.orders] }));
        return code;
      },

      getOrder: (orderCode) => {
        return get().orders.find((o) => o.id === orderCode) ?? null;
      },

      getOrdersByPhone: (phone) => {
        return get()
          .orders.filter((o) => o.contact_phone === phone)
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );
      },

      getAllOrders: () => {
        return [...get().orders].sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );
      },

      getActiveOrders: () => {
        const activeStatuses: OrderStatus[] = [
          "CREATED",
          "ACCEPTED",
          "PREPARING",
          "READY",
        ];
        return get()
          .orders.filter((o) => activeStatuses.includes(o.status))
          .sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          );
      },

      updateOrderStatus: (orderCode, status) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderCode
              ? { ...o, status, updated_at: new Date().toISOString() }
              : o
          ),
        }));
      },
    }),
    {
      name: "eeps-orders",
    }
  )
);
