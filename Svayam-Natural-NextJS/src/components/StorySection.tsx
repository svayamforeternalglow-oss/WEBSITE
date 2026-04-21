"use client";

import Image from "next/image";
import AnimateOnScroll from "./AnimateOnScroll";

interface StorySectionProps {
  name: string;
  story: string;
  image: string;
  quote?: string;
}

export default function StorySection({
  name,
  story,
  image,
  quote = "Nature already knows what you need.",
}: StorySectionProps) {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:px-10">
        <AnimateOnScroll animation="fadeInUp">
          <div className="relative overflow-hidden rounded-2xl bg-neutral-200">
            <div className="aspect-[4/3]">
              <div className="relative h-full w-full">
                <Image
                  src={image}
                  alt={`${name} story`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain p-8"
                />
              </div>
            </div>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll animation="slideInRight" delay={200}>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">
              The Story Behind
            </p>
            <h2 className="mb-6 font-heading text-3xl font-bold text-forest md:text-4xl">
              {name}
            </h2>
            <p className="mb-8 leading-relaxed text-clay-light">{story}</p>
            <blockquote className="border-l-4 border-gold pl-6 font-accent text-lg italic text-clay">
              &ldquo;{quote}&rdquo;
            </blockquote>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
