'use client';

let confettiLoader: Promise<typeof import('canvas-confetti')> | null = null;

const loadConfetti = () => {
  if (!confettiLoader) {
    confettiLoader = import('canvas-confetti');
  }
  return confettiLoader;
};

export async function fireConfetti(options?: Parameters<import('canvas-confetti')['default']>[0]) {
  if (typeof window === 'undefined') return;

  const { default: confetti } = await loadConfetti();

  confetti({
    particleCount: 70,
    spread: 70,
    startVelocity: 35,
    gravity: 0.9,
    scalar: 0.9,
    colors: ['#C2A25D', '#D4C08A', '#0F2E1F', '#F3EFE6'],
    ...options,
  });
}
