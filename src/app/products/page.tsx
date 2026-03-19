"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SectionHeader from "@/components/SectionHeader";
import ProductCard from "@/components/ProductCard";
import {
  PRODUCTS_PAGE_CATEGORIES,
  getProductsBySlugs,
  products,
} from "@/lib/products";

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get("category");
  
  const [activeCategory, setActiveCategory] = useState(
    categoryParam || "all"
  );

  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam]);

  const displayedProducts =
    activeCategory === "all"
      ? products
      : getProductsBySlugs(
          PRODUCTS_PAGE_CATEGORIES.find((c) => c.id === activeCategory)
            ?.slugs ?? []
        );

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    // Optionally update URL so it remains shareable
    router.push(`/products${catId === 'all' ? '' : `?category=${catId}`}`);
  };

  return (
    <section className="bg-neutral-100 pt-28 pb-24 min-h-screen">
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
              onClick={() => handleCategoryChange(cat.id)}
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
        
        {displayedProducts.length === 0 && (
          <div className="text-center text-clay py-12">
            No products found in this category.
          </div>
        )}
      </div>
    </section>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-100 pt-28 pb-24 text-center text-forest">Loading products...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
