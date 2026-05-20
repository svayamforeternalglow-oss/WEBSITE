import { ProductCardSkeleton } from '@/components/SkeletonLoader';

export default function Loading() {
  return (
    <section className="min-h-screen bg-neutral-100 pt-28 pb-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <div className="mb-6 h-8 w-48 rounded bg-neutral-200 animate-shimmer" />
        <div className="mb-10 h-4 w-64 rounded bg-neutral-200 animate-shimmer" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <ProductCardSkeleton key={n} />
          ))}
        </div>
      </div>
    </section>
  );
}
