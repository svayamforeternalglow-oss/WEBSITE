"use client";

import { useRef, useState, useCallback } from "react";

export default function BeforeAfterSlider() {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const updatePosition = useCallback(
    (clientX: number) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = clientX - rect.left;
      const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setPosition(percent);
    },
    []
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      isDraggingRef.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingRef.current) return;
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    isDraggingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  const handleContainerPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (isDraggingRef.current) updatePosition(e.clientX);
    },
    [updatePosition]
  );

  return (
    <section className="bg-cream py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="font-heading text-3xl font-bold text-forest md:text-4xl lg:text-5xl">
            Before & After Transformation
          </h2>
          <p className="mt-3 font-accent text-sm uppercase tracking-[0.25em] text-clay-light">
            REAL PEOPLE, REAL RESULTS
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div
            ref={containerRef}
            className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl shadow-lg"
            onPointerMove={handleContainerPointerMove}
            onPointerLeave={() => {
              if (isDraggingRef.current) isDraggingRef.current = false;
            }}
          >
            {/* Before image (left side - full width, clipped) */}
            <div
              className="absolute inset-0"
              style={{
                clipPath: `inset(0 ${100 - position}% 0 0)`,
              }}
            >
              {/* Placeholder: duller skin tone gradient (works without images) */}
              <div
                className="absolute inset-0 bg-gradient-to-br from-stone-400/90 via-amber-200/80 to-stone-300/90"
                aria-hidden
              />
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url(/images/before.jpg)" }}
              />
            </div>

            {/* After image (right side - full width, clipped) */}
            <div
              className="absolute inset-0"
              style={{
                clipPath: `inset(0 0 0 ${position}%)`,
              }}
            >
              {/* Placeholder: glowing radiant gradient (works without images) */}
              <div
                className="absolute inset-0 bg-gradient-to-br from-amber-100 via-rose-50/90 to-amber-50"
                aria-hidden
              />
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url(/images/after.jpg)" }}
              />
            </div>

            {/* Labels */}
            <div className="pointer-events-none absolute left-4 top-4 z-10">
              <span className="rounded-full bg-black/50 px-4 py-1.5 font-accent text-sm font-medium text-white">
                Before
              </span>
            </div>
            <div className="pointer-events-none absolute right-4 top-4 z-10">
              <span className="rounded-full bg-black/50 px-4 py-1.5 font-accent text-sm font-medium text-white">
                After
              </span>
            </div>

            {/* Divider line + handle */}
            <div
              className="absolute top-0 bottom-0 z-20 flex min-w-14 cursor-ew-resize items-center justify-center touch-none"
              style={{ left: `${position}%`, transform: "translateX(-50%)" }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <div className="absolute top-0 h-full w-0.5 bg-gold" />
              <div className="absolute flex h-12 w-12 items-center justify-center gap-0.5 rounded-full border-2 border-gold bg-cream shadow-md">
                <svg
                  className="h-4 w-4 text-gold"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <svg
                  className="h-4 w-4 text-gold"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
