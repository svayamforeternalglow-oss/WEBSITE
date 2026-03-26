import Link from "next/link";
import Image from "next/image";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import SectionHeader from "@/components/SectionHeader";

const concerns = [
  {
    name: "Pigmentation",
    slug: "pigmentation",
    image: "/images/concern-pigmentation.png",
  },
  {
    name: "Anti-ageing",
    slug: "anti-ageing",
    image: "/images/concern-anti-ageing.png",
  },
  {
    name: "Hair Fall",
    slug: "hair-fall",
    image: "/images/concern-hair-fall.png",
  },
  {
    name: "Hair Growth",
    slug: "hair-growth",
    image: "/images/lifestyle-pamper.png",
  },
  {
    name: "Night Care",
    slug: "night-care",
    image: "/images/chandraprabha-night-necter.png",
  },
  {
    name: "Oil & Acne Control",
    slug: "oil-acne-control",
    image: "/images/lavanyam-face-pack.png",
  },
  {
    name: "Dry Skin",
    slug: "dry-skin",
    image: "/images/abhyanga-udvartana-1.jpeg",
  },
  {
    name: "Glow & Radiance",
    slug: "glow-radiance",
    image: "/images/suryakanti-day-creme.png",
  },
] as const;

export default function ShopByConcern() {
  return (
    <section className="bg-sand py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <AnimateOnScroll>
          <div className="mb-10 lg:mb-12">
            <h2 className="font-heading text-3xl font-bold text-forest md:text-3xl lg:text-4xl text-center md:text-left">
              Special Care for Special Needs
            </h2>
            <div className="mt-3 flex items-center justify-center md:justify-start gap-3">
              <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-gold/30 md:bg-gradient-to-r md:from-gold/30 md:to-transparent" />
            </div>
            <p className="mt-3 text-sm uppercase tracking-[0.25em] text-clay-light text-center md:text-left font-semibold">
              Shop by Concern
            </p>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll delay={100}>
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 sm:gap-6">
            {concerns.map((concern) => (
              <Link
                key={concern.slug}
                href={`/products?concern=${concern.slug}`}
                className="group flex flex-col items-center text-center transition-all duration-300"
              >
                <div className="relative mb-3 aspect-square w-full max-w-[120px] overflow-hidden rounded-2xl shadow-sm transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)] bg-neutral-200">
                  <Image
                    src={concern.image}
                    alt={concern.name}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <h3 className="text-xs sm:text-sm font-medium leading-tight text-forest group-hover:text-gold-dark transition-colors duration-300">
                  {concern.name}
                </h3>
              </Link>
            ))}
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
