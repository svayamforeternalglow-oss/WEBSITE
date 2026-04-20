"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SearchAutocomplete from "./SearchAutocomplete";

export default function HomeSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="w-full border-b border-gold/10 bg-cream/30 px-4 py-2 md:px-8 md:py-2.5">
      <div className="mx-auto max-w-7xl flex flex-col items-center justify-center">
        <form onSubmit={handleSearchSubmit} className="w-full flex justify-center">
          <SearchAutocomplete
            value={query}
            onChange={setQuery}
            onClear={() => setQuery("")}
          />
        </form>
      </div>
    </div>
  );
}
