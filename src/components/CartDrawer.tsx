'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/lib/cart';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal, getTotal, getItemCount } = useCartStore();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[90] bg-forest/40 backdrop-blur-sm" onClick={closeCart} />
      <div className="fixed top-0 right-0 z-[95] flex h-full w-full max-w-md flex-col bg-neutral-100 shadow-2xl animate-slideInRight">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-300 px-6 py-5">
          <h2 className="font-heading text-xl font-bold text-forest">
            Your Cart ({getItemCount()})
          </h2>
          <button onClick={closeCart} className="text-2xl text-clay hover:text-forest" aria-label="Close cart">
            ×
          </button>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <p className="mb-2 font-heading text-lg text-clay">Your cart is empty</p>
            <p className="mb-6 text-sm text-clay-light">Discover our Ayurvedic collection</p>
            <Link
              href="/products"
              onClick={closeCart}
              className="rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-forest transition-colors hover:bg-gold-dark"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
              {items.map((item) => (
                <div key={item.slug} className="flex gap-4 rounded-xl border border-neutral-300 bg-white p-3">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-200">
                    <Image src={item.image} alt={item.name} fill sizes="80px" className="object-contain p-1" />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-forest">{item.name}</h3>
                      <p className="text-xs text-clay">{item.weight} · {item.sku}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-lg border border-neutral-300 bg-neutral-100">
                        <button
                          onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                          className="px-2.5 py-1 text-sm text-clay hover:text-forest"
                        >
                          −
                        </button>
                        <span className="min-w-[1.5rem] text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                          className="px-2.5 py-1 text-sm text-clay hover:text-forest"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-forest">₹{item.price * item.quantity}</span>
                        <button
                          onClick={() => removeItem(item.slug)}
                          className="text-xs text-clay hover:text-red-600"
                          aria-label={`Remove ${item.name}`}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-neutral-300 bg-white px-6 py-5">
              <div className="mb-1 flex justify-between text-sm text-clay">
                <span>Subtotal</span>
                <span>₹{getSubtotal()}</span>
              </div>
              <div className="mb-3 flex justify-between text-sm font-semibold text-forest">
                <span>Total</span>
                <span>₹{getTotal()}</span>
              </div>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="block w-full rounded-full bg-gold py-3 text-center text-sm font-bold text-forest transition-colors hover:bg-gold-dark"
              >
                Checkout · ₹{getTotal()}
              </Link>
              <button
                onClick={closeCart}
                className="mt-2 block w-full text-center text-sm text-clay hover:text-forest"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
