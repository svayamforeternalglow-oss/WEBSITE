'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/auth';
import { useCartStore } from '@/lib/cart';
import { api } from '@/lib/api';

const SYNC_DEBOUNCE_MS = 600;

export default function CartSync() {
  const { isAuthenticated, token } = useAuthStore();
  const items = useCartStore((s) => s.items);
  const timerRef = useRef<number | null>(null);
  const lastPayloadRef = useRef<string>('');

  useEffect(() => {
    if (!isAuthenticated || !token) {
      lastPayloadRef.current = '';
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    const payload = {
      items: items.map((item) => ({
        productId: item.productId,
        slug: item.slug,
        name: item.name,
        price: item.price,
        originalPrice: item.originalPrice,
        image: item.image,
        weight: item.weight,
        sku: item.sku,
        quantity: item.quantity,
      })),
    };

    const serialized = JSON.stringify(payload);
    if (serialized === lastPayloadRef.current) {
      return;
    }

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      api.post('/users/cart', payload, token).catch(() => undefined);
      lastPayloadRef.current = serialized;
    }, SYNC_DEBOUNCE_MS);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [items, isAuthenticated, token]);

  return null;
}
