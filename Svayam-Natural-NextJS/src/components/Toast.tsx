'use client';

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

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-6 bottom-6 z-[100] flex flex-col gap-3">
      {toasts.map((toast) => (
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
      ))}
    </div>
  );
}
