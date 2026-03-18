'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/lib/cart';
import { useToastStore } from '@/lib/toast';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getSubtotal, getShipping, getTax, getTotal, getItemCount } = useCartStore();
  const { addToast } = useToastStore();

  const handleRemove = (slug: string, name: string) => {
    removeItem(slug);
    addToast(`${name} removed from cart`, 'info');
  };

  if (items.length === 0) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center bg-neutral-100 pt-28 pb-24">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-200 text-4xl">
            🛒
          </div>
          <h1 className="mb-2 font-heading text-3xl font-bold text-forest">Your Cart is Empty</h1>
          <p className="mb-8 text-clay">Discover our premium Ayurvedic collection</p>
          <Link
            href="/products"
            className="inline-block rounded-full bg-gold px-8 py-3.5 font-semibold text-forest transition-colors hover:bg-gold-dark"
          >
            Browse Products
          </Link>
        </div>
      </section>
    );
  }

  const subtotal = getSubtotal();
  const shipping = getShipping();
  const tax = getTax();
  const total = getTotal();

  return (
    <section className="bg-neutral-100 pt-28 pb-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <h1 className="mb-2 font-heading text-3xl font-bold text-forest md:text-4xl">Shopping Cart</h1>
        <p className="mb-10 text-clay">{getItemCount()} item{getItemCount() > 1 ? 's' : ''} in your cart</p>

        <div className="grid gap-10 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.slug}
                  className="flex gap-5 rounded-2xl border border-neutral-300 bg-white p-5 transition-shadow hover:shadow-md"
                >
                  <Link href={`/products/${item.slug}`} className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-neutral-200">
                    <Image src={item.image} alt={item.name} fill sizes="112px" className="object-contain p-2" />
                  </Link>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <Link href={`/products/${item.slug}`} className="font-heading text-lg font-bold text-forest hover:text-gold-dark">
                        {item.name}
                      </Link>
                      <p className="text-sm text-clay">{item.weight} · SKU: {item.sku}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-300 text-clay hover:border-gold hover:text-forest"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-300 text-clay hover:border-gold hover:text-forest"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-forest">₹{item.price * item.quantity}</p>
                          {item.originalPrice > item.price && (
                            <p className="text-xs text-clay line-through">₹{item.originalPrice * item.quantity}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemove(item.slug, item.name)}
                          className="text-sm text-clay hover:text-red-600"
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

            <button
              onClick={() => { clearCart(); addToast('Cart cleared', 'info'); }}
              className="mt-6 text-sm text-clay underline hover:text-forest"
            >
              Clear cart
            </button>
          </div>

          {/* Order Summary */}
          <div>
            <div className="sticky top-28 rounded-2xl border border-neutral-300 bg-white p-6">
              <h2 className="mb-5 font-heading text-xl font-bold text-forest">Order Summary</h2>
              <div className="space-y-3 border-b border-neutral-300 pb-4 text-sm">
                <div className="flex justify-between text-clay">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-clay">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between text-clay">
                  <span>Tax (18% GST)</span>
                  <span>₹{tax}</span>
                </div>
              </div>
              <div className="flex justify-between pt-4 text-lg font-bold text-forest">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
              {shipping > 0 && (
                <p className="mt-2 text-xs text-clay">Free shipping on orders over ₹999</p>
              )}
              <Link
                href="/checkout"
                className="mt-6 block w-full rounded-full bg-gold py-3.5 text-center font-semibold text-forest transition-colors hover:bg-gold-dark"
              >
                Proceed to Checkout
              </Link>
              <Link href="/products" className="mt-3 block text-center text-sm text-clay hover:text-forest">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
