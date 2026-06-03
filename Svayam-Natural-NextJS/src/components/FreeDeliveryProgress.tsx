import {
  FREE_DELIVERY_THRESHOLD,
  getFreeDeliveryProgress,
  getFreeDeliveryRemaining,
} from '@/lib/shipping';

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

  return (
    <div className={`rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-3 ${className}`}>
      <div className="flex items-center justify-between text-xs font-semibold text-forest">
        <span>{isUnlocked ? 'Free delivery unlocked' : 'Unlock free delivery'}</span>
        <span>{progressPercent}%</span>
      </div>
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
