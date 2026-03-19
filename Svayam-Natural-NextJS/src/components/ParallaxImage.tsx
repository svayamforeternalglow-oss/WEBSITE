"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  speed?: number;
}

export default function ParallaxImage({
  src,
  alt,
  className = "",
  speed = 0.3,
}: ParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const image = imageRef.current;
    if (!container || !image) return;

    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        const viewH = window.innerHeight;

        if (rect.top < viewH && rect.bottom > 0) {
          const progress = (viewH - rect.top) / (viewH + rect.height);
          const offset = (progress - 0.5) * speed * rect.height;
          image.style.transform = `translateY(${offset}px) scale(1.15)`;
        }

        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [speed]);

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <div
        ref={imageRef}
        className="relative h-full w-full transition-transform duration-100 will-change-transform"
        style={{ transform: "translateY(0) scale(1.15)" }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain p-8"
        />
      </div>
    </div>
  );
}
