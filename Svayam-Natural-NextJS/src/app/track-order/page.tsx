'use client';

import { Suspense, useState, FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useToastStore } from '@/lib/toast';
import { useAuthStore } from '@/lib/auth';

interface TimelineEntry {
  status: string;
  message: string;
  timestamp: string;
  location?: string;
}

interface TrackingData {
  order: {
    orderId: string;
    status: string;
    tracking?: {
      carrier?: string;
      trackingNumber?: string;
      trackingUrl?: string;
      estimatedDelivery?: string;
      actualDelivery?: string;
    };
    timeline: TimelineEntry[];
    items: { name: string; quantity: number; price: number }[];
    shippingAddress: { firstName: string; lastName: string; city: string; state: string; pincode: string };
  };
}

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const STEP_LABELS: Record<string, string> = {
  pending: 'Order Placed',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
};

const normalizeStatusForStepper = (status: string): string => {
  if (status === 'paid') {
    return 'confirmed';
  }
  return status;
};

function TrackOrderContent() {
  const addToast = useToastStore((s) => s.addToast);
  const { isAuthenticated, token } = useAuthStore();
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(() => searchParams.get('id') || '');
  const [guestEmail, setGuestEmail] = useState(() => searchParams.get('email') || '');
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const resolvedOrderId = orderId.trim();

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!resolvedOrderId) {
      addToast('Please enter an order ID', 'warning');
      return;
    }

    if (!isAuthenticated && !guestEmail.trim()) {
      addToast('Please enter the email used during checkout', 'warning');
      return;
    }

    setLoading(true);
    setTracking(null);
    try {
      const endpoint = isAuthenticated
        ? `/shipping/track/${resolvedOrderId}`
        : `/shipping/track/${resolvedOrderId}?email=${encodeURIComponent(guestEmail.trim())}`;

      const res = await api.get<{ data: TrackingData }>(
        endpoint,
        isAuthenticated ? (token || undefined) : undefined
      );
      setTracking(res.data);
    } catch {
      addToast('Unable to fetch tracking details. Please verify order ID and email.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const currentStep = tracking
    ? STATUS_STEPS.indexOf(normalizeStatusForStepper(tracking.order.status))
    : -1;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <section className="min-h-screen bg-neutral-100 pt-28 pb-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <div className="mb-12 text-center">
          <h1 className="mb-3 font-heading text-3xl font-bold text-forest md:text-4xl">Track Your Order</h1>
          <p className="text-clay">Enter your order number to see the latest status</p>
        </div>

        <form onSubmit={handleSearch} className="mx-auto mb-12 max-w-lg space-y-3">
          <input
            type="text"
            value={resolvedOrderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Enter full order ID"
            className="w-full rounded-lg border border-neutral-300 bg-white px-5 py-3 text-sm outline-none focus:border-gold"
          />

          {!isAuthenticated && (
            <input
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="Email used during checkout"
              className="w-full rounded-lg border border-neutral-300 bg-white px-5 py-3 text-sm outline-none focus:border-gold"
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gold px-6 py-3 font-semibold text-forest transition-colors hover:bg-gold-dark disabled:opacity-60"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {tracking && (
          <div className="animate-fadeInUp">
            {/* Status Timeline */}
            <div className="mb-10 rounded-2xl border border-neutral-300 bg-white p-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-heading text-xl font-bold text-forest">Order #{tracking.order.orderId.slice(-10)}</h2>
                <span className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                  tracking.order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  tracking.order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-gold/15 text-gold-dark'
                }`}>
                  {tracking.order.status.charAt(0).toUpperCase() + tracking.order.status.slice(1)}
                </span>
              </div>

              {/* Progress Steps */}
              {!['cancelled', 'expired', 'returned', 'refunded'].includes(tracking.order.status) && (
                <div className="mb-8">
                  <div className="flex items-center justify-between">
                    {STATUS_STEPS.map((step, i) => (
                      <div key={step} className="flex flex-1 flex-col items-center">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                          i <= currentStep
                            ? 'bg-gold text-forest'
                            : 'bg-neutral-200 text-clay'
                        }`}>
                          {i < currentStep ? '✓' : i + 1}
                        </div>
                        <p className={`mt-2 text-center text-xs font-medium ${
                          i <= currentStep ? 'text-forest' : 'text-clay'
                        }`}>
                          {STEP_LABELS[step]}
                        </p>
                        {i < STATUS_STEPS.length - 1 && (
                          <div className={`absolute mt-5 h-[2px] w-full ${
                            i < currentStep ? 'bg-gold' : 'bg-neutral-300'
                          }`} style={{ display: 'none' }} />
                        )}
                      </div>
                    ))}
                  </div>
                  {/* Progress bar connecting dots */}
                  <div className="relative mt-[-2.25rem] mx-[5%] h-[2px] bg-neutral-300">
                    <div
                      className="h-full bg-gold transition-all duration-500"
                      style={{ width: `${currentStep >= 0 ? (currentStep / (STATUS_STEPS.length - 1)) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Tracking Details */}
              {tracking.order.tracking?.carrier && (
                <div className="mt-6 rounded-xl border border-neutral-300 bg-neutral-100 p-4">
                  <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <span className="font-medium text-clay">Carrier:</span>{' '}
                      <span className="text-forest">{tracking.order.tracking.carrier}</span>
                    </div>
                    {tracking.order.tracking.trackingNumber && (
                      <div>
                        <span className="font-medium text-clay">AWB:</span>{' '}
                        <span className="font-mono text-forest">{tracking.order.tracking.trackingNumber}</span>
                      </div>
                    )}
                    {tracking.order.tracking.estimatedDelivery && (
                      <div>
                        <span className="font-medium text-clay">Est. Delivery:</span>{' '}
                        <span className="text-forest">{formatDate(tracking.order.tracking.estimatedDelivery)}</span>
                      </div>
                    )}
                    {tracking.order.tracking.trackingUrl && (
                      <div>
                        <a href={tracking.order.tracking.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-gold-dark hover:text-gold">
                          Track on carrier website →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Timeline */}
            {tracking.order.timeline.length > 0 && (
              <div className="rounded-2xl border border-neutral-300 bg-white p-8">
                <h3 className="mb-6 font-heading text-lg font-bold text-forest">Order Timeline</h3>
                <div className="space-y-4">
                  {tracking.order.timeline.slice().reverse().map((entry, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`h-3 w-3 rounded-full ${i === 0 ? 'bg-gold' : 'bg-neutral-300'}`} />
                        {i < tracking.order.timeline.length - 1 && <div className="w-[1px] flex-1 bg-neutral-300" />}
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-semibold text-forest">{entry.message}</p>
                        <p className="text-xs text-clay">{formatDate(entry.timestamp)}</p>
                        {entry.location && <p className="text-xs text-clay">{entry.location}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Items */}
            <div className="mt-6 rounded-2xl border border-neutral-300 bg-white p-8">
              <h3 className="mb-4 font-heading text-lg font-bold text-forest">Order Items</h3>
              {tracking.order.items.map((item, i) => (
                <div key={i} className="flex justify-between border-b border-neutral-200 py-3 text-sm last:border-0">
                  <span className="text-forest">{item.name} × {item.quantity}</span>
                  <span className="font-semibold text-forest">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<section className="min-h-screen bg-neutral-100 pt-28 pb-24"><div className="mx-auto max-w-3xl px-6 text-center text-forest">Loading tracking details...</div></section>}>
      <TrackOrderContent />
    </Suspense>
  );
}
