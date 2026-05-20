'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FREE_DELIVERY_THRESHOLD } from '@/lib/shipping';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const freeDeliveryFlag = searchParams.get('fd');
  const subtotalRaw = searchParams.get('sub');
  const subtotalParam = subtotalRaw ? Number(subtotalRaw) : null;
  const subtotal = subtotalParam !== null && Number.isFinite(subtotalParam) ? subtotalParam : null;
  const remaining = subtotal === null
    ? null
    : Math.max(0, Math.ceil(FREE_DELIVERY_THRESHOLD - subtotal));
  const isFreeDelivery = freeDeliveryFlag === '1';

  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-neutral-100 pt-28 pb-24">
      <div className="mx-auto max-w-lg px-6 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-forest text-4xl text-sand animate-fadeInUp">
          ✓
        </div>
        <h1 className="mb-3 font-heading text-3xl font-bold text-forest animate-fadeInUp" style={{ animationDelay: '100ms' }}>
          Order Confirmed!
        </h1>
        {orderNumber && (
          <p className="mb-2 text-lg text-clay animate-fadeInUp" style={{ animationDelay: '200ms' }}>
            Order #{orderNumber}
          </p>
        )}
        {isFreeDelivery && (
          <div
            className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-900 animate-fadeInUp"
            style={{ animationDelay: '250ms' }}
          >
            <p className="text-sm font-semibold">Free delivery unlocked</p>
            <p className="text-xs text-emerald-700">You unlocked free delivery on this order.</p>
          </div>
        )}
        {!isFreeDelivery && remaining !== null && remaining > 0 && (
          <div
            className="mb-6 rounded-2xl border border-gold/40 bg-gold/10 px-5 py-4 text-forest animate-fadeInUp"
            style={{ animationDelay: '250ms' }}
          >
            <p className="text-sm font-semibold">Almost there for free delivery</p>
            <p className="text-xs text-clay">
              You were ₹{remaining} away from free delivery. Next time, add one more ritual to reach ₹{FREE_DELIVERY_THRESHOLD}.
            </p>
          </div>
        )}
        <p className="mb-8 text-clay animate-fadeInUp" style={{ animationDelay: '300ms' }}>
          Thank you for choosing Svayam Natural. You will receive a confirmation email shortly with your order details and tracking information.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center animate-fadeInUp" style={{ animationDelay: '400ms' }}>
          <Link
            href="/products"
            className="rounded-full bg-gold px-8 py-3 font-semibold text-forest transition-colors hover:bg-gold-dark"
          >
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="rounded-full border border-forest px-8 py-3 font-semibold text-forest transition-colors hover:bg-forest hover:text-sand"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[70vh] items-center justify-center pt-28">Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
