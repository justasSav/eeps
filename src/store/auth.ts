"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const DEMO_USERNAME = "demo";
const DEMO_PASSWORD = "demo";

interface AuthState {
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      isAuthenticated: false,

      login: (username, password) => {
        if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ isAuthenticated: false });
      },
    }),
    {
      name: "eeps-admin-auth",
    }
  )
);
