'use client';

import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, ShoppingBagIcon } from "./icons";
import type { Product } from "@/lib/products";
import WishlistButton from "./WishlistButton";
import { useCartStore } from "@/lib/cart";
import { useToastStore } from "@/lib/toast";

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const addToast = useToastStore((s) => s.addToast);

  const discount =
    product.originalPrice > 0
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100
        )
      : 0;
  const isComingSoon = product.price === 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.slug,
      slug: product.slug,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      weight: product.weight,
      sku: product.sku,
    });
    addToast(`${product.name} added to cart`, "success");
    openCart();
  };

  return (
    <div className="group relative flex h-full flex-col rounded-2xl border border-neutral-300 bg-white p-3 sm:p-4 transition-all duration-400 hover:-translate-y-1.5 hover:border-gold/30 hover:shadow-[0_20px_50px_rgba(194,162,93,0.08)]">
      {/* Wishlist Button - Overlay */}
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <WishlistButton product={product} />
      </div>

      <Link href={`/products/${product.slug}`} className="flex flex-1 flex-col">
        {/* Image */}
        <div className="relative mb-4 overflow-hidden rounded-xl bg-neutral-100">
          <div className="aspect-square">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
              className="object-contain p-4 sm:p-6 transition-transform duration-600 group-hover:scale-105"
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
            
            {!isComingSoon ? (
              <button
                onClick={handleQuickAdd}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-clay-light transition-all duration-300 hover:bg-gold hover:text-forest group-hover:bg-gold/20 group-hover:text-gold-dark"
                title="Add to Cart"
              >
                <ShoppingBagIcon className="h-4 w-4" />
              </button>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-clay-light">
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
