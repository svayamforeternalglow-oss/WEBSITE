'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
}

interface WishlistStore {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (slug: string) => void;
  isInWishlist: (slug: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const { items } = get();
        if (!items.find((i) => i.slug === item.slug)) {
          set({ items: [item, ...items] });
        }
      },
      removeItem: (slug) => {
        set({ items: get().items.filter((i) => i.slug !== slug) });
      },
      isInWishlist: (slug) => {
        return !!get().items.find((i) => i.slug === slug);
      },
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'svayam-wishlist',
    }
  )
);
