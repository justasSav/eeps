"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CartItem,
  CartState,
  FulfillmentType,
  DeliveryAddress,
} from "@/types";
import { generateCartKey } from "@/lib/utils";

interface CartActions {
  addItem: (item: Omit<CartItem, "cart_key" | "quantity">) => void;
  removeItem: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  clearCart: () => void;
  setFulfillmentType: (type: FulfillmentType) => void;
  setDeliveryAddress: (address: DeliveryAddress | null) => void;
  setContactPhone: (phone: string) => void;
  setNotes: (notes: string) => void;
  getTotal: () => number;
  getItemCount: () => number;
}

const initialState: CartState = {
  items: [],
  fulfillment_type: "pickup",
  delivery_address: null,
  contact_phone: "",
  notes: "",
};

export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      addItem: (item) => {
        const cartKey = generateCartKey(item.product_id);
        set((state) => {
          const existing = state.items.find((i) => i.cart_key === cartKey);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.cart_key === cartKey
                  ? {
                      ...i,
                      quantity: i.quantity + 1,
                      item_total: i.base_price * (i.quantity + 1),
                    }
                  : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { ...item, cart_key: cartKey, quantity: 1 },
            ],
          };
        });
      },

      removeItem: (cartKey) => {
        set((state) => ({
          items: state.items.filter((i) => i.cart_key !== cartKey),
        }));
      },

      updateQuantity: (cartKey, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartKey);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.cart_key === cartKey
              ? {
                  ...i,
                  quantity,
                  item_total: i.base_price * quantity,
                }
              : i
          ),
        }));
      },

      clearCart: () => set(initialState),

      setFulfillmentType: (type) => set({ fulfillment_type: type }),
      setDeliveryAddress: (address) => set({ delivery_address: address }),
      setContactPhone: (phone) => set({ contact_phone: phone }),
      setNotes: (notes) => set({ notes }),

      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.item_total, 0);
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: "pizza-kebab-cart",
    }
  )
);
