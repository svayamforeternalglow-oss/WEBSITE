'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');

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
