import React from 'react';

export default function TopBanner() {
  return (
    <div className="bg-forest px-4 py-2 text-center text-[11px] sm:text-xs font-semibold tracking-wider text-sand">
      <span className="inline-block animate-pulse mr-2">✨</span>
      Free delivery on orders above ₹1500 | ₹100 delivery fee on other orders
      <span className="inline-block animate-pulse ml-2">✨</span>
    </div>
  );
}
