import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product: any;
  quantity: number;
}

interface StoreState {
  items: CartItem[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  favoriteProduct: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addItem: (product: any) => void;
  removeItem: (productId: string) => void;
  deleteCartProduct: (productId: string) => void;
  resetCart: () => void;
  getTotalPrice: () => number;
  getSubtotalPrice: () => number;
  getItemCount: (productId: string) => number;
  getGroupedItems: () => CartItem[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addToFavorite: (product: any) => void;
  resetFavorite: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getProductId(product: any): string {
  if (!product) return "";
  return String(product._id || product.id || "");
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      items: [],
      favoriteProduct: [],

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      addItem: (product: any) => {
        const id = getProductId(product);
        if (!id) return;
        const currentItems = get().items;
        const existingItem = currentItems.find(
          (item) => getProductId(item.product) === id
        );

        if (existingItem) {
          set({
            items: currentItems.map((item) =>
              getProductId(item.product) === id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({ items: [...currentItems, { product, quantity: 1 }] });
        }
      },

      removeItem: (productId: string) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(
          (item) => getProductId(item.product) === productId
        );

        if (existingItem && existingItem.quantity > 1) {
          set({
            items: currentItems.map((item) =>
              getProductId(item.product) === productId
                ? { ...item, quantity: item.quantity - 1 }
                : item
            ),
          });
        } else {
          set({
            items: currentItems.filter(
              (item) => getProductId(item.product) !== productId
            ),
          });
        }
      },

      deleteCartProduct: (productId: string) => {
        set({
          items: get().items.filter(
            (item) => getProductId(item.product) !== productId
          ),
        });
      },

      resetCart: () => set({ items: [] }),

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = item.product.price || 0;
          return total + price * item.quantity;
        }, 0);
      },

      getSubtotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = item.product.price || 0;
          const discount = item.product.discount || 0;
          const originalPrice =
            discount > 0 ? price + price * (discount / 100) : price;
          return total + originalPrice * item.quantity;
        }, 0);
      },

      getItemCount: (productId: string) => {
        const item = get().items.find(
          (item) => getProductId(item.product) === productId
        );
        return item ? item.quantity : 0;
      },

      getGroupedItems: () => get().items,

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      addToFavorite: (product: any) => {
        const id = getProductId(product);
        if (!id) return;
        const currentFavs = get().favoriteProduct;
        const exists = currentFavs.some((item) => getProductId(item) === id);

        if (exists) {
          set({
            favoriteProduct: currentFavs.filter(
              (item) => getProductId(item) !== id
            ),
          });
        } else {
          set({ favoriteProduct: [...currentFavs, product] });
        }
      },

      resetFavorite: () => set({ favoriteProduct: [] }),
    }),
    {
      name: "cart-store",
    }
  )
);
