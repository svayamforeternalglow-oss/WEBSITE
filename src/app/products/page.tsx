"use client";

import { useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import ProductCard from "@/components/ProductCard";
import {
  PRODUCTS_PAGE_CATEGORIES,
  getProductsBySlugs,
  products,
} from "@/lib/products";

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const displayedProducts =
    activeCategory === "all"
      ? products
      : getProductsBySlugs(
          PRODUCTS_PAGE_CATEGORIES.find((c) => c.id === activeCategory)
            ?.slugs ?? []
        );

  return (
    <section className="bg-neutral-100 pt-28 pb-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeader
          title="Our Products"
          subtitle="Handcrafted Ayurvedic formulations for beauty, health, and wellness."
        />

        {/* Category filters */}
        <div className="mb-12 flex flex-wrap justify-center gap-3">
          {PRODUCTS_PAGE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-full px-6 py-2.5 text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? "bg-forest text-sand"
                  : "border border-neutral-300 bg-white text-clay hover:border-gold/40 hover:text-gold-dark"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Products grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayedProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
