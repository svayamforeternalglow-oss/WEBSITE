"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import AnimateOnScroll from "./AnimateOnScroll";
import { api } from "@/lib/api";

const STATIC_CONCERNS = [
  { name: "Pigmentation", slug: "pigmentation", image: "/images/pigmnetation.png" },
  { name: "Anti Aging", slug: "anti-aging", image: "/images/aging.png" },
  { name: "Hair Fall", slug: "hair-fall", image: "/images/hairfall.png" },
  { name: "Hair Growth", slug: "hair-growth", image: "/images/concerns/hair-growth.png" },
  { name: "Night Care", slug: "night-care", image: "/images/chandraprabha-night-necter.png" },
  { name: "Oil & Acne Control", slug: "oil-acne-control", image: "/images/concerns/acne-blemishes.png" },
  { name: "Dry Skin", slug: "dry-skin", image: "/images/concerns/skin-hydration.png" },
  { name: "Glow & Radiance", slug: "glow-radiance", image: "/images/tejasamrit.png" },
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
        let fetched = Array.isArray(data) ? data.filter(c => c.isActive !== false) : [];
        if (!cancelled && fetched.length > 0) {
          const orderMap = new Map(STATIC_CONCERNS.map((c, i) => [c.slug, i]));
          fetched = fetched.sort((a, b) => {
            const indexA = orderMap.has(a.slug) ? orderMap.get(a.slug)! : 999;
            const indexB = orderMap.has(b.slug) ? orderMap.get(b.slug)! : 999;
            return indexA - indexB;
          });
          setConcerns(fetched);
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
                  href={`/products?concern=${concern.slug}`}
                  className="group flex flex-col items-center gap-4 transition-all duration-300 flex-shrink-0 lg:flex-shrink"
                >
                  <div className="relative h-[110px] w-[110px] sm:h-[130px] sm:w-[130px] lg:h-[120px] lg:w-[120px] xl:h-[145px] xl:w-[145px] rounded-[32px] overflow-hidden bg-white shadow-[0_4px_15px_rgb(0,0,0,0.05)] transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_12px_30px_rgb(0,0,0,0.12)]">
                    <Image
                      src={concern.image || '/images/placeholder.jpg'}
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
