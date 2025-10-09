import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Medicine } from "../types/medicine";
import type { CartItem, Cart } from "../types/cart";

interface CartStore extends Cart {
  addItem: (medicine: Medicine, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (medicineId: string) => number;
  isInCart: (medicineId: string) => boolean;
}

const DELIVERY_FEE = 40; // ₹40 flat delivery fee
const FREE_DELIVERY_THRESHOLD = 500; // Free delivery above ₹500

const calculateTotals = (items: CartItem[]): Omit<Cart, "items"> => {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const discount = items.reduce(
    (sum, item) =>
      sum + (item.medicine.mrp - item.medicine.sellingPrice) * item.quantity,
    0,
  );
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    totalItems,
    subtotal,
    discount,
    deliveryFee,
    total,
  };
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      subtotal: 0,
      discount: 0,
      deliveryFee: 0,
      total: 0,

      addItem: (medicine: Medicine, quantity: number = 1) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.medicineId === medicine.id,
          );

          let newItems: CartItem[];

          if (existingItem) {
            // Update quantity if item exists
            newItems = state.items.map((item) =>
              item.medicineId === medicine.id
                ? {
                    ...item,
                    quantity: item.quantity + quantity,
                    totalPrice: (item.quantity + quantity) * item.price,
                  }
                : item,
            );
          } else {
            // Add new item
            const newItem: CartItem = {
              id: `${medicine.id}-${Date.now()}`,
              medicine,
              medicineId: medicine.id,
              quantity,
              price: medicine.sellingPrice,
              totalPrice: medicine.sellingPrice * quantity,
            };
            newItems = [...state.items, newItem];
          }

          return {
            items: newItems,
            ...calculateTotals(newItems),
          };
        });
      },

      removeItem: (itemId: string) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== itemId);
          return {
            items: newItems,
            ...calculateTotals(newItems),
          };
        });
      },

      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        set((state) => {
          const newItems = state.items.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  quantity,
                  totalPrice: quantity * item.price,
                }
              : item,
          );
          return {
            items: newItems,
            ...calculateTotals(newItems),
          };
        });
      },

      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          subtotal: 0,
          discount: 0,
          deliveryFee: 0,
          total: 0,
        });
      },

      getItemQuantity: (medicineId: string) => {
        const item = get().items.find((item) => item.medicineId === medicineId);
        return item ? item.quantity : 0;
      },

      isInCart: (medicineId: string) => {
        return get().items.some((item) => item.medicineId === medicineId);
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
