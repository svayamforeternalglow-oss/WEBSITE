'use client';

import { X } from 'lucide-react';
import { useToastStore } from '@/lib/toast';

const typeStyles = {
  success: 'bg-forest text-sand border-gold',
  error: 'bg-red-900 text-white border-red-500',
  warning: 'bg-amber-900 text-amber-100 border-amber-500',
  info: 'bg-forest text-sand border-sage',
};

const typeIcons = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

/**
 * Check if this is a free delivery celebration message
 */
const isFreeDeliveryMessage = (message: string): boolean => {
  return message.includes('unlocked free delivery') || message.includes('Save ₹');
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] flex flex-col items-end justify-end p-6">
      <div className="flex flex-col gap-3 max-w-md pointer-events-auto">
        {toasts.map((toast) => {
          // Special rendering for free delivery celebration message
          if (toast.type === 'success' && isFreeDeliveryMessage(toast.message)) {
            return (
              <div
                key={toast.id}
                className="
                  animate-fadeInUp
                  border border-gold/40 bg-gradient-to-r from-forest/5 to-gold/10
                  rounded-2xl px-6 py-4
                  shadow-lg backdrop-blur-sm
                  flex items-center justify-between gap-4
                  md:bottom-8 md:right-8
                "
              >
                <p className="text-sm md:text-base font-medium text-forest flex-1">
                  {toast.message}
                </p>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="
                    flex-shrink-0 p-2 text-forest hover:text-forest-dark
                    hover:bg-gold/10 rounded-lg transition-colors duration-200
                    focus:outline-none focus:ring-2 focus:ring-gold/50
                  "
                  aria-label="Dismiss notification"
                >
                  <X size={20} />
                </button>
              </div>
            );
          }

          // Standard toast rendering for other messages
          return (
            <div
              key={toast.id}
              className={`flex items-center gap-3 rounded-xl border px-5 py-3.5 shadow-xl animate-fadeInUp ${typeStyles[toast.type]}`}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-bold">
                {typeIcons[toast.type]}
              </span>
              <p className="font-body text-sm font-medium">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-3 shrink-0 text-lg opacity-60 hover:opacity-100"
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
