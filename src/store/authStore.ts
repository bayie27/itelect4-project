import { create } from "zustand";

export interface AuthState {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  login: (token) => set({ token }),
  logout: () => set({ token: null }),
}));
