"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import SectionHeader from "./SectionHeader";
import AnimateOnScroll from "./AnimateOnScroll";
import { api } from "@/lib/api";

// Static fallback concerns
const STATIC_CONCERNS = [
  { name: "Acne & Blemishes", slug: "acne-blemishes", image: "/images/concerns/acne-blemishes.png" },
  { name: "Anti-Aging", slug: "anti-aging", image: "/images/concerns/anti-aging.png" },
  { name: "Skin Hydration", slug: "skin-hydration", image: "/images/concerns/skin-hydration.png" },
  { name: "Skin Brightening", slug: "skin-brightening", image: "/images/concerns/skin-brightening.png" },
  { name: "Hair Growth", slug: "hair-growth", image: "/images/concerns/hair-growth.png" },
  { name: "Dandruff", slug: "dandruff", image: "/images/concerns/dandruff.png" },
  { name: "Dark Circles", slug: "dark-circles", image: "/images/concerns/dark-circles.png" },
  { name: "Detox & Wellness", slug: "detox-wellness", image: "/images/concerns/detox-wellness.png" },
];

interface ConcernItem {
  name: string;
  slug: string;
  image: string;
  _id?: string;
}

export default function ShopByConcern() {
  const [concerns, setConcerns] = useState<ConcernItem[]>(STATIC_CONCERNS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.get<ConcernItem[]>('/taxonomy/concerns?active=true');
        const fetched = Array.isArray(data) ? data : [];
        if (!cancelled && fetched.length > 0) {
          setConcerns(fetched);
        }
      } catch {
        // Keep static fallback
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="bg-cream py-16 sm:py-20 lg:py-28" id="concerns">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <AnimateOnScroll animation="fadeInUp">
          <SectionHeader
            title="Shop By Concern"
            subtitle="Find the perfect products for your specific needs"
          />
        </AnimateOnScroll>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-6">
          {concerns.map((concern, i) => (
            <AnimateOnScroll key={concern.slug} animation="fadeInUp" delay={i * 80}>
              <Link
                href={`/products?concern=${concern.slug}`}
                className="group relative flex flex-col items-center overflow-hidden rounded-2xl border border-neutral-300 bg-white p-4 transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/40 hover:shadow-lg sm:p-6"
              >
                <div className="relative mb-4 h-20 w-20 overflow-hidden rounded-full border-2 border-neutral-200 bg-neutral-100 transition-all duration-300 group-hover:border-gold/50 sm:h-24 sm:w-24">
                  <Image
                    src={concern.image || '/images/placeholder.jpg'}
                    alt={concern.name}
                    fill
                    sizes="96px"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <h3 className="text-center font-heading text-sm font-semibold text-forest transition-colors duration-300 group-hover:text-gold-dark sm:text-base">
                  {concern.name}
                </h3>
              </Link>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
