import Link from "next/link";
import HeroSlider from "@/components/HeroSlider";
import HomeSearch from "@/components/HomeSearch";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import ShopByConcern from "@/components/ShopByConcern";
import SeasonalPicks from "@/components/SeasonalPicks";
import SectionHeader from "@/components/SectionHeader";
import ProductCard from "@/components/ProductCard";
import ProductCarousel from "@/components/ProductCarousel";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import {
  LeafIcon,
  FlaskIcon,
  ScrollIcon,
  HeartHandIcon,
  RecycleIcon,
  HandHeartIcon,
  SparklesIcon,
  DropletIcon,
  StarIcon,
  QuoteIcon,
  ArrowLongRightIcon,
} from "@/components/icons";
import { products } from "@/lib/products";
import { fetchFeaturedProducts, type MergedProduct } from "@/lib/productApi";

export const revalidate = 60;

const categories = [
  {
    title: "Svayam Saundarya",
    subtitle: "Beauty & Skin Care",
    description:
      "Time-tested Ayurvedic formulations for radiant, healthy skin and timeless beauty.",
    icon: SparklesIcon,
    href: "/products?category=face",
    accent: "from-gold/10 to-gold/[0.02]",
  },
  {
    title: "Svayam Swasthya",
    subtitle: "Health & Wellness",
    description:
      "Natural food and wellness products for holistic well-being and inner balance.",
    icon: DropletIcon,
    href: "/products?category=food",
    accent: "from-sage/20 to-sage/[0.03]",
  },
];

const features = [
  {
    icon: LeafIcon,
    title: "100% Natural",
    description:
      "Every ingredient is sourced from organic farms and traditional growers across India.",
  },
  {
    icon: FlaskIcon,
    title: "Lab Tested",
    description:
      "Rigorous quality testing ensures purity, potency, and safety in every batch.",
  },
  {
    icon: ScrollIcon,
    title: "Ayurvedic Heritage",
    description:
      "Formulations rooted in centuries of Ayurvedic wisdom, perfected for modern life. Zero Preservatives.",
  },
  {
    icon: HeartHandIcon,
    title: "Cruelty Free",
    description:
      "We never test on animals. Our beauty comes from nature, not from suffering.",
  },
  {
    icon: RecycleIcon,
    title: "Eco Packaging",
    description:
      "Sustainable, recyclable packaging that respects the earth as much as your body.",
  },
  {
    icon: HandHeartIcon,
    title: "Crafted with Care",
    description:
      "Small-batch production ensures personal attention to every product we create.",
  },
];

const testimonials = [
  {
    name: "Priya Sharma",
    location: "Mumbai",
    text: "Kesh Samraksha completely transformed my hair. After years of chemical treatments, my hair finally feels alive and healthy again. The natural ingredients make all the difference.",
    rating: 5,
    product: "Kesh Samraksha",
  },
  {
    name: "Ananya Iyer",
    location: "Bangalore",
    text: "The Lavanyam Face Pack is pure magic. My skin glows after every use, and I love knowing that everything in it is natural. This is my forever skincare staple.",
    rating: 5,
    product: "Lavanyam Face Pack",
  },
  {
    name: "Meera Patel",
    location: "Ahmedabad",
    text: "I\u2019ve tried countless lip balms, but the Rose Lip Balm is on another level. Soft, moisturizing, and that natural tint is so beautiful. Absolutely worth every rupee.",
    rating: 5,
    product: "Rose Lip Balm",
  },
];

export default async function HomePage() {
  // Fetch featured products from API (randomized, in-stock)
  let featuredProducts: MergedProduct[] = [];
  try {
    featuredProducts = await fetchFeaturedProducts(4);
  } catch {
    // Fallback to static featured products
    featuredProducts = products
      .filter((p) => ["kesh-samraksha", "lavanyam-facepack", "suryakanti-day-cream", "tejasamrit"].includes(p.slug))
      .map(p => ({ ...p, _id: '', inventory: 0, isActive: true, isFeatured: true, concerns: p.concerns || [], badges: p.badges || [], ingredients: p.ingredients || [], benefits: p.benefits || [] } as unknown as MergedProduct));
  }

  return (
    <>
      {/* Search Bar (Top of Home Page) */}
      <HomeSearch />

      {/* Hero */}
      <HeroSlider />

      {/* Shop by Concern */}
      <ShopByConcern />

      {/* Featured Products */}
      <section className="bg-sand py-16 sm:py-20 lg:py-28" id="featured">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <AnimateOnScroll animation="fadeInUp">
            <div className="mb-16 text-center">
              <h2 className="font-heading text-4xl font-bold text-forest md:text-5xl lg:text-6xl">
                Featured Products
              </h2>
              <div className="mx-auto mt-5 flex items-center justify-center gap-3">
                <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-gold/30" />
                <div className="h-1.5 w-1.5 rounded-full bg-gold/50" />
                <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-gold/30" />
              </div>
              <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-clay-light">
                Our most loved formulations, chosen by thousands of happy customers.
              </p>
            </div>
          </AnimateOnScroll>
          <div className="relative mt-8">
            <ProductCarousel>
              {featuredProducts.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </ProductCarousel>
          </div>
          <AnimateOnScroll animation="fadeIn" delay={500}>
            <div className="mt-14 text-center">
              <Link
                href="/products"
                className="group inline-flex items-center gap-3 rounded-full border border-forest/20 px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-forest transition-all duration-300 hover:border-forest hover:bg-forest hover:text-sand"
              >
                View All Products
                <ArrowLongRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Seasonal Must-Haves */}
      <SeasonalPicks />

      {/* Categories */}
      <section className="relative bg-cream py-16 sm:py-20 lg:py-28" id="categories">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-gold)_0%,transparent_70%)] opacity-[0.03]" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <AnimateOnScroll animation="fadeInUp">
            <SectionHeader
              title="Explore Our Collections"
              subtitle="Two Pillars of Beauty and Wellness"
              subtitleClassName="text-lg md:text-xl"
            />
          </AnimateOnScroll>
          <div className="grid gap-8 md:grid-cols-2">
            {categories.map((cat, i) => (
              <AnimateOnScroll
                key={cat.title}
                animation="fadeInUp"
                delay={i * 150}
              >
                <Link
                  href={cat.href}
                  className="group relative block overflow-hidden rounded-2xl border border-neutral-300 bg-white p-10 transition-all duration-500 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_20px_60px_rgba(194,162,93,0.08)] md:p-12"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${cat.accent} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                  />
                  <div className="relative">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/10 to-gold/[0.03] text-gold transition-all duration-300 group-hover:border-gold/40 group-hover:shadow-[0_0_20px_rgba(194,162,93,0.12)]">
                      <cat.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 font-heading text-2xl font-bold text-forest md:text-3xl">
                      {cat.title}
                    </h3>
                    <p className="mb-3 font-accent text-base italic text-clay">
                      {cat.subtitle}
                    </p>
                    <p className="mb-8 text-sm leading-relaxed text-clay-light">
                      {cat.description}
                    </p>
                    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-gold-dark transition-all duration-300 group-hover:gap-3">
                      Explore Collection
                      <ArrowLongRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Before & After Transformation */}
      <BeforeAfterSlider />

      {/* About / Philosophy */}
      <section className="relative overflow-hidden bg-neutral-100 py-16 sm:py-20 lg:py-28" id="about">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--color-sage)_0%,transparent_60%)] opacity-[0.08]" />
        <div className="pointer-events-none absolute -right-40 -top-40 h-[400px] w-[400px] rounded-full bg-gold/[0.03] blur-[100px]" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <AnimateOnScroll animation="fadeInUp">
            <SectionHeader
              title="Our Philosophy"
              subtitle="We believe that true beauty comes from living in harmony with nature."
            />
          </AnimateOnScroll>
          <AnimateOnScroll animation="fadeIn" delay={200}>
            <div className="mx-auto max-w-3xl rounded-3xl border border-neutral-300 bg-white p-10 text-center shadow-sm md:p-16">
              <QuoteIcon className="mx-auto mb-6 h-10 w-10 text-gold" />
              <p className="font-accent text-xl leading-relaxed italic text-forest/70 md:text-2xl">
                At Svayam Natural, we don&rsquo;t manufacture products &mdash;
                we craft rituals. Every formulation is a bridge between ancient
                Ayurvedic wisdom and modern wellness science, designed to help
                you discover the best version of yourself, naturally.
              </p>
              <div className="mx-auto mt-10 h-[1px] w-20 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
              <p className="mt-6 text-[13px] font-medium tracking-[0.15em] text-clay-light">
                Mr. Chaitanya Tambat, Founder
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Features / Why Choose Us */}
      <section className="relative bg-neutral-100 py-16 sm:py-20 lg:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--color-sage)_0%,transparent_70%)] opacity-[0.06]" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <AnimateOnScroll animation="fadeInUp">
            <SectionHeader
              title="Why Choose Svayam"
              subtitle="Our commitment to purity, tradition, and your well-being."
            />
          </AnimateOnScroll>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <AnimateOnScroll
                key={feature.title}
                animation="fadeInUp"
                delay={i * 80}
              >
                <div className="group rounded-2xl border border-neutral-300 bg-white/80 p-8 backdrop-blur-sm transition-all duration-400 hover:-translate-y-1 hover:border-sage/50 hover:shadow-[0_16px_48px_rgba(15,46,31,0.06)]">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-forest/10 bg-forest/[0.04] text-forest transition-all duration-300 group-hover:border-gold/30 group-hover:bg-gold/[0.06] group-hover:text-gold-dark">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-3 font-heading text-lg font-semibold text-forest">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-clay-light">
                    {feature.description}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-cream py-16 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <AnimateOnScroll animation="fadeInUp">
            <SectionHeader
              title="What Our Customers Say"
              subtitle="Real stories from real people who chose nature over chemicals."
            />
          </AnimateOnScroll>
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <AnimateOnScroll
                key={t.name}
                animation="fadeInUp"
                delay={i * 120}
              >
                <div className="relative rounded-2xl border border-neutral-300 bg-white p-8 transition-all duration-400 hover:-translate-y-1 hover:border-gold/20 hover:shadow-[0_16px_48px_rgba(194,162,93,0.06)]">
                  {/* Stars */}
                  <div className="mb-5 flex gap-1 text-gold">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <StarIcon key={j} className="h-4 w-4" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="mb-6 font-accent text-base leading-relaxed italic text-forest/70">
                    &ldquo;{t.text}&rdquo;
                  </p>

                  {/* Product tag */}
                  <p className="mb-5 inline-block rounded-full bg-sage/20 px-3 py-1 text-[11px] font-medium tracking-wider text-forest/60">
                    {t.product}
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 border-t border-neutral-300 pt-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest font-heading text-sm font-bold text-sand">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-forest">
                        {t.name}
                      </p>
                      <p className="text-xs text-clay-light">{t.location}</p>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-sand py-16 sm:py-20 lg:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--color-sage)_0%,transparent_60%)] opacity-[0.08]" />
        <div className="pointer-events-none absolute -left-40 -top-40 h-[400px] w-[400px] rounded-full bg-gold/[0.04] blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-[300px] w-[300px] rounded-full bg-sage/[0.06] blur-[80px]" />
        <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-10">
          <AnimateOnScroll animation="fadeInUp">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-clay-light">
              Your Journey Begins Here
            </p>
            <h2 className="mb-6 font-heading text-4xl font-bold text-forest md:text-5xl">
              Begin your Journey to Eternal Wellness
            </h2>
            <p className="mx-auto mb-12 max-w-md font-accent text-lg italic text-clay-light">
              Join thousands who have chosen nature over chemicals.
            </p>
            <Link
              href="#featured"
              className="group inline-flex items-center gap-4 rounded-full bg-forest px-10 py-4 text-sm font-semibold uppercase tracking-wider text-sand transition-all duration-300 hover:bg-forest-dark hover:shadow-[0_8px_40px_rgba(15,46,31,0.2)]"
            >
              Shop Now
              <ArrowLongRightIcon className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
