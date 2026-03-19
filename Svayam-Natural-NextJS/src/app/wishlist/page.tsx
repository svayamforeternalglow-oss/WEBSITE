'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWishlistStore } from '@/lib/wishlist';
import { useCartStore } from '@/lib/cart';
import { useToastStore } from '@/lib/toast';
import SectionHeader from '@/components/SectionHeader';
import { ShoppingBagIcon } from '@/components/icons';

export default function WishlistPage() {
  const [mounted, setMounted] = useState(false);
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const addItemToCart = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const addToast = useToastStore((s) => s.addToast);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleMoveToCart = (item: any) => {
    addItemToCart({
      productId: item.productId,
      slug: item.slug,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice || item.price,
      weight: item.weight || 'N/A',
      sku: item.sku || 'NO-SKU',
      image: item.image,
    });
    removeItem(item.slug);
    addToast(`${item.name} moved to cart`, 'success');
    openCart();
  };

  return (
    <div className="min-h-screen bg-neutral-100 pb-24 pt-32">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <SectionHeader title="Your Wishlist" subtitle="Handpicked favorites saved for later." />

        {items.length === 0 ? (
          <div className="mt-12 text-center">
            <div className="mb-6 flex justify-center">
              <span className="text-6xl">✨</span>
            </div>
            <h3 className="mb-2 font-heading text-2xl text-forest">Your wishlist is empty</h3>
            <p className="mb-8 text-clay">Browse our collections and save your favorite items here.</p>
            <Link
              href="/products"
              className="inline-flex rounded-full bg-forest px-8 py-3 text-sm font-semibold tracking-wider text-sand transition-all hover:bg-forest-light"
            >
              EXPLORE PRODUCTS
            </Link>
          </div>
        ) : (
          <div className="mt-8">
            <div className="mb-6 flex justify-end">
              <button
                onClick={clearWishlist}
                className="text-sm font-medium text-clay hover:text-red-500 transition-colors"
              >
                Clear Wishlist
              </button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <div key={item.slug} className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-md">
                  <Link href={`/products/${item.slug}`} className="block">
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-50">
                      <Image
                        src={item.image || '/images/placeholder.jpg'}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </Link>
                  <div className="mt-4">
                    <Link href={`/products/${item.slug}`} className="block">
                      <h3 className="font-heading text-lg font-bold text-forest line-clamp-1">{item.name}</h3>
                    </Link>
                    <p className="mt-1 font-semibold text-gold-dark">₹{item.price}</p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleMoveToCart(item)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-forest py-2.5 text-sm font-semibold text-sand transition-colors hover:bg-forest-light"
                    >
                      <ShoppingBagIcon className="h-4 w-4" />
                      Move to Cart
                    </button>
                    <button
                      onClick={() => {
                        removeItem(item.slug);
                        addToast(`${item.name} removed`, 'info');
                      }}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 text-clay hover:border-red-500 hover:text-red-500 transition-colors"
                      title="Remove from wishlist"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
