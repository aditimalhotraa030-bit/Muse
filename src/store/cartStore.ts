import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: string; // SKU or specific variant ID
  productId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  variant?: {
    type: string;
    value: string;
  };
  coverImage: string;
}

interface CartState {
  items: CartItem[];
  _hasHydrated: boolean;
  isCartDrawerOpen: boolean;
  setHasHydrated: (state: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      _hasHydrated: false,
      isCartDrawerOpen: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      openCart: () => set({ isCartDrawerOpen: true }),
      closeCart: () => set({ isCartDrawerOpen: false }),
      addItem: (item) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((i) => i.id === item.id);
        
        if (existingItem) {
          set({
            items: currentItems.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
          });
        } else {
          set({ items: [...currentItems, item] });
        }
      },
      removeItem: (id) => {
        set({
          items: get().items.filter((item) => item.id !== id),
        });
      },
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      getCartTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'muse-cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
