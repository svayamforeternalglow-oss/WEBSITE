'use client';

import { useEffect, useState } from 'react';

const BANNER_STORAGE_KEY = 'svayam-welcome-banner-dismissed';

export default function TopBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(BANNER_STORAGE_KEY);
      setVisible(!dismissed);
    } catch {
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem(BANNER_STORAGE_KEY, '1');
    } catch {
      // Ignore storage errors
    }
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="bg-forest px-4 py-2 text-center text-[11px] sm:text-xs font-semibold tracking-wider text-sand">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-3">
        <span>Welcome to Svayam Natural - Free Shipping above ₹1500</span>
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-full border border-sand/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-sand/90 transition hover:border-sand hover:text-sand"
          aria-label="Dismiss welcome banner"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
