"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLongRightIcon } from "./icons";

const slides = [
  {
    image: "/images/suryakanti-day-creme.png",
    subtitle: "Awaken Your Radiance",
    title: "Suryakanti Day Cream",
    description: "Nourish, protect, and illuminate your skin with the power of ancient botanicals and Kashmiri saffron.",
    cta: { label: "Shop Now", href: "/products/suryakanti-day-cream" },
  },
  {
    image: "/images/chandraprabha-night-necter.png",
    subtitle: "Celestial Overnight Repair",
    title: "Chandraprabha Night Nectar",
    description: "Restore, illuminate and rejuvenate your skin while you sleep with our sacred Kumkumadi elixir.",
    cta: { label: "Discover the Magic", href: "/products/chandraprabha-night-nectar" },
  },
  {
    image: "/images/kesh-samraksha/1.jpeg",
    subtitle: "The Secret to Luscious Locks",
    title: "Kesh Samraksha",
    description: "Nourishing hair pack enriched with 5 potent Ayurvedic herbs to promote hair growth and salon-worthy shine.",
    cta: { label: "Transform Your Hair", href: "/products/kesh-samraksha" },
  },
  {
    image: "/images/lifestyle-pamper.png",
    subtitle: "Your Complete Rituals",
    title: "Best Selling Kits",
    description: "Experience the ultimate self-care routines perfectly curated to bring balance and glow to your life.",
    cta: { label: "Explore Kits", href: "/products?category=kits" },
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);

  const next = useCallback(() => {
    setProgress(0);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    const duration = 7000;
    const interval = 50;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          next();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [next]);

  const goTo = (i: number) => {
    setProgress(0);
    setCurrent(i);
  };

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-forest-dark">
      {/* Background Images with overlay */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            sizes="100vw"
            className={`object-cover ${i === current ? "animate-kenBurns" : ""}`}
            priority={i === 0}
            loading={i === 0 ? "eager" : "lazy"}
          />
          {/* Multi-layer gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-forest-dark/95 via-forest-dark/80 to-forest-dark/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/60 via-transparent to-forest-dark/30" />
        </div>
      ))}

      {/* Decorative gold glow orbs */}
      <div className="pointer-events-none absolute left-1/4 top-1/3 -z-0 h-[500px] w-[500px] rounded-full bg-gold/[0.03] blur-[120px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 -z-0 h-[400px] w-[400px] rounded-full bg-gold/[0.04] blur-[100px]" />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 pt-32 pb-24 text-center md:text-left lg:px-10">
        <div className="mx-auto max-w-2xl md:mx-0">
          {slides.map((slide, i) => (
            <div
              key={i}
              className={`transition-all duration-1000 ease-out ${
                i === current
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none absolute inset-0 translate-y-10 opacity-0"
              }`}
            >
              {/* Subtitle pill */}
              <div className="mb-6 inline-flex items-center justify-center gap-2 rounded-full border border-gold/30 bg-gold/[0.08] px-4 py-1.5 backdrop-blur-sm md:justify-start">
                <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-gold-light">
                  {slide.subtitle}
                </span>
              </div>

              <h1 className="hero-title mb-6 sm:mb-8 font-heading text-4xl sm:text-5xl font-bold leading-[1.1] md:text-6xl lg:text-7xl">
                <span className="text-sand">{slide.title}</span>
              </h1>

              {/* Description */}
              <p className="mx-auto mb-10 sm:mb-12 max-w-md text-sm sm:text-base leading-relaxed text-sand/60 md:mx-0 md:text-lg">
                {slide.description}
              </p>

              {/* CTA */}
              <Link
                href={slide.cta.href}
                className="group inline-flex items-center justify-center gap-4 rounded-full bg-gold px-8 py-4 text-sm font-semibold uppercase tracking-wider text-forest transition-all duration-300 hover:bg-gold-light hover:shadow-[0_0_40px_rgba(194,162,93,0.3)] md:justify-start"
              >
                {slide.cta.label}
                <ArrowLongRightIcon className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Slide indicators with progress bar — centered on mobile */}
      <div className="absolute inset-x-0 bottom-8 sm:bottom-12 z-10 mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-4 sm:px-6 md:flex-row md:justify-between lg:px-10">
        <div className="flex items-center justify-center gap-4 sm:gap-6">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === current ? "true" : undefined}
              className="group flex items-center gap-3"
            >
              <span className="text-xs font-medium tabular-nums text-sand/40 transition-colors group-hover:text-gold">
                0{i + 1}
              </span>
              <div className="relative h-[2px] w-10 overflow-hidden rounded-full bg-sand/15">
                {i === current && (
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-gold transition-none"
                    style={{ width: `${progress}%` }}
                  />
                )}
                {i < current && (
                  <div className="absolute inset-0 rounded-full bg-gold/40" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Scroll hint */}
        <div className="hidden items-center gap-4 lg:flex">
          <div className="h-16 w-[1px] bg-gradient-to-b from-transparent via-gold/40 to-gold/10" />
          <span className="origin-center -rotate-90 text-[10px] font-medium uppercase tracking-[0.3em] text-sand/30">
            Scroll
          </span>
        </div>
      </div>
    </section>
  );
}
