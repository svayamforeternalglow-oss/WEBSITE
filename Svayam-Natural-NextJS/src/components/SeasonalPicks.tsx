"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import SectionHeader from "@/components/SectionHeader";
import ProductCarousel from "@/components/ProductCarousel";
import { fetchSeasonalProducts, type MergedProduct } from "@/lib/productApi";

export default function SeasonalPicks() {
  const [products, setProducts] = useState<MergedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await fetchSeasonalProducts(8);
        if (!cancelled) {
          // Filter out unavailable/out-of-stock products
          const available = result.filter(p => p.isActive && (p.inventory > 0 || p.price > 0));
          setProducts(available);
        }
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <section className="relative overflow-hidden bg-neutral-100 py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <SectionHeader
            title="Seasonal Must-Haves"
            subtitle="Handpicked essentials for right now"
            subtitleClassName="text-lg md:text-xl"
          />
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center rounded-full bg-neutral-200/80 px-4 py-1.5 text-sm font-medium text-neutral-700">
              Curated by Svayam
            </span>
          </div>
          <div className="flex gap-6 px-6 pb-4 pt-2 lg:px-10">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="min-w-[240px] sm:min-w-[280px] max-w-[300px] flex-shrink-0 rounded-2xl border border-neutral-300 bg-white p-4 animate-pulse">
                <div className="aspect-square rounded-xl bg-neutral-200 mb-4" />
                <div className="h-3 w-16 rounded bg-neutral-200 mb-2" />
                <div className="h-5 w-3/4 rounded bg-neutral-200" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-neutral-100 py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeader
          title="Seasonal Must-Haves"
          subtitle="Handpicked essentials for right now"
          subtitleClassName="text-lg md:text-xl"
        />
        <div className="mb-6 flex justify-center">
          <span className="inline-flex items-center rounded-full bg-neutral-200/80 px-4 py-1.5 text-sm font-medium text-neutral-700">
            Curated by Svayam
          </span>
        </div>
      </div>

      {/* Premium Product Carousel */}
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <ProductCarousel>
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </ProductCarousel>
      </div>
    </section>
  );
}
