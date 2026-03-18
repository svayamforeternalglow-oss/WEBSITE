import Link from "next/link";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import SectionHeader from "@/components/SectionHeader";

const concerns = [
  {
    name: "Pigmentation",
    slug: "pigmentation",
    gradient: "from-orange-200 via-rose-200 to-amber-200",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10">
        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
  {
    name: "Wrinkles and Fine Lines",
    slug: "wrinkles-fine-lines",
    gradient: "from-violet-200 via-purple-200 to-fuchsia-100",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10">
        <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    name: "Dry Skin",
    slug: "dry-skin",
    gradient: "from-sky-200 via-cyan-200 to-teal-200",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      </svg>
    ),
  },
  {
    name: "Digestive Issues, Bloating, Low Energy",
    slug: "digestive-bloating-energy",
    gradient: "from-amber-200 via-yellow-200 to-orange-200",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10">
        <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
        <path d="M5 14l1 3 3 1-1-3-3-1z" /><path d="M19 14l-1 3-3 1 1-3 3-1z" />
      </svg>
    ),
  },
  {
    name: "Tanned Skin",
    slug: "tanned-skin",
    gradient: "from-amber-300 via-orange-200 to-yellow-200",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10">
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
  },
  {
    name: "Hairfall",
    slug: "hairfall",
    gradient: "from-forest/10 via-sage/30 to-gold/10",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10">
        <path d="M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4" />
      </svg>
    ),
  },
  {
    name: "Dandruff",
    slug: "dandruff",
    gradient: "from-slate-200 via-neutral-200 to-stone-200",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10">
        <circle cx="12" cy="8" r="4" />
        <path d="M5 20c0-4 3.5-7 7-7s7 3 7 7" />
      </svg>
    ),
  },
] as const;

export default function ShopByConcern() {
  return (
    <section className="bg-sand py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <AnimateOnScroll>
          <SectionHeader
            title="Shop by Concern"
            subtitle="Find the perfect solution for your specific needs"
          />
        </AnimateOnScroll>

        <AnimateOnScroll delay={100}>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
            {concerns.map((concern) => (
              <Link
                key={concern.slug}
                href={`/products?concern=${concern.slug}`}
                className="group relative flex flex-col items-center rounded-2xl border border-neutral-300 bg-white p-8 transition-all duration-400 hover:-translate-y-1 hover:border-neutral-400 hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)]"
              >
                <div className="relative mb-4 flex h-16 w-16 items-center justify-center">
                  <div
                    className={`absolute inset-0 rounded-full bg-gradient-to-br ${concern.gradient} opacity-30`}
                    aria-hidden
                  />
                  <div className="relative flex h-10 w-10 items-center justify-center text-forest">
                    {concern.icon}
                  </div>
                </div>
                <h3 className="font-heading text-base font-semibold text-forest md:text-lg">
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
