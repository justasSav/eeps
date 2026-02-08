"use client";

import { create } from "zustand";
import type {
  Order,
  OrderStatus,
  CartItem,
  FulfillmentType,
  DeliveryAddress,
} from "@/types";
import {
  submitOrderToSupabase,
  fetchOrder,
  fetchUserOrders,
  fetchAllOrders,
  updateOrderStatusInSupabase,
} from "@/services/orders";

interface OrderStoreState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

interface OrderStoreActions {
  submitOrder: (params: {
    items: CartItem[];
    fulfillmentType: FulfillmentType;
    deliveryAddress: DeliveryAddress | null;
    contactPhone: string;
    notes: string;
    totalAmount: number;
  }) => Promise<string>;
  getOrder: (orderId: string) => Promise<Order | null>;
  loadUserOrders: () => Promise<void>;
  loadAllOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  getActiveOrders: () => Order[];
}

export const useOrderStore = create<OrderStoreState & OrderStoreActions>()(
  (set, get) => ({
    orders: [],
    loading: false,
    error: null,

    submitOrder: async (params) => {
      set({ loading: true, error: null });
      try {
        const order = await submitOrderToSupabase(params);
        set((state) => ({
          orders: [order, ...state.orders],
          loading: false,
        }));
        return order.id;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Nepavyko pateikti užsakymo.";
        set({ error: message, loading: false });
        throw err;
      }
    },

    getOrder: async (orderId) => {
      const cached = get().orders.find((o) => o.id === orderId);
      if (cached) return cached;

      const order = await fetchOrder(orderId);
      if (order) {
        set((state) => {
          const exists = state.orders.some((o) => o.id === order.id);
          return exists ? state : { orders: [...state.orders, order] };
        });
      }
      return order;
    },

    loadUserOrders: async () => {
      set({ loading: true, error: null });
      try {
        const orders = await fetchUserOrders();
        set({ orders, loading: false });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Nepavyko užkrauti užsakymų.";
        set({ error: message, loading: false });
      }
    },

    loadAllOrders: async () => {
      set({ loading: true, error: null });
      try {
        const orders = await fetchAllOrders();
        set({ orders, loading: false });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Nepavyko užkrauti užsakymų.";
        set({ error: message, loading: false });
      }
    },

    updateOrderStatus: async (orderId, status) => {
      try {
        await updateOrderStatusInSupabase(orderId, status);
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? { ...o, status, updated_at: new Date().toISOString() }
              : o
          ),
        }));
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Nepavyko atnaujinti užsakymo būsenos.";
        set({ error: message });
      }
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
  })
);
