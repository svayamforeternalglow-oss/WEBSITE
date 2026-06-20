'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/lib/cart';
import { FREE_DELIVERY_THRESHOLD, SHIPPING_FEE } from '@/lib/shipping';
import { useFreeDeliveryReduced } from '@/lib/animations';
import { useToastStore } from '@/lib/toast';
import { fireFreeDeliveryConfetti } from '@/lib/confetti';

/**
 * Hook that monitors cart subtotal and triggers free delivery celebration
 * - Fires confetti animation on page load if free delivery is unlocked
 * - Prevents confetti from firing multiple times in same session
 * - Shows a celebratory toast notification
 * - Respects prefers-reduced-motion accessibility preference
 */
export const useFreeDliveryNotification = () => {
  const subtotal = useCartStore((state) => state.getSubtotal());
  const addToast = useToastStore((state) => state.addToast);
  const prefersReducedMotion = useFreeDeliveryReduced();

  const isFreeDeliveryUnlocked = subtotal >= FREE_DELIVERY_THRESHOLD;
  const SESSION_STORAGE_KEY = '__svayam_free_delivery_celebrated_session__';

  useEffect(() => {
    // Only trigger on mount (page load), not on every subtotal change
    if (!isFreeDeliveryUnlocked) {
      return;
    }

    // Check if we've already celebrated in this session
    const hasAlreadyCelebrated = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (hasAlreadyCelebrated) {
      return;
    }

    // Mark as celebrated for this session
    sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');

    // Fire confetti if user doesn't prefer reduced motion
    if (!prefersReducedMotion) {
      fireFreeDeliveryConfetti().catch((err) => {
        console.error('Failed to fire confetti:', err);
      });
    }

    // Show toast notification with savings amount
    const savingsAmount = SHIPPING_FEE;
    addToast(
      `🎉 Congrats! You've unlocked free delivery — Save ₹${savingsAmount}`,
      'success',
      0 // Don't auto-dismiss; user must close it
    );
  }, []); // Empty dependency array ensures this runs only on mount
};
