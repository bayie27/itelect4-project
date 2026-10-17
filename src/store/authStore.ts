import { create } from "zustand";
import { persist } from "zustand/middleware";
import { queryClient } from "../api/queryClient";
import type { User } from "../types";

export interface AuthState {
  token: string | null;
  user: User | null;
  sessionMessage: string | null;
  sessionVersion: number;
  login: (token: string, user: User) => void;
  logout: () => void;
  expireSession: (message: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      sessionMessage: null,
      sessionVersion: 0,
      login: (token, user) => {
        queryClient.clear();
        set((state) => ({
          token,
          user,
          sessionMessage: null,
          sessionVersion: state.sessionVersion + 1,
        }));
      },
      logout: () => {
        queryClient.clear();
        set((state) => ({
          token: null,
          user: null,
          sessionMessage: null,
          sessionVersion: state.sessionVersion + 1,
        }));
      },
      expireSession: (message) => {
        queryClient.clear();
        set((state) => ({
          token: null,
          user: null,
          sessionMessage: message,
          sessionVersion: state.sessionVersion + 1,
        }));
      },
    }),
    {
      name: "cirs-auth",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        sessionMessage: state.sessionMessage,
      }),
    },
  ),
);
