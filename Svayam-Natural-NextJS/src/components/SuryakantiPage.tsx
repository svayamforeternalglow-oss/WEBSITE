import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/products";
import AddToCartButton from "./AddToCartButton";
import WishlistButton from "./WishlistButton";

interface SuryakantiPageProps {
  product: Product;
}

export default function SuryakantiPage({ product }: SuryakantiPageProps) {
  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <article className="theme-sun">
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF8E7] via-[#FFF0CC] to-[#FFE8B0] pt-28 pb-20 lg:pt-32 lg:pb-28">
        {/* Radial sunburst */}
        <div
          className="animate-sunburstPulse absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: "min(900px, 120vw)",
            height: "min(900px, 120vw)",
            background:
              "radial-gradient(circle, rgba(232,163,23,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Sun rays */}
        {[0, 30, 60, 90, 120, 150].map((deg) => (
          <div
            key={deg}
            className="animate-sunRay pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.04]"
            style={{
              width: "2px",
              height: "min(700px, 100vw)",
              background:
                "linear-gradient(to bottom, transparent, rgba(232,163,23,0.6), transparent)",
              transform: `translate(-50%, -50%) rotate(${deg}deg)`,
              animationDelay: `${deg * 100}ms`,
            }}
          />
        ))}

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:px-10">
          {/* Product image */}
          <div className="relative mx-auto w-full max-w-md lg:order-2">
            <div className="animate-warmGlow relative aspect-square rounded-full">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
            <div
              className="absolute -inset-8 -z-10 rounded-full blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(232,163,23,0.2) 0%, transparent 70%)",
              }}
            />
          </div>

          {/* Product info */}
          <div className="lg:order-1">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#8B6914]">
              {product.category.replace(/-/g, " ")}
            </p>
            <h1 className="mb-4 font-heading text-5xl font-bold text-[#3D2B1F] md:text-7xl lg:text-8xl">
              Suryakanti Day Cream
            </h1>
            <p className="mb-6 font-accent text-xl italic text-[#8B6914]">
              {product.tagline}
            </p>
            <p className="mb-8 max-w-lg leading-relaxed text-[#5C4033]/80">
              {product.description}
            </p>

            {/* Badges */}
            <div className="mb-8 flex flex-wrap gap-3">
              {product.badges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-[#E8A317]/30 bg-[#E8A317]/10 px-4 py-1.5 text-xs font-semibold text-[#8B6914]"
                >
                  {badge}
                </span>
              ))}
            </div>

            {/* Pricing */}
            <div className="mb-8 flex items-baseline gap-4">
              <span className="font-heading text-4xl font-bold text-[#3D2B1F]">
                ₹{product.price}
              </span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-xl text-[#5C4033]/50 line-through">
                    ₹{product.originalPrice}
                  </span>
                  <span className="rounded-full bg-[#E8A317] px-3 py-1 text-xs font-bold text-white">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            {/* SKU & Weight */}
            <div className="mb-8 flex gap-6 text-sm text-[#5C4033]/60">
              <span>
                <span className="font-medium text-[#5C4033]">SKU:</span>{" "}
                {product.sku}
              </span>
              <span>
                <span className="font-medium text-[#5C4033]">Weight:</span>{" "}
                {product.weight}
              </span>
            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-4">
              <AddToCartButton
                product={product}
                className="from-[#E8A317] to-[#D4910E] shadow-[#E8A317]/25 hover:shadow-[#E8A317]/40 !text-white"
              />
              <WishlistButton product={product} />
            </div>
          </div>
        </div>
      </section>

      {/* ─── "Blessed by Soothing Vedic Chants" Story Section ─── */}
      <section className="relative overflow-hidden bg-[#FFF5E0] py-24">
        {/* Decorative Sanskrit verse */}
        <p
          className="pointer-events-none absolute left-1/2 top-8 -translate-x-1/2 whitespace-nowrap font-accent text-2xl italic text-[#E8A317]/[0.07] md:text-4xl"
          aria-hidden="true"
        >
          ॐ आदित्यहृदयं पुण्यं सर्वशत्रुविनाशनम्
        </p>

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2 lg:px-10">
          {/* Left — Story text */}
          <div>
            <h2 className="mb-8 font-heading text-3xl font-bold text-[#3D2B1F] md:text-4xl">
              Blessed by Soothing Vedic Chants
            </h2>
            <div className="space-y-5 text-[#5C4033]/80 leading-relaxed">
              <p>
                {product.story.split("Aditya Hridayam").map((part, i, arr) =>
                  i < arr.length - 1 ? (
                    <span key={i}>
                      {part}
                      <span className="font-semibold text-[#E8A317]">
                        Aditya Hridayam
                      </span>
                    </span>
                  ) : (
                    <span key={i}>
                      {part
                        .split("Surya Sahastranamavali")
                        .map((seg, j, segArr) =>
                          j < segArr.length - 1 ? (
                            <span key={j}>
                              {seg}
                              <span className="font-semibold text-[#E8A317]">
                                Surya Sahastranamavali
                              </span>
                            </span>
                          ) : (
                            <span key={j}>
                              {seg
                                .split("Golden Nalapamaradi Infusion")
                                .map((s, k, sArr) =>
                                  k < sArr.length - 1 ? (
                                    <span key={k}>
                                      {s}
                                      <span className="font-semibold text-[#E8A317]">
                                        Golden Nalapamaradi Infusion
                                      </span>
                                    </span>
                                  ) : (
                                    <span key={k}>{s}</span>
                                  )
                                )}
                            </span>
                          )
                        )}
                    </span>
                  )
                )}
              </p>
            </div>
          </div>

          {/* Right — Decorative sun SVG */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <svg
                viewBox="0 0 200 200"
                className="h-56 w-56 md:h-72 md:w-72"
                aria-hidden="true"
              >
                {/* Outer glow */}
                <defs>
                  <radialGradient id="sunGlow">
                    <stop offset="0%" stopColor="#E8A317" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#E8A317" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle cx="100" cy="100" r="95" fill="url(#sunGlow)" />
                {/* Sun body */}
                <circle cx="100" cy="100" r="40" fill="#E8A317" opacity="0.9" />
                <circle cx="100" cy="100" r="32" fill="#F0C75E" opacity="0.6" />
                {/* Rays */}
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = (i * 30 * Math.PI) / 180;
                  const x1 = 100 + 50 * Math.cos(angle);
                  const y1 = 100 + 50 * Math.sin(angle);
                  const x2 = 100 + 85 * Math.cos(angle);
                  const y2 = 100 + 85 * Math.sin(angle);
                  return (
                    <line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#E8A317"
                      strokeWidth={i % 2 === 0 ? 3 : 1.5}
                      strokeLinecap="round"
                      opacity={i % 2 === 0 ? 0.8 : 0.4}
                    />
                  );
                })}
              </svg>
              {/* Warm glow behind */}
              <div className="animate-warmGlow absolute inset-0 -z-10 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Ingredients Section ─── */}
      <section className="bg-[#FFFBF2] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-16 text-center">
            <h2 className="font-heading text-4xl font-bold text-[#3D2B1F]">
              Key Ingredients
            </h2>
            <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-[#E8A317] to-[#F0C75E]" />
            <p className="mx-auto mt-5 max-w-xl font-accent text-lg italic text-[#5C4033]/70">
              Nature&apos;s most potent sun-kissed botanicals, chosen with
              Ayurvedic wisdom.
            </p>
          </div>

          <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
            {product.ingredients.map((ing) => (
              <div
                key={ing.name}
                className="group rounded-2xl border-l-4 border-[#E8A317] bg-[#FFFDF7] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#E8A317]/10"
              >
                <h3 className="mb-2 font-heading text-lg font-semibold text-[#3D2B1F]">
                  {ing.name}
                </h3>
                <p className="text-sm leading-relaxed text-[#5C4033]/70">
                  {ing.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Benefits Section — Radial Sun Layout ─── */}
      <section className="bg-gradient-to-b from-[#FFF8E7] to-[#FFFBF2] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-16 text-center">
            <h2 className="font-heading text-4xl font-bold text-[#3D2B1F]">
              Radiant Benefits
            </h2>
            <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-[#E8A317] to-[#F0C75E]" />
          </div>

          <div className="relative">
            {/* Central sun icon */}
            <div className="mx-auto mb-12 flex items-center justify-center lg:absolute lg:left-1/2 lg:top-1/2 lg:z-10 lg:mb-0 lg:-translate-x-1/2 lg:-translate-y-1/2">
              <div className="relative">
                <svg
                  viewBox="0 0 120 120"
                  className="h-24 w-24 lg:h-32 lg:w-32"
                  aria-hidden="true"
                >
                  <defs>
                    <radialGradient id="benefitSunGlow">
                      <stop
                        offset="0%"
                        stopColor="#E8A317"
                        stopOpacity="0.25"
                      />
                      <stop
                        offset="100%"
                        stopColor="#E8A317"
                        stopOpacity="0"
                      />
                    </radialGradient>
                  </defs>
                  <circle
                    cx="60"
                    cy="60"
                    r="58"
                    fill="url(#benefitSunGlow)"
                  />
                  <circle cx="60" cy="60" r="22" fill="#E8A317" opacity="0.85" />
                  <circle cx="60" cy="60" r="16" fill="#F0C75E" opacity="0.5" />
                  {Array.from({ length: 8 }).map((_, i) => {
                    const angle = (i * 45 * Math.PI) / 180;
                    const x1 = 60 + 28 * Math.cos(angle);
                    const y1 = 60 + 28 * Math.sin(angle);
                    const x2 = 60 + 50 * Math.cos(angle);
                    const y2 = 60 + 50 * Math.sin(angle);
                    return (
                      <line
                        key={i}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#E8A317"
                        strokeWidth={i % 2 === 0 ? 2.5 : 1}
                        strokeLinecap="round"
                        opacity={i % 2 === 0 ? 0.7 : 0.35}
                      />
                    );
                  })}
                </svg>
                <div className="animate-warmGlow absolute inset-0 -z-10 rounded-full" />
              </div>
            </div>

            {/* Benefits grid */}
            <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
              {product.benefits.map((b) => (
                <div
                  key={b.title}
                  className="group relative rounded-2xl border border-[#E8A317]/15 bg-white/80 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#E8A317]/10"
                >
                  {/* Golden connector line (desktop) */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto hidden h-[2px] w-8 bg-gradient-to-r from-transparent via-[#E8A317]/30 to-transparent lg:block" />
                  <h3 className="mb-2 font-heading text-lg font-semibold text-[#3D2B1F]">
                    {b.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#5C4033]/70">
                    {b.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── How to Use ─── */}
      {product.howToUse && (
        <section className="bg-gradient-to-br from-[#E8A317] to-[#D4910E] py-20">
          <div className="mx-auto max-w-3xl px-6 text-center lg:px-10">
            <h2 className="mb-8 font-heading text-3xl font-bold text-[#3D2B1F] md:text-4xl">
              How to Use
            </h2>
            <div className="mx-auto mb-8 h-[2px] w-16 bg-[#3D2B1F]/20" />
            <p className="font-accent text-lg leading-relaxed italic text-[#3D2B1F]/80">
              {product.howToUse}
            </p>
          </div>
        </section>
      )}

      {/* ─── Bottom CTA ─── */}
      <section className="bg-gradient-to-r from-[#FFF0CC] via-[#FFE8B0] to-[#FFF0CC] py-20">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-10">
          <h2 className="mb-6 font-heading text-3xl font-bold text-[#3D2B1F] md:text-4xl">
            Embrace the Radiance
          </h2>
          <p className="mb-8 text-[#5C4033]/70">
            Join thousands who start each morning with the warmth of Suryakanti
            — your daily ritual of sun-kissed protection and glow.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <AddToCartButton
              product={product}
              variant="cta"
              className="from-[#E8A317] to-[#D4910E] shadow-[#E8A317]/25 hover:shadow-[#E8A317]/40 !text-white"
            />
            <Link
              href="/products"
              className="rounded-lg border-2 border-[#3D2B1F]/20 px-8 py-4 text-sm font-bold uppercase tracking-wider text-[#3D2B1F] transition-all hover:border-[#E8A317] hover:text-[#E8A317]"
            >
              Continue Browsing
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
