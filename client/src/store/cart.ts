import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface CartItem {
  variantId: string;
  sku: string;
  productSlug: string;
  productName: string;
  variantLabel: string;
  weightGrams: number;
  unitPriceKopecks: number;
  image?: string | null;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find(
            (cartItem) => cartItem.variantId === item.variantId
          );

          if (existing) {
            return {
              items: state.items.map((cartItem) =>
                cartItem.variantId === item.variantId
                  ? { ...cartItem, quantity: cartItem.quantity + quantity }
                  : cartItem
              )
            };
          }

          return {
            items: [...state.items, { ...item, quantity }]
          };
        }),
      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.variantId === variantId ? { ...item, quantity } : item
            )
            .filter((item) => item.quantity > 0)
        })),
      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((item) => item.variantId !== variantId)
        })),
      clear: () => set({ items: [] })
    }),
    {
      name: 'indigo-snacks-cart',
      storage: createJSONStorage(() => localStorage)
    }
  )
);

export const cartSelectors = {
  itemCount: (items: CartItem[]) =>
    items.reduce((total, item) => total + item.quantity, 0),
  subtotalKopecks: (items: CartItem[]) =>
    items.reduce((total, item) => total + item.unitPriceKopecks * item.quantity, 0),
  totalWeightGrams: (items: CartItem[]) =>
    items.reduce((total, item) => total + item.weightGrams * item.quantity, 0)
};
