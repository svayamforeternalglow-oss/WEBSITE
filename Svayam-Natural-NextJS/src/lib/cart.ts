'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
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

      getShipping: () => (get().getSubtotal() > 1500 ? 0 : 100),

      getTax: () => Math.round(get().getSubtotal() * 0.18),

      getTotal: () =>
        get().getSubtotal() + get().getShipping() + get().getTax(),

      getItemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'svayam-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
