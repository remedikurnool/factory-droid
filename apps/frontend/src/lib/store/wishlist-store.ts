import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Medicine } from "../types/medicine";

interface WishlistStore {
  items: Medicine[];
  addItem: (medicine: Medicine) => void;
  removeItem: (medicineId: string) => void;
  toggleItem: (medicine: Medicine) => void;
  isInWishlist: (medicineId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (medicine: Medicine) => {
        set((state) => {
          // Don't add if already in wishlist
          if (state.items.some((item) => item.id === medicine.id)) {
            return state;
          }
          return {
            items: [...state.items, medicine],
          };
        });
      },

      removeItem: (medicineId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== medicineId),
        }));
      },

      toggleItem: (medicine: Medicine) => {
        const isInWishlist = get().isInWishlist(medicine.id);
        if (isInWishlist) {
          get().removeItem(medicine.id);
        } else {
          get().addItem(medicine);
        }
      },

      isInWishlist: (medicineId: string) => {
        return get().items.some((item) => item.id === medicineId);
      },

      clearWishlist: () => {
        set({ items: [] });
      },
    }),
    {
      name: "wishlist-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
