"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SectionHeader from "@/components/SectionHeader";
import ProductCard from "@/components/ProductCard";
import SearchAutocomplete from "@/components/SearchAutocomplete";
import { fetchProducts, type MergedProduct } from "@/lib/productApi";
import {
  PRODUCTS_PAGE_CATEGORIES,
  CATEGORY_TO_BACKEND_MAP,
  CONCERN_ROUTE_PRODUCTS,
  COLLECTION_ROUTE_PRODUCTS,
  normalizeCategoryQuery,
  normalizeConcernQuery,
} from "@/lib/products";

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get("category");
  const concernParam = searchParams.get("concern");
  const collectionParam = searchParams.get("collection");
  const searchParam = searchParams.get("search");

  const [activeCategory, setActiveCategory] = useState(normalizeCategoryQuery(categoryParam));
  const [activeConcern, setActiveConcern] = useState(normalizeConcernQuery(concernParam));
  const [activeCollection, setActiveCollection] = useState((collectionParam || "").trim().toLowerCase());
  const [searchQuery, setSearchQuery] = useState(searchParam || "");
  const [products, setProducts] = useState<MergedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync URL params to state
  useEffect(() => {
    setActiveCategory(normalizeCategoryQuery(categoryParam));
    setActiveConcern(normalizeConcernQuery(concernParam));
    setActiveCollection((collectionParam || "").trim().toLowerCase());
    setSearchQuery(searchParam || "");
  }, [categoryParam, concernParam, collectionParam, searchParam]);

  // Fetch products from API
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      // Build category filter for API
      let categoryForApi: string | undefined;
      if (activeCategory !== "all") {
        categoryForApi = CATEGORY_TO_BACKEND_MAP[activeCategory];
        if (!categoryForApi && !(activeCategory in CATEGORY_TO_BACKEND_MAP)) {
          categoryForApi = activeCategory;
        }
      }

      const result = await fetchProducts({
        search: searchQuery.trim() || undefined,
        category: categoryForApi || undefined,
        active: true,
      });

      let filtered = result;

      // 1. Filter by collection routes
      if (activeCollection) {
        const collectionSlugs = COLLECTION_ROUTE_PRODUCTS[activeCollection];
        if (collectionSlugs?.length) {
          const slugSet = new Set(collectionSlugs);
          filtered = filtered.filter((p) => slugSet.has(p.slug));
        }
      }

      // 2. Filter by concern routes
      if (activeConcern) {
        const concernSlugs = CONCERN_ROUTE_PRODUCTS[activeConcern];
        if (concernSlugs?.length > 0) {
          const slugSet = new Set(concernSlugs);
          filtered = filtered.filter((p) => slugSet.has(p.slug));
        } else {
          filtered = filtered.filter((p) =>
            (p.concerns || []).some((concern) => normalizeConcernQuery(concern) === activeConcern)
          );
        }
      }

      // 3. Filter by category slug sets
      if (activeCategory !== "all") {
        const catConfig = PRODUCTS_PAGE_CATEGORIES.find((c) => c.id === activeCategory);
        if (catConfig && catConfig.slugs.length > 0) {
          const slugSet = new Set<string>(catConfig.slugs as unknown as string[]);
          filtered = filtered.filter((p) => slugSet.has(p.slug));
        }
      }
      
      setProducts(filtered);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, activeConcern, activeCollection, searchQuery]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Update URL when filters change
  const updateUrl = (
    cat: string,
    concern: string,
    search: string,
    collection: string,
    mode: "push" | "replace" = "push"
  ) => {
    const params = new URLSearchParams();
    if (cat !== "all") params.set("category", cat);
    if (concern) params.set("concern", concern);
    if (collection) params.set("collection", collection);
    if (search.trim()) params.set("search", search.trim());
    const qs = params.toString();
    const nextUrl = `/products${qs ? `?${qs}` : ""}`;
    if (mode === "replace") {
      router.replace(nextUrl);
      return;
    }
    router.push(nextUrl);
  };

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    setActiveCollection("");
    updateUrl(catId, activeConcern, searchQuery, "");
  };

  const handleConcernClear = () => {
    setActiveConcern("");
    updateUrl(activeCategory, "", searchQuery, activeCollection);
  };

  const handleCollectionClear = () => {
    setActiveCollection("");
    updateUrl(activeCategory, activeConcern, searchQuery, "");
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  // Debounced search: update URL after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      updateUrl(activeCategory, activeConcern, searchQuery, activeCollection, "replace");
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
          <SearchAutocomplete
            value={searchQuery}
            onChange={handleSearchChange}
            onClear={() => {
              setSearchQuery("");
              updateUrl(activeCategory, activeConcern, "", activeCollection);
            }}
          />
        </div>

        {activeCollection && (
          <div className="mb-4 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-forest/10 border border-forest/20 px-4 py-2 text-sm font-medium text-forest">
              Collection: {activeCollection}
              <button onClick={handleCollectionClear} className="ml-1 hover:text-gold-dark">✕</button>
            </span>
          </div>
        )}

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
