"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SectionHeader from "@/components/SectionHeader";
import ProductCard from "@/components/ProductCard";
import { fetchProducts, type MergedProduct } from "@/lib/productApi";
import { PRODUCTS_PAGE_CATEGORIES } from "@/lib/products";

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get("category");
  const concernParam = searchParams.get("concern");
  const searchParam = searchParams.get("search");

  const [activeCategory, setActiveCategory] = useState(categoryParam || "all");
  const [activeConcern, setActiveConcern] = useState(concernParam || "");
  const [searchQuery, setSearchQuery] = useState(searchParam || "");
  const [products, setProducts] = useState<MergedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync URL params to state
  useEffect(() => {
    if (categoryParam) setActiveCategory(categoryParam);
    if (concernParam) setActiveConcern(concernParam);
    if (searchParam) setSearchQuery(searchParam);
  }, [categoryParam, concernParam, searchParam]);

  // Fetch products from API
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      // Build category filter for API
      let categoryForApi: string | undefined;
      if (activeCategory !== "all") {
        // Map our local category IDs to backend category values
        const catMap: Record<string, string> = {
          face: "skin-care",
          "lip-balm": "beauty-products",
          "body-care": "body-care",
          "hair-care": "hair-care",
          food: "natural-food",
          detox: "natural-food",
          kits: "", // Kits span multiple categories — fetch all, filter client-side
        };
        categoryForApi = catMap[activeCategory];
      }

      const result = await fetchProducts({
        search: searchQuery || undefined,
        category: categoryForApi || undefined,
        concern: activeConcern || undefined,
        active: true,
      });

      // For categories that use slug-based filtering (kits, detox), filter client-side
      if (activeCategory !== "all" && !categoryForApi) {
        const catConfig = PRODUCTS_PAGE_CATEGORIES.find(c => c.id === activeCategory);
        if (catConfig && catConfig.slugs.length > 0) {
          const slugSet = new Set<string>(catConfig.slugs as unknown as string[]);
          setProducts(result.filter(p => slugSet.has(p.slug)));
        } else {
          setProducts(result);
        }
      } else {
        setProducts(result);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, activeConcern, searchQuery]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Update URL when filters change
  const updateUrl = (cat: string, concern: string, search: string) => {
    const params = new URLSearchParams();
    if (cat !== "all") params.set("category", cat);
    if (concern) params.set("concern", concern);
    if (search) params.set("search", search);
    const qs = params.toString();
    router.push(`/products${qs ? `?${qs}` : ""}`);
  };

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    updateUrl(catId, activeConcern, searchQuery);
  };

  const handleConcernClear = () => {
    setActiveConcern("");
    updateUrl(activeCategory, "", searchQuery);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  // Debounced search: update URL after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      updateUrl(activeCategory, activeConcern, searchQuery);
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  return (
    <section className="bg-neutral-100 pt-28 pb-24 min-h-screen">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeader
          title="Our Products"
          subtitle="Handcrafted Ayurvedic formulations for beauty, health, and wellness."
        />

        {/* Search Bar */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-full max-w-lg">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full rounded-full border border-neutral-300 bg-white px-6 py-3 pl-12 text-sm outline-none transition-all focus:border-gold focus:shadow-[0_0_0_3px_rgba(194,162,93,0.1)]"
            />
            <svg
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-clay-light"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); updateUrl(activeCategory, activeConcern, ""); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-clay-light hover:text-forest"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Active concern badge */}
        {activeConcern && (
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-gold/10 border border-gold/30 px-4 py-2 text-sm font-medium text-gold-dark">
              Concern: {activeConcern.replace(/-/g, " ")}
              <button onClick={handleConcernClear} className="ml-1 hover:text-forest">✕</button>
            </span>
          </div>
        )}

        {/* Category filters */}
        <div className="mb-8 flex overflow-x-auto overscroll-x-contain pb-4 hide-scrollbar snap-x snap-mandatory items-center justify-start sm:mb-12 sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0 gap-3 px-1">
          {PRODUCTS_PAGE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`snap-always snap-center whitespace-nowrap rounded-full px-5 sm:px-6 py-2 sm:py-2.5 text-sm font-medium transition-all ${
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
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6 lg:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-neutral-300 bg-white p-4 animate-pulse">
                <div className="aspect-square rounded-xl bg-neutral-200 mb-4" />
                <div className="h-3 w-16 rounded bg-neutral-200 mb-2" />
                <div className="h-5 w-3/4 rounded bg-neutral-200 mb-2" />
                <div className="h-3 w-full rounded bg-neutral-200" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6 lg:gap-8">
              {products.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
            {products.length === 0 && (
              <div className="text-center text-clay py-12">
                {searchQuery
                  ? `No products found for "${searchQuery}".`
                  : "No products found in this category."}
              </div>
            )}
          </>
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
