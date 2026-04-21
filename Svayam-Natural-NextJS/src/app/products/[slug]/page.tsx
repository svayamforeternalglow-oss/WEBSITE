import { notFound } from "next/navigation";
import Link from "next/link";
import { products, getCategoryDisplayName, getProductBySlug as getStaticProduct } from "@/lib/products";
import { fetchProductBySlug } from "@/lib/productApi";
import StorySection from "@/components/StorySection";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import AddToCartButton from "@/components/AddToCartButton";
import WishlistButton from "@/components/WishlistButton";
import ChandraprabhaPage from "@/components/ChandraprabhaPage";
import SuryakantiPage from "@/components/SuryakantiPage";
import ProductImageHero from "./ProductImageHero";
import type { Metadata } from "next";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  // Try API first for live data, fall back to static
  const apiProduct = await fetchProductBySlug(slug);
  const staticProduct = getStaticProduct(slug);
  const product = apiProduct || staticProduct;
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.name} — ${product.tagline || ''}`,
    description: product.description,
  };
}

// ISR: revalidate every 60 seconds for live data
export const revalidate = 60;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  // Fetch from API (live data merged with editorial), fall back to static
  const apiProduct = await fetchProductBySlug(slug);
  const staticProduct = getStaticProduct(slug);
  const product = apiProduct || staticProduct;
  
  if (!product) notFound();

  // Special pages for premium products
  if (slug === "chandraprabha-night-nectar") {
    return <ChandraprabhaPage product={product as any} />;
  }
  if (slug === "suryakanti-day-cream") {
    return <SuryakantiPage product={product as any} />;
  }

  const discount =
    product.originalPrice > 0
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100
        )
      : 0;
  
  // Out of stock: explicitly inactive or no inventory
  const inventory = 'inventory' in product ? (product as any).inventory : undefined;
  const isActive = 'isActive' in product ? (product as any).isActive : true;
  const isOutOfStock = 
    isActive === false ||
    (inventory !== undefined && inventory <= 0);

  return (
    <article className={`theme-${product.theme}`}>
      {/* Hero */}
      <section className="product-hero-bg relative overflow-hidden pt-28 pb-16 lg:pt-32">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `var(--theme-bg, linear-gradient(135deg, #F5F9F6, #EAF2EC))`,
          }}
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:px-10">
          {/* Product Image with zoom hover */}
          <div className="relative mx-auto w-full max-w-md lg:order-2">
            <ProductImageHero image={product.image} images={product.images} name={product.name} />
            <div
              className="absolute -inset-4 -z-10 rounded-3xl opacity-40 blur-3xl"
              style={{
                background: `var(--theme-glow, rgba(45, 90, 61, 0.12))`,
              }}
            />
          </div>

          {/* Product Info */}
          <div className="lg:order-1">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-clay">
              {getCategoryDisplayName(product.category)}
            </p>
            <h1 className="mb-4 font-heading text-4xl font-bold text-forest md:text-5xl lg:text-6xl">
              {product.name}
            </h1>
            {product.tagline && (
              <p className="mb-6 font-accent text-xl italic text-clay">
                {product.tagline}
              </p>
            )}
            <p className="mb-8 max-w-lg leading-relaxed text-clay-light">
              {product.description}
            </p>

            {/* Badges */}
            {'badges' in product && product.badges && product.badges.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-3">
              {product.badges.map((badge: string) => (
                <span
                  key={badge}
                  className="rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-semibold text-gold-dark"
                >
                  {badge}
                </span>
              ))}
            </div>
            )}

            {/* Pricing */}
            <div className="mb-8 flex items-baseline gap-4">
              <span className="font-heading text-4xl font-bold text-forest">
                ₹{product.price}
              </span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-xl text-clay-light line-through">
                    ₹{product.originalPrice}
                  </span>
                  <span className="rounded-full bg-gold px-3 py-1 text-xs font-bold text-forest">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            {/* SKU & Weight */}
            {('sku' in product || 'weight' in product) && (product.sku || product.weight) && (
            <div className="mb-8 flex gap-6 text-sm text-clay-light">
              {product.sku && (
              <span>
                <span className="font-medium text-clay">SKU:</span>{" "}
                {product.sku}
              </span>
              )}
              {product.weight && (
              <span>
                <span className="font-medium text-clay">Weight:</span>{" "}
                {product.weight}
              </span>
              )}
            </div>
            )}

            <div className="flex flex-wrap gap-4">
              {!isOutOfStock && <AddToCartButton product={product} />}
              <WishlistButton product={product} showText />
            </div>
          </div>
        </div>
      </section>

      {/* The Story (with parallax image) */}
      {product.story && (
      <StorySection
        name={product.name}
        story={product.story}
        image={product.image}
      />
      )}

      {/* Key Ingredients */}
      {'ingredients' in product && product.ingredients && product.ingredients.length > 0 && (
      <section className="bg-neutral-100 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <AnimateOnScroll animation="fadeInUp">
            <div className="mb-16 text-center">
              <h2 className="font-heading text-4xl font-bold text-forest">
                Key Ingredients
              </h2>
              <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-gold to-gold-light" />
              <p className="mx-auto mt-5 max-w-xl font-accent text-lg italic text-clay">
                Each ingredient is carefully chosen for its proven Ayurvedic
                benefits.
              </p>
            </div>
          </AnimateOnScroll>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {product.ingredients.map((ing: { name: string; icon: string; description: string }, i: number) => (
              <AnimateOnScroll
                key={ing.name}
                animation="fadeInUp"
                delay={i * 100}
              >
                <div className="group rounded-2xl border border-neutral-300 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-lg hover:shadow-gold/8">
                  <span className="mb-4 block text-4xl transition-transform duration-300 group-hover:scale-110">
                    {ing.icon}
                  </span>
                  <h3 className="mb-3 font-heading text-xl font-semibold text-forest">
                    {ing.name}
                  </h3>
                  <p className="text-sm leading-relaxed text-clay-light">
                    {ing.description}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Benefits */}
      {'benefits' in product && product.benefits && product.benefits.length > 0 && (
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <AnimateOnScroll animation="fadeInUp">
            <div className="mb-16 text-center">
              <h2 className="font-heading text-4xl font-bold text-forest">
                Benefits
              </h2>
              <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-gold to-gold-light" />
            </div>
          </AnimateOnScroll>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {product.benefits.map((b: { title: string; description: string; icon: string }, i: number) => (
              <AnimateOnScroll
                key={b.title}
                animation="fadeInUp"
                delay={i * 100}
              >
                <div className="group rounded-2xl border border-neutral-300 bg-neutral-100 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-md">
                  <span className="mb-4 block text-3xl">{b.icon}</span>
                  <h3 className="mb-2 font-heading text-lg font-semibold text-forest">
                    {b.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-clay-light">
                    {b.description}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* How to Use */}
      {product.howToUse && (
        <section className="bg-forest py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-6 text-center lg:px-10">
            <AnimateOnScroll animation="fadeInUp">
              <h2 className="mb-8 font-heading text-3xl font-bold text-sand md:text-4xl">
                How to Use
              </h2>
              <div className="mx-auto mb-8 h-[2px] w-16 bg-gradient-to-r from-gold to-gold-light" />
              <p className="font-accent text-lg leading-relaxed italic text-sand/70">
                {product.howToUse}
              </p>
            </AnimateOnScroll>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="bg-neutral-200 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-10">
          <AnimateOnScroll animation="fadeInUp">
            <h2 className="mb-6 font-heading text-3xl font-bold text-forest md:text-4xl">
              Ready to Experience {product.name}?
            </h2>
            <p className="mb-8 text-clay-light">
              Join thousands of customers who have made this a part of their
              daily ritual.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {!isOutOfStock && <AddToCartButton product={product} variant="cta" />}
              <Link
                href="/products"
                className="rounded-lg border-2 border-forest/20 px-8 py-4 text-sm font-bold uppercase tracking-wider text-forest transition-all hover:border-gold hover:text-gold-dark"
              >
                Continue Browsing
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </article>
  );
}
