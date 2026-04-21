"use client";

import Image from "next/image";
import { useState } from "react";

interface ProductImageHeroProps {
  image: string;
  images?: string[];
  name: string;
}

export default function ProductImageHero({
  image,
  images,
  name,
}: ProductImageHeroProps) {
  const displayImages = images?.length ? images : [image];
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className="animate-float flex w-full flex-col gap-4">
      <div className="img-zoom relative aspect-square overflow-hidden rounded-3xl bg-white/60 p-8 shadow-xl backdrop-blur-sm">
        <Image
          src={displayImages[currentIndex]}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain p-4 transition-transform duration-600"
          priority
        />
      </div>
      
      {displayImages.length > 1 && (
        <div className="flex justify-center gap-3 overflow-x-auto pb-2">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                currentIndex === idx ? "border-forest shadow-md" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`${name} thumbnail ${idx + 1}`}
                fill
                className="object-contain bg-white/80 p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
