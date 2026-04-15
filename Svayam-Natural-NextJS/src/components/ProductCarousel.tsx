"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

interface ProductCarouselProps {
  children: React.ReactNode[];
  itemsPerView?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

export default function ProductCarousel({ 
  children, 
  itemsPerView = { mobile: 1.2, tablet: 2, desktop: 4 } 
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
      checkScroll();
      return () => {
        el.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [checkScroll]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth : clientWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="group relative">
      {/* Navigation Buttons - Hidden on Mobile, Visible on Hover on Desktop */}
      <button
        onClick={() => scroll("left")}
        disabled={!canScrollLeft}
        className={`absolute -left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-gold/20 bg-white/90 text-forest shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-gold hover:text-white disabled:pointer-events-none disabled:opacity-0 md:group-hover:flex ${
          canScrollLeft ? "md:flex hidden" : "hidden"
        }`}
        aria-label="Previous slide"
      >
        <ChevronLeftIcon className="h-6 w-6" />
      </button>

      <button
        onClick={() => scroll("right")}
        disabled={!canScrollRight}
        className={`absolute -right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-gold/20 bg-white/90 text-forest shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-gold hover:text-white disabled:pointer-events-none disabled:opacity-0 md:group-hover:flex ${
          canScrollRight ? "md:flex hidden" : "hidden"
        }`}
        aria-label="Next slide"
      >
        <ChevronRightIcon className="h-6 w-6" />
      </button>

      {/* Viewport */}
      <div
        ref={scrollRef}
        className="hide-scrollbar flex gap-6 overflow-x-auto scroll-smooth pb-8 pt-4 snap-x snap-mandatory px-2 sm:px-0"
      >
        {children.map((child, i) => (
          <div
            key={i}
            className="carousel-item flex-shrink-0 snap-start"
          >
            {child}
          </div>
        ))}
        <style jsx>{`
          .carousel-item {
            width: calc(100% / ${itemsPerView.mobile} - 16px);
          }
          @media (min-width: 640px) {
            .carousel-item {
              width: calc((100% - ${(itemsPerView.tablet - 1) * 24}px) / ${itemsPerView.tablet}); 
            }
          }
          @media (min-width: 1024px) {
            .carousel-item {
              width: calc((100% - ${(itemsPerView.desktop - 1) * 24}px) / ${itemsPerView.desktop}); 
            }
          }
        `}</style>
      </div>

      {/* Progress Dots/Indicators for Mobile */}
      <div className="mt-2 flex justify-center gap-2 md:hidden">
        {canScrollLeft && <div className="h-1 w-8 rounded-full bg-gold/30" />}
        <div className="h-1 w-12 rounded-full bg-gold" />
        {canScrollRight && <div className="h-1 w-8 rounded-full bg-gold/30" />}
      </div>
    </div>
  );
}
