'use client';

/**
 * Check if the user has enabled reduced motion preference
 * @returns true if prefers-reduced-motion is set to reduce
 */
export const useFreeDeliveryReduced = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
};
