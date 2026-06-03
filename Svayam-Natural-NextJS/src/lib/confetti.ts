export const fireFreeDeliveryConfetti = async () => {
  if (typeof window === 'undefined') {
    return;
  }

  const { default: confetti } = await import('canvas-confetti');
  const base = {
    particleCount: 80,
    spread: 80,
    startVelocity: 28,
    gravity: 0.9,
    scalar: 0.9,
    origin: { y: 0.2 },
    colors: ['#C2A25D', '#D4C08A', '#0F2E1F', '#EEE8DD'],
  };

  confetti({ ...base, angle: 75, origin: { x: 0.2, y: 0.2 } });
  confetti({ ...base, angle: 105, origin: { x: 0.8, y: 0.2 } });
};
