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
    <div className="fixed left-1/2 top-6 z-[100] flex w-[min(92vw,520px)] -translate-x-1/2 flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 rounded-xl border px-5 py-3.5 shadow-xl animate-toastPop ${typeStyles[toast.type]}`}
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
