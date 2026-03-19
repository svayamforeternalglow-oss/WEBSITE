import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/products";
import AddToCartButton from "./AddToCartButton";
import WishlistButton from "./WishlistButton";

interface ChandraprabhaPageProps {
  product: Product;
}

export default function ChandraprabhaPage({ product }: ChandraprabhaPageProps) {
  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  const particles = [
    { left: "10%", width: 3, height: 3, delay: "0s", duration: "10s" },
    { left: "25%", width: 4, height: 4, delay: "2s", duration: "14s" },
    { left: "40%", width: 2, height: 2, delay: "4s", duration: "11s" },
    { left: "55%", width: 5, height: 5, delay: "1s", duration: "13s" },
    { left: "70%", width: 3, height: 3, delay: "3s", duration: "9s" },
    { left: "85%", width: 4, height: 4, delay: "5s", duration: "12s" },
    { left: "15%", width: 2, height: 2, delay: "6s", duration: "15s" },
    { left: "60%", width: 3, height: 3, delay: "7s", duration: "10s" },
  ];

  const stars = [
    { cx: 50, cy: 40, r: 2, delay: "0s" },
    { cx: 180, cy: 20, r: 1.5, delay: "0.5s" },
    { cx: 120, cy: 120, r: 2.5, delay: "1s" },
    { cx: 30, cy: 140, r: 1.8, delay: "1.5s" },
    { cx: 200, cy: 100, r: 2, delay: "2s" },
    { cx: 160, cy: 160, r: 1.2, delay: "0.8s" },
  ];

  const timelineSteps = [
    {
      title: "Apply",
      description:
        "As evening descends, gently massage Chandraprabha Night Nectar onto cleansed skin. Let the lunar botanicals begin their sacred work.",
      icon: (
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="#B0C4DE" strokeWidth={1.5}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ),
    },
    {
      title: "Sleep",
      description:
        "Through the quiet hours of the night, the moonlit formula works in harmony with your skin's natural repair cycle — renewing, restoring, replenishing.",
      icon: (
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="#B0C4DE" stroke="none">
          <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
        </svg>
      ),
    },
    {
      title: "Awaken",
      description:
        "Greet the morning with skin that glows like moonlight on still water — soft, luminous, and deeply nourished from within.",
      icon: (
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="#B0C4DE" strokeWidth={1.5}>
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          <circle cx="12" cy="12" r="5" fill="#B0C4DE" fillOpacity={0.2} />
        </svg>
      ),
    },
  ];

  return (
    <article className="theme-moon">
      {/* ───────────────────── Hero Section ───────────────────── */}
      <section className="relative min-h-screen overflow-hidden bg-[#0B1026] pt-28 pb-20 lg:pt-32">
        {/* Floating particles */}
        {particles.map((p, i) => (
          <div
            key={i}
            className="animate-floatUp absolute bottom-0 rounded-full bg-white/40"
            style={{
              left: p.left,
              width: p.width,
              height: p.height,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:px-10">
          {/* Product Image */}
          <div className="relative mx-auto w-full max-w-md lg:order-2">
            {/* Silver glow halo */}
            <div className="animate-silverPulse absolute inset-0 -z-10 m-auto h-72 w-72 rounded-full bg-[#B0C4DE]/10 blur-3xl" />
            <Image
              src={product.image}
              alt={product.name}
              width={600}
              height={600}
              priority
              className="animate-silverPulse relative z-10 mx-auto drop-shadow-2xl"
            />
          </div>

          {/* Product Info */}
          <div className="lg:order-1">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#B0C4DE]/60">
              {product.category.replace(/-/g, " ")}
            </p>
            <h1 className="mb-4 font-heading text-4xl font-bold text-white/90 md:text-5xl lg:text-6xl">
              Chandraprabha Night Nectar
            </h1>
            <p className="mb-6 font-accent text-xl italic text-[#B0C4DE]/70">
              {product.tagline}
            </p>
            <p className="mb-8 max-w-lg leading-relaxed text-white/70">
              {product.description}
            </p>

            {/* Badges */}
            <div className="mb-8 flex flex-wrap gap-3">
              {product.badges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-[#B0C4DE]/20 bg-[#B0C4DE]/5 px-4 py-1.5 text-xs font-semibold text-[#B0C4DE]"
                >
                  {badge}
                </span>
              ))}
            </div>

            {/* Pricing */}
            <div className="mb-8 flex items-baseline gap-4">
              <span className="font-heading text-4xl font-bold text-white">
                ₹{product.price}
              </span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-xl text-white/50 line-through">
                    ₹{product.originalPrice}
                  </span>
                  <span className="rounded-full bg-[#B0C4DE]/20 px-3 py-1 text-xs font-bold text-[#B0C4DE]">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            {/* SKU & Weight */}
            <div className="mb-8 flex gap-6 text-sm text-white/50">
              <span>
                <span className="font-medium text-white/70">SKU:</span>{" "}
                {product.sku}
              </span>
              <span>
                <span className="font-medium text-white/70">Weight:</span>{" "}
                {product.weight}
              </span>
            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-4">
              <AddToCartButton
                product={product}
                className="from-[#B0C4DE] to-[#8BA4C4] !text-[#0B1026]"
              />
              <WishlistButton product={product} />
            </div>
          </div>
        </div>
      </section>

      {/* ───────── "Crafted Under the Full Moon" Story ───────── */}
      <section className="relative overflow-hidden bg-[#0D1230] py-24">
        {/* Om watermark */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="select-none text-[200px] font-bold leading-none text-white/[0.02]">
            ॐ
          </span>
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <h2 className="mb-16 text-center font-heading text-3xl font-bold text-white/90 md:text-4xl">
            Crafted Under the Full Moon
          </h2>

          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Story text */}
            <div>
              <p className="text-lg leading-relaxed text-white/70">
                {product.story.split(/(full moon|mantra chants|moonlight|lunar|sacred)/gi).map(
                  (segment, i) =>
                    /^(full moon|mantra chants|moonlight|lunar|sacred)$/i.test(segment) ? (
                      <span key={i} className="font-semibold text-[#B0C4DE]">
                        {segment}
                      </span>
                    ) : (
                      <span key={i}>{segment}</span>
                    )
                )}
              </p>
            </div>

            {/* Animated moon with twinkling stars */}
            <div className="relative mx-auto flex h-64 w-64 items-center justify-center lg:h-80 lg:w-80">
              <svg viewBox="0 0 240 240" className="h-full w-full">
                {/* Moon glow */}
                <defs>
                  <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#B0C4DE" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#B0C4DE" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle cx="120" cy="120" r="100" fill="url(#moonGlow)" />
                <circle cx="120" cy="120" r="50" fill="#B0C4DE" fillOpacity="0.9" />

                {/* Stars */}
                {stars.map((star, i) => (
                  <circle
                    key={i}
                    cx={star.cx}
                    cy={star.cy}
                    r={star.r}
                    fill="#B0C4DE"
                    className="animate-twinkle"
                    style={{ animationDelay: star.delay }}
                  />
                ))}
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── Ingredients Section ───────────────── */}
      <section className="bg-[#0B1026] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-16 text-center">
            <h2 className="font-heading text-3xl font-bold text-white/90 md:text-4xl">
              Sacred Ingredients
            </h2>
            <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-[#B0C4DE]/60 to-transparent" />
            <p className="mx-auto mt-5 max-w-xl font-accent text-lg italic text-white/60">
              Rare botanicals chosen for their nighttime potency.
            </p>
          </div>

          <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
            {product.ingredients.map((ing) => (
              <div
                key={ing.name}
                className="group rounded-2xl border border-white/10 bg-white/[0.05] p-8 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#B0C4DE]/30 hover:bg-white/[0.08]"
              >
                <h3 className="mb-3 font-heading text-lg font-semibold text-white">
                  {ing.name}
                </h3>
                <p className="text-sm leading-relaxed text-white/60">
                  {ing.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──── Benefits — Overnight Transformation Timeline ──── */}
      <section className="bg-[#0D1230] py-24">
        <div className="mx-auto max-w-4xl px-6 lg:px-10">
          <div className="mb-16 text-center">
            <h2 className="font-heading text-3xl font-bold text-white/90 md:text-4xl">
              Overnight Transformation
            </h2>
            <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-[#B0C4DE]/60 to-transparent" />
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical dotted line */}
            <div className="absolute left-1/2 top-0 hidden h-full -translate-x-1/2 border-l-2 border-dashed border-[#B0C4DE]/30 lg:block" />
            <div className="absolute left-6 top-0 h-full border-l-2 border-dashed border-[#B0C4DE]/30 lg:hidden" />

            <div className="space-y-16">
              {timelineSteps.map((step, i) => {
                const isEven = i % 2 === 0;
                return (
                  <div key={step.title} className="relative">
                    {/* Desktop layout — alternating left/right */}
                    <div className="hidden lg:grid lg:grid-cols-2 lg:gap-12">
                      <div className={isEven ? "pr-12 text-right" : "order-2 pl-12"}>
                        <div className={`flex items-start gap-4 ${isEven ? "flex-row-reverse" : ""}`}>
                          <div className="flex-shrink-0 rounded-full border border-[#B0C4DE]/30 bg-[#0B1026] p-3">
                            {step.icon}
                          </div>
                          <div>
                            <h3 className="mb-2 font-heading text-xl font-semibold text-[#B0C4DE]">
                              {step.title}
                            </h3>
                            <p className="text-sm leading-relaxed text-white/60">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className={isEven ? "order-2" : ""} />
                    </div>

                    {/* Dot on the center line (desktop) */}
                    <div className="absolute left-1/2 top-4 hidden h-3 w-3 -translate-x-1/2 rounded-full bg-[#B0C4DE] shadow-[0_0_8px_rgba(176,196,222,0.5)] lg:block" />

                    {/* Mobile layout */}
                    <div className="flex gap-6 pl-14 lg:hidden">
                      {/* Dot on the left line */}
                      <div className="absolute left-[18px] top-4 h-3 w-3 rounded-full bg-[#B0C4DE] shadow-[0_0_8px_rgba(176,196,222,0.5)]" />
                      <div>
                        <div className="mb-2 flex items-center gap-3">
                          <div className="flex-shrink-0 rounded-full border border-[#B0C4DE]/30 bg-[#0B1026] p-2">
                            {step.icon}
                          </div>
                          <h3 className="font-heading text-xl font-semibold text-[#B0C4DE]">
                            {step.title}
                          </h3>
                        </div>
                        <p className="text-sm leading-relaxed text-white/60">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────── How to Use ──────────────────── */}
      {product.howToUse && (
        <section className="bg-[#0B1026] py-20">
          <div className="mx-auto max-w-3xl px-6 text-center lg:px-10">
            <h2 className="mb-8 font-heading text-3xl font-bold text-white/90 md:text-4xl">
              How to Use
            </h2>
            <div className="mx-auto mb-8 h-[2px] w-16 bg-gradient-to-r from-[#B0C4DE]/60 to-transparent" />
            <p className="font-accent text-lg leading-relaxed italic text-[#B0C4DE]/70">
              {product.howToUse}
            </p>
          </div>
        </section>
      )}

      {/* ──────────────────── Bottom CTA ──────────────────── */}
      <section className="relative overflow-hidden bg-[#0D1230] py-20">
        {/* Silver glow orbs */}
        <div className="absolute -left-20 top-1/2 h-60 w-60 -translate-y-1/2 rounded-full bg-[#B0C4DE]/5 blur-3xl" />
        <div className="absolute -right-20 top-1/4 h-48 w-48 rounded-full bg-[#B0C4DE]/5 blur-3xl" />

        <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-10">
          <h2 className="mb-6 font-heading text-3xl font-bold text-white/90 md:text-4xl">
            Experience Chandraprabha Night Nectar
          </h2>
          <p className="mb-8 text-white/60">
            Surrender to the moonlight ritual. Let your skin drink in the nectar
            of the night.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <AddToCartButton
              product={product}
              variant="cta"
              className="from-[#B0C4DE] to-[#8BA4C4] !text-[#0B1026] shadow-[#B0C4DE]/20"
            />
            <Link
              href="/products"
              className="rounded-lg border-2 border-[#B0C4DE]/20 px-8 py-4 text-sm font-bold uppercase tracking-wider text-[#B0C4DE] transition-all hover:border-[#B0C4DE]/50 hover:text-white"
            >
              Continue Browsing
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
