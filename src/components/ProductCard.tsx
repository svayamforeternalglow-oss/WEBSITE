import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "./icons";
import type { Product } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  const discount =
    product.originalPrice > 0
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100
        )
      : 0;
  const isComingSoon = product.price === 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex h-full flex-col rounded-2xl border border-neutral-300 bg-white p-4 transition-all duration-400 hover:-translate-y-1.5 hover:border-gold/30 hover:shadow-[0_20px_50px_rgba(194,162,93,0.08)]"
    >
      {/* Image */}
      <div className="relative mb-4 overflow-hidden rounded-xl bg-neutral-100">
        <div className="aspect-square">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-contain p-6 transition-transform duration-600 group-hover:scale-105"
          />
        </div>
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-forest px-3 py-1 text-[10px] font-bold tracking-wider text-sand">
            {discount}% OFF
          </span>
        )}
      </div>

      {/* Info — flex-grow so the price row stays at the bottom */}
      <div className="flex flex-1 flex-col px-1 pb-1">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-clay-light">
          {product.category.replace(/-/g, " ")}
        </p>
        <h3 className="mb-1.5 font-heading text-lg font-semibold text-forest transition-colors duration-300 group-hover:text-gold-dark">
          {product.name}
        </h3>
        <p className="mb-auto line-clamp-2 text-[13px] leading-relaxed text-clay-light/80">
          {product.tagline}
        </p>
        <div className="mt-4 flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-2">
            {isComingSoon ? (
              <span className="text-sm font-semibold text-clay-light">
                Coming soon
              </span>
            ) : (
              <>
                <span className="text-lg font-bold text-forest">
                  ₹{product.price}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-xs text-clay-light/60 line-through">
                    ₹{product.originalPrice}
                  </span>
                )}
              </>
            )}
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-clay-light transition-all duration-300 group-hover:bg-gold group-hover:text-forest">
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
