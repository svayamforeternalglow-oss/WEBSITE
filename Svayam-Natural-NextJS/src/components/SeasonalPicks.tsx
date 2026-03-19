"use client";

import { useMemo } from "react";
import { getProductBySlug } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import SectionHeader from "@/components/SectionHeader";

const SEASON_CONFIG = {
  summer: {
    months: [2, 3, 4, 5] as number[],
    slugs: ["suryakanti-day-cream", "gulkand", "triphala-detox", "rose-lip-balm"],
    label: "Summer Essentials",
  },
  monsoon: {
    months: [6, 7, 8] as number[],
    slugs: ["kesh-samraksha", "lavanyam-facepack", "glowup-night-gel"],
    label: "Monsoon Care",
  },
  winter: {
    months: [9, 10, 11, 0, 1] as number[],
    slugs: ["chandraprabha-night-nectar", "abhyanga-udvartana", "tejasamrit", "rose-lip-balm"],
    label: "Winter Rituals",
  },
};

export default function SeasonalPicks() {
  const { seasonProducts, seasonLabel } = useMemo(() => {
    const month = new Date().getMonth();
    const season =
      SEASON_CONFIG.summer.months.includes(month)
        ? "summer"
        : SEASON_CONFIG.monsoon.months.includes(month)
          ? "monsoon"
          : "winter";
    const config = SEASON_CONFIG[season];
    const seasonProducts = config.slugs
      .map((slug) => getProductBySlug(slug))
      .filter((p): p is NonNullable<typeof p> => p != null);
    return { seasonProducts, seasonLabel: config.label };
  }, []);

  return (
    <section className="relative overflow-hidden bg-neutral-100 py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeader
          title="Seasonal Must-Haves"
          subtitle="Refresh your routines with seasonal essentials"
          subtitleClassName="text-lg md:text-xl"
        />
        <div className="mb-6 flex justify-center">
          <span className="inline-flex items-center rounded-full bg-neutral-200/80 px-4 py-1.5 text-sm font-medium text-neutral-700">
            {seasonLabel}
          </span>
        </div>
      </div>

      {/* Scrollable row extends to viewport edge with fade gradients */}
      <div className="relative">
        {/* Left fade */}
        <div
          className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-neutral-100 to-transparent"
          aria-hidden
        />
        {/* Right fade */}
        <div
          className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-neutral-100 to-transparent"
          aria-hidden
        />

        <div
          className="flex gap-6 overflow-x-auto px-6 pb-4 pt-2 snap-x snap-mandatory lg:px-10 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {seasonProducts.map((product) => (
            <div
              key={product.slug}
              className="min-w-[280px] max-w-[300px] flex-shrink-0 snap-start"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
