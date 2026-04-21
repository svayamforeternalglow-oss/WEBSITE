"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import AnimateOnScroll from "./AnimateOnScroll";
import { api } from "@/lib/api";
import { normalizeConcernQuery } from "@/lib/products";

const STATIC_CONCERNS = [
  { name: "Pigmentation", slug: "pigmentation", image: "/images/concern-pigmentation.png" },
  { name: "Antiageing", slug: "anti-ageing", image: "/images/concern-anti-ageing.png" },
  { name: "Dry Skin", slug: "dry-skin", image: "/images/concerns/skin-hydration.png" },
  { name: "Hairfall", slug: "hair-fall", image: "/images/concern-hair-fall.png" },
  { name: "Dull Damaged Hair", slug: "dull-damaged-hair", image: "/images/concerns/dandruff.png" },
  { name: "Night Care", slug: "night-care", image: "/images/chandraprabha-night-necter.png" },
  { name: "Day Care", slug: "day-care", image: "/images/suryakanti-day-creme.png" },
  { name: "Glow and Radiance", slug: "glow-radiance", image: "/images/concerns/skin-brightening.png" },
];

interface ConcernItem {
  name: string;
  slug: string;
  image: string;
  _id?: string;
  isActive?: boolean;
}

export default function ShopByConcern() {
  const [concerns, setConcerns] = useState<ConcernItem[]>(STATIC_CONCERNS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.get<ConcernItem[]>('/taxonomy/concerns?active=true');
        const fetched = Array.isArray(data) ? data.filter(c => c.isActive !== false) : [];
        if (!cancelled && fetched.length > 0) {
          const allowedSlugs = new Set(STATIC_CONCERNS.map((c) => c.slug));
          const imageMap = new Map(STATIC_CONCERNS.map((c) => [c.slug, c.image]));
          const mapped = fetched
            .map((concern) => {
              const normalizedSlug = normalizeConcernQuery(concern.slug) || concern.slug;
              return {
                ...concern,
                slug: normalizedSlug,
                image: concern.image || imageMap.get(normalizedSlug) || '/images/All-Products.jpeg',
              };
            })
            .filter((concern) => allowedSlugs.has(concern.slug));

          const bySlug = new Map(mapped.map((concern) => [concern.slug, concern]));
          const merged = STATIC_CONCERNS.map((concern) => {
            const apiConcern = bySlug.get(concern.slug);
            if (!apiConcern) {
              return concern;
            }

            return {
              ...concern,
              ...apiConcern,
              slug: concern.slug,
              image: apiConcern.image || concern.image,
              name: concern.name,
            };
          });

          setConcerns(merged);
        }
      } catch {
        // Keep static fallback
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="bg-[#f5f2eb] py-16 sm:py-20 lg:py-24" id="concerns">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <AnimateOnScroll animation="fadeInUp">
          <div className="mb-12">
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-[44px] font-bold text-forest mb-4 tracking-tight">
              Special Care for Special Needs
            </h2>
            <h3 className="font-sans text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#b39568]">
              SHOP BY CONCERN
            </h3>
          </div>
        </AnimateOnScroll>
        
        <div className="relative mt-8">
          {/* Mobile: Scrollable row | Desktop: Responsive grid */}
          <div className="flex lg:grid lg:grid-cols-4 xl:grid-cols-8 overflow-x-auto lg:overflow-visible pb-6 pt-2 hide-scrollbar gap-4 sm:gap-6 lg:gap-4 lg:justify-items-center">
            {concerns.map((concern, i) => (
              <AnimateOnScroll key={concern.slug} animation="fadeInUp" delay={i * 50}>
                <Link
                  href={`/products?concern=${normalizeConcernQuery(concern.slug) || concern.slug}`}
                  className="group flex flex-col items-center gap-4 transition-all duration-300 flex-shrink-0 lg:flex-shrink"
                >
                  <div className="relative h-[110px] w-[110px] sm:h-[130px] sm:w-[130px] lg:h-[120px] lg:w-[120px] xl:h-[145px] xl:w-[145px] rounded-[32px] overflow-hidden bg-white shadow-[0_4px_15px_rgb(0,0,0,0.05)] transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_12px_30px_rgb(0,0,0,0.12)]">
                    <Image
                      src={concern.image || '/images/All-Products.jpeg'}
                      alt={concern.name}
                      fill
                      sizes="(max-width: 768px) 110px, 145px"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                  </div>
                  <h3 className="text-center font-heading text-[13px] sm:text-[14px] lg:text-[15px] font-medium text-forest transition-colors duration-300 group-hover:text-[#b39568] px-1 max-w-[140px] leading-tight">
                    {concern.name}
                  </h3>
                </Link>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </div>
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
