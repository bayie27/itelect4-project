import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UiState {
  isDarkMode: boolean;
  searchTerm: string;
  toggleDarkMode: () => void;
  setSearchTerm: (term: string) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      searchTerm: "",
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setSearchTerm: (term) => set({ searchTerm: term }),
    }),
    {
      name: "cirs-ui",
      partialize: (state) => ({ isDarkMode: state.isDarkMode }),
    },
  ),
);
