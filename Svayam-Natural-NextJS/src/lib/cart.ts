'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getShippingFee } from '@/lib/shipping';

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  weight: string;
  sku: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  hasHydrated: boolean;

  setHasHydrated: (value: boolean) => void;

  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  setItems: (items: CartItem[]) => void;
  removeItem: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  getSubtotal: () => number;
  getShipping: () => number;
  getTax: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      addItem: (item, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.slug === item.slug);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.slug === item.slug
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity }] };
        });
      },

      setItems: (items) => set({ items }),

      removeItem: (slug) => {
        set((state) => ({
          items: state.items.filter((i) => i.slug !== slug),
        }));
      },

      updateQuantity: (slug, quantity) => {
        if (quantity <= 0) {
          get().removeItem(slug);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.slug === slug ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      getShipping: () => getShippingFee(get().getSubtotal()),

      getTax: () => 0,

      getTotal: () =>
        get().getSubtotal() + get().getShipping(),

      getItemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'svayam-cart',
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
