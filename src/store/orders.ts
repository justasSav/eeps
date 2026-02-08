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
  persist(
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
        } catch {
          // Supabase unavailable — create a local-only order as fallback
          const localId = String(Math.floor(100 + Math.random() * 900));
          const now = new Date().toISOString();
          const order: Order = {
            id: localId,
            fulfillment_type: params.fulfillmentType,
            status: "CREATED",
            delivery_address: params.deliveryAddress,
            contact_phone: params.contactPhone,
            items: params.items.map((item) => ({
              product_id: item.product_id,
              product_name: item.product_name,
              quantity: item.quantity,
              base_price: item.base_price,
              item_total: item.item_total,
            })),
            total_amount: params.totalAmount,
            notes: params.notes,
            created_at: now,
            updated_at: now,
          };
          set((state) => ({
            orders: [order, ...state.orders],
            loading: false,
          }));
          return localId;
        }
      },

      getOrder: async (orderId) => {
        const cached = get().orders.find((o) => o.id === orderId);
        if (cached) return cached;

        try {
          const order = await fetchOrder(orderId);
          if (order) {
            set((state) => {
              const exists = state.orders.some((o) => o.id === order.id);
              return exists ? state : { orders: [...state.orders, order] };
            });
          }
          return order;
        } catch {
          return null;
        }
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
        // Update local state optimistically
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? { ...o, status, updated_at: new Date().toISOString() }
              : o
          ),
        }));
        // Then try to sync with Supabase (best-effort)
        try {
          await updateOrderStatusInSupabase(orderId, status);
        } catch {
          // Supabase update failed; local state is already updated
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
    }),
    {
      name: "eeps-orders",
      partialize: (state) => ({ orders: state.orders }),
    }
  )
);
