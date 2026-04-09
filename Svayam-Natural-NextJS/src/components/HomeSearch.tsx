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
    <div className="w-full bg-cream/30 pb-4 pt-3 px-4 md:pt-6 md:pb-6 md:px-8 border-b border-gold/10">
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
