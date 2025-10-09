import { Medicine } from "./medicine";

export interface CartItem {
  id: string;
  medicine: Medicine;
  medicineId: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
}

export interface AddToCartPayload {
  medicineId: string;
  quantity: number;
}

export interface UpdateCartItemPayload {
  itemId: string;
  quantity: number;
}
