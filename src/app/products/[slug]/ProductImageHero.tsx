"use client";

import Image from "next/image";

interface ProductImageHeroProps {
  image: string;
  name: string;
}

export default function ProductImageHero({
  image,
  name,
}: ProductImageHeroProps) {
  return (
    <div className="animate-float">
      <div className="img-zoom relative aspect-square overflow-hidden rounded-3xl bg-white/60 p-8 shadow-xl backdrop-blur-sm">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain p-4 transition-transform duration-600"
          priority
        />
      </div>
    </div>
  );
}
