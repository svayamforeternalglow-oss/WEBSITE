'use client';

import { useEffect, useRef, useState } from 'react';
import {
  FREE_DELIVERY_THRESHOLD,
  SHIPPING_FEE,
  getFreeDeliveryProgress,
  getFreeDeliveryRemaining,
} from '@/lib/shipping';
import { fireConfetti } from '@/lib/confetti';

interface FreeDeliveryProgressProps {
  subtotal: number;
  className?: string;
}

export default function FreeDeliveryProgress({
  subtotal,
  className = '',
}: FreeDeliveryProgressProps) {
  const progress = getFreeDeliveryProgress(subtotal);
  const remaining = Math.ceil(getFreeDeliveryRemaining(subtotal));
  const isUnlocked = remaining <= 0;
  const progressPercent = Math.round(progress * 100);
  const rupee = '\u20B9';
  const [justUnlocked, setJustUnlocked] = useState(false);
  const prevUnlocked = useRef<boolean | null>(null);

  useEffect(() => {
    if (prevUnlocked.current === null) {
      prevUnlocked.current = isUnlocked;
      return;
    }

    if (!prevUnlocked.current && isUnlocked) {
      fireConfetti({ origin: { x: 0.5, y: 0.2 } }).catch(() => {});
      setJustUnlocked(true);
      const timeout = setTimeout(() => setJustUnlocked(false), 2600);
      prevUnlocked.current = isUnlocked;
      return () => clearTimeout(timeout);
    }

    prevUnlocked.current = isUnlocked;
  }, [isUnlocked]);

  return (
    <div className={`rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-3 ${className}`}>
      <div className="flex items-center justify-between text-xs font-semibold text-forest">
        <span>{isUnlocked ? 'Free delivery unlocked' : 'Unlock free delivery'}</span>
        <span>{progressPercent}%</span>
      </div>
      {isUnlocked && (
        <div className={`mt-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 ${justUnlocked ? 'animate-pulseGlow' : ''}`}>
          <span>Saved {rupee}{SHIPPING_FEE} on delivery</span>
        </div>
      )}
      <div className="mt-2 h-2 w-full rounded-full bg-neutral-200">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-gold to-gold-light transition-all"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <p className={`mt-2 text-xs ${isUnlocked ? 'text-emerald-700' : 'text-clay'}`}>
        {isUnlocked
          ? 'Free delivery unlocked on this order.'
          : `Add ${rupee}${remaining} more to unlock free delivery at ${rupee}${FREE_DELIVERY_THRESHOLD}.`}
      </p>
    </div>
  );
}
