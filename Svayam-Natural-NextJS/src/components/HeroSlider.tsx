"use client";

import { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLongRightIcon } from "./icons";

const slides = [
  {
    backgroundImage: "/images/Complete-Radiance-Kit.jpeg",
    backgroundPosition: "center center",
    overlay:
      "linear-gradient(90deg, rgba(7,22,15,0.84) 0%, rgba(7,22,15,0.58) 36%, rgba(7,22,15,0.14) 58%, rgba(7,22,15,0.03) 100%)",
    subtitle: "Best Selling Kit",
    title: "The Complete Radiance Kit",
    description: "A complete skincare ritual curated for clear, luminous, and naturally radiant skin.",
    cta: { label: "Shop Kit", href: "/products/complete-radiance-kit" },
  },
  {
    backgroundImage: "/images/Eat-To-Glow-Kit.jpeg",
    backgroundPosition: "center center",
    overlay:
      "linear-gradient(90deg, rgba(34,21,6,0.83) 0%, rgba(34,21,6,0.54) 36%, rgba(34,21,6,0.12) 58%, rgba(34,21,6,0.03) 100%)",
    subtitle: "Nourish From Within",
    title: "Eat To Glow Kit",
    description: "An inner wellness bundle that supports glow, digestion, and daily nourishment.",
    cta: { label: "Shop Category", href: "/products?category=food" },
  },
  {
    backgroundImage: "/images/Royal-Bathing-Kit.jpeg",
    backgroundPosition: "center center",
    overlay:
      "linear-gradient(90deg, rgba(20,14,7,0.84) 0%, rgba(20,14,7,0.56) 36%, rgba(20,14,7,0.14) 58%, rgba(20,14,7,0.03) 100%)",
    subtitle: "Luxury Bath Ritual",
    title: "Royal Bathing Kit",
    description: "Premium bathing essentials for a rich, aromatic, and deeply restorative body care experience.",
    cta: { label: "Shop Ritual", href: "/products/royal-bathing-kit" },
  },
  {
    backgroundImage: "/images/autea/AUTEA_HERO.png",
    backgroundPosition: "center center",
    overlay:
      "linear-gradient(90deg, rgba(7,22,15,0.82) 0%, rgba(7,22,15,0.52) 36%, rgba(7,22,15,0.12) 58%, rgba(7,22,15,0.02) 100%)",
    subtitle: "Ayurvedic Wellness",
    title: "Autea",
    description: "A soothing tea ritual crafted to support calm, balance, and everyday vitality.",
    cta: { label: "Discover Autea", href: "/products/autea" },
  },
];

const AUTO_PLAY_MS = 7000;
const PROGRESS_TICK_MS = 50;

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [heroViewportHeight, setHeroViewportHeight] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const next = useCallback(() => {
    setProgress(0);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    const step = (PROGRESS_TICK_MS / AUTO_PLAY_MS) * 100;

    const timer = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          next();
          return 0;
        }
        return prev + step;
      });
    }, PROGRESS_TICK_MS);

    return () => window.clearInterval(timer);
  }, [next]);

  useLayoutEffect(() => {
    const updateHeroViewportHeight = () => {
      if (!sectionRef.current) return;

      const topOffset = sectionRef.current.getBoundingClientRect().top;
      const viewportHeight = Math.round(window.visualViewport?.height ?? window.innerHeight);
      const remainingViewport = Math.round(viewportHeight - topOffset);

      // Exact fit: hero ends exactly at the bottom edge of the current viewport.
      setHeroViewportHeight(Math.max(0, remainingViewport));
    };

    updateHeroViewportHeight();
    window.addEventListener("resize", updateHeroViewportHeight);
    window.visualViewport?.addEventListener("resize", updateHeroViewportHeight);

    return () => {
      window.removeEventListener("resize", updateHeroViewportHeight);
      window.visualViewport?.removeEventListener("resize", updateHeroViewportHeight);
    };
  }, []);

  const goTo = (i: number) => {
    setProgress(0);
    setCurrent(i);
  };

  const activeSlide = slides[current];
  const heroHeightStyle = heroViewportHeight ? { height: `${heroViewportHeight}px` } : undefined;

  return (
    <section ref={sectionRef} className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden border-b border-neutral-300/70">
      <div className="relative" style={heroHeightStyle}>
        <Image
          src={activeSlide.backgroundImage}
          alt={`${activeSlide.title} background`}
          fill
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: activeSlide.backgroundPosition }}
          priority={current === 0}
          loading={current === 0 ? "eager" : "lazy"}
        />

        <div className="absolute inset-0 hidden md:block" style={{ background: activeSlide.overlay }} />
        <div className="absolute inset-0 md:hidden bg-black/12" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/8 md:from-black/35 md:to-black/12" />
        <div className="pointer-events-none absolute -left-20 top-10 h-60 w-60 rounded-full bg-gold/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-12 bottom-0 h-52 w-52 rounded-full bg-sage/30 blur-3xl" />

        <Link
          href={activeSlide.cta.href}
          aria-label={`${activeSlide.title} - ${activeSlide.cta.label}`}
          className="absolute inset-0 z-10 md:hidden"
        >
          <span className="sr-only">{activeSlide.cta.label}</span>
        </Link>

        <div className="relative z-10 mx-auto flex max-w-[1520px] items-center px-4 sm:px-6 lg:px-10" style={heroHeightStyle}>
          <div className="flex w-full items-center">
            <div key={`copy-${activeSlide.title}`} className="hidden max-w-2xl animate-fadeInUp md:block">
              <p className="mb-4 inline-flex rounded-full border border-white/35 bg-black/25 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-sand">
                {activeSlide.subtitle}
              </p>

              <h1 className="max-w-[12ch] font-heading text-4xl font-bold leading-[1.06] text-sand sm:text-5xl md:text-6xl">
                {activeSlide.title}
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-relaxed text-sand/85 sm:text-base md:text-lg">
                {activeSlide.description}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href={activeSlide.cta.href}
                  className="group inline-flex items-center justify-center gap-3 rounded-md bg-gold px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-forest transition-all duration-300 hover:bg-gold-light"
                >
                  {activeSlide.cta.label}
                  <ArrowLongRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-md border border-sand/40 bg-black/20 px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-sand transition-colors duration-300 hover:border-sand/70 hover:bg-black/35"
                >
                  Explore Products
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-4 z-20 sm:bottom-5 lg:bottom-6">
          <div className="mx-auto flex max-w-[1520px] items-center justify-center px-4 sm:px-6 lg:px-10">
            <div className="flex items-center gap-2.5">
              {slides.map((slide, i) => (
                <button
                  key={slide.title}
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === current ? "true" : undefined}
                  className={`relative h-1.5 overflow-hidden rounded-full transition-all duration-300 ${
                    i === current
                      ? "w-12 bg-white/35"
                      : "w-5 bg-white/25 hover:bg-white/45"
                  }`}
                >
                  {i === current && (
                    <span
                      className="absolute inset-y-0 left-0 rounded-full bg-white"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
