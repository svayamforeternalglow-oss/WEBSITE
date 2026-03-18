export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-neutral-300 bg-white p-4">
      <div className="mb-4 aspect-square rounded-xl bg-neutral-200 animate-shimmer" />
      <div className="mb-2 h-3 w-20 rounded bg-neutral-200 animate-shimmer" />
      <div className="mb-1 h-5 w-3/4 rounded bg-neutral-200 animate-shimmer" />
      <div className="mb-3 h-3 w-1/2 rounded bg-neutral-200 animate-shimmer" />
      <div className="flex gap-2">
        <div className="h-5 w-12 rounded bg-neutral-200 animate-shimmer" />
        <div className="h-5 w-12 rounded bg-neutral-200 animate-shimmer" />
      </div>
    </div>
  );
}

export function CartItemSkeleton() {
  return (
    <div className="flex gap-4 rounded-xl border border-neutral-300 bg-white p-4">
      <div className="h-24 w-24 shrink-0 rounded-lg bg-neutral-200 animate-shimmer" />
      <div className="flex-1">
        <div className="mb-2 h-5 w-3/4 rounded bg-neutral-200 animate-shimmer" />
        <div className="mb-2 h-4 w-1/3 rounded bg-neutral-200 animate-shimmer" />
        <div className="h-4 w-1/4 rounded bg-neutral-200 animate-shimmer" />
      </div>
    </div>
  );
}

export function CheckoutSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((n) => (
        <div key={n} className="h-12 rounded-lg bg-neutral-200 animate-shimmer" />
      ))}
      <div className="mt-6 h-48 rounded-xl bg-neutral-200 animate-shimmer" />
    </div>
  );
}
