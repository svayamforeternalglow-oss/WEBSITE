'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useCartStore } from '@/lib/cart';
import { useAuthStore } from '@/lib/auth';
import { api } from '@/lib/api';

const SYNC_DEBOUNCE_MS = 800;

export default function CartSync() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.getSubtotal());
  const hasHydrated = useCartStore((s) => s.hasHydrated);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);

  const lastSignature = useRef('');

  const signature = useMemo(() => {
    const snapshot = items.map((item) => ({
      productId: item.productId,
      slug: item.slug,
      quantity: item.quantity,
      price: item.price,
    }));
    return JSON.stringify({ snapshot, subtotal });
  }, [items, subtotal]);

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || !token) return;
    if (signature === lastSignature.current) return;

    const timer = setTimeout(() => {
      api
        .post('/cart/abandoned', { items, subtotal, currency: 'INR' }, token)
        .catch(() => {});
      lastSignature.current = signature;
    }, SYNC_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [hasHydrated, isAuthenticated, token, items, subtotal, signature]);

  return null;
}
