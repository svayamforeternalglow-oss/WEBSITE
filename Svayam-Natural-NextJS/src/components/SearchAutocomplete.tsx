"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { fetchProducts, type MergedProduct } from "@/lib/productApi";

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export default function SearchAutocomplete({
  value,
  onChange,
  onClear,
}: SearchAutocompleteProps) {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<MergedProduct[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch suggestions when user types
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    try {
      const results = await fetchProducts({ search: query, active: true, limit: 6 });
      setSuggestions(results);
      setShowDropdown(results.length > 0);
    } catch {
      setSuggestions([]);
      setShowDropdown(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value, fetchSuggestions]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Navigate to product
  const handleSelect = (product: MergedProduct) => {
    setShowDropdown(false);
    onChange("");
    router.push(`/products/${product.slug}`);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[highlightIndex]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setHighlightIndex(-1);
    }
  };

  // Reset highlight when suggestions change
  useEffect(() => {
    setHighlightIndex(-1);
  }, [suggestions]);

  // Format price
  const formatPrice = (price: number) => {
    if (!price || price === 0) return "";
    return `₹${price}`;
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-lg">
      {/* Search Input */}
      <input
        ref={inputRef}
        type="text"
        placeholder="Search products..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          if (suggestions.length > 0 && value.trim().length >= 2) {
            setShowDropdown(true);
          }
        }}
        onKeyDown={handleKeyDown}
        className="w-full rounded-full border border-neutral-300 bg-white px-6 py-3 pl-12 text-sm outline-none transition-all focus:border-gold focus:shadow-[0_0_0_3px_rgba(194,162,93,0.1)]"
        role="combobox"
        aria-expanded={showDropdown}
        aria-autocomplete="list"
        aria-controls="search-suggestions"
        id="product-search"
      />
      {/* Search Icon */}
      <svg
        className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-clay-light"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
        />
      </svg>

      {/* Loading spinner */}
      {loading && (
        <div className="absolute right-12 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
        </div>
      )}

      {/* Clear button */}
      {value && (
        <button
          onClick={() => {
            onClear();
            setShowDropdown(false);
            setSuggestions([]);
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-clay-light hover:text-forest transition-colors"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}

      {/* Suggestions Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div
          id="search-suggestions"
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-neutral-300 bg-white shadow-[0_12px_48px_rgba(0,0,0,0.12)] animate-fadeIn"
        >
          <div className="px-4 py-2 border-b border-neutral-300/50">
            <span className="text-[11px] font-medium uppercase tracking-wider text-clay-light">
              Suggestions ({suggestions.length})
            </span>
          </div>
          <ul className="max-h-[360px] overflow-y-auto py-1">
            {suggestions.map((product, index) => (
              <li
                key={product.slug}
                role="option"
                aria-selected={index === highlightIndex}
                className={`flex cursor-pointer items-center gap-4 px-4 py-3 transition-all duration-150 ${
                  index === highlightIndex
                    ? "bg-gold/[0.08]"
                    : "hover:bg-neutral-100"
                }`}
                onClick={() => handleSelect(product)}
                onMouseEnter={() => setHighlightIndex(index)}
              >
                {/* Product thumbnail */}
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-neutral-300 bg-neutral-100">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>

                {/* Product info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-forest truncate">
                    {highlightMatch(product.name, value)}
                  </p>
                  {product.tagline && (
                    <p className="text-xs text-clay-light truncate mt-0.5">
                      {product.tagline}
                    </p>
                  )}
                </div>

                {/* Price */}
                {product.price > 0 && (
                  <div className="flex-shrink-0 text-right">
                    <span className="text-sm font-semibold text-forest">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="ml-1.5 text-xs text-clay-light line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                )}

                {/* Arrow icon */}
                <svg
                  className={`h-4 w-4 flex-shrink-0 text-clay-light transition-all ${
                    index === highlightIndex
                      ? "translate-x-0 opacity-100 text-gold-dark"
                      : "-translate-x-1 opacity-0"
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </li>
            ))}
          </ul>

          {/* View all results link */}
          <div className="border-t border-neutral-300/50 px-4 py-2.5">
            <button
              onClick={() => {
                setShowDropdown(false);
              }}
              className="flex w-full items-center justify-center gap-2 text-xs font-medium uppercase tracking-wider text-gold-dark transition-colors hover:text-forest"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
              View all results for &ldquo;{value}&rdquo;
            </button>
          </div>
        </div>
      )}

      {/* No results message */}
      {showDropdown && suggestions.length === 0 && !loading && value.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-neutral-300 bg-white px-6 py-8 text-center shadow-[0_12px_48px_rgba(0,0,0,0.12)] animate-fadeIn">
          <svg
            className="mx-auto mb-3 h-8 w-8 text-clay-light/50"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <p className="text-sm text-clay-light">
            No products found for &ldquo;{value}&rdquo;
          </p>
          <p className="mt-1 text-xs text-clay-light/60">
            Try a different search term
          </p>
        </div>
      )}
    </div>
  );
}

/** Highlight matching text in a product name */
function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="text-gold-dark font-bold">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}
