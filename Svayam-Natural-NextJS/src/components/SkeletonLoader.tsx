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

export function ProductDetailSkeleton() {
  return (
    <section className="bg-neutral-100 pt-28 pb-16">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-2 lg:px-10">
        <div className="mx-auto w-full max-w-md">
          <div className="aspect-square rounded-3xl bg-neutral-200 animate-shimmer" />
        </div>
        <div>
          <div className="mb-3 h-3 w-24 rounded bg-neutral-200 animate-shimmer" />
          <div className="mb-4 h-10 w-3/4 rounded bg-neutral-200 animate-shimmer" />
          <div className="mb-6 h-4 w-2/3 rounded bg-neutral-200 animate-shimmer" />
          <div className="mb-8 space-y-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-3 w-full rounded bg-neutral-200 animate-shimmer" />
            ))}
          </div>
          <div className="mb-6 flex items-center gap-3">
            <div className="h-8 w-24 rounded bg-neutral-200 animate-shimmer" />
            <div className="h-6 w-16 rounded bg-neutral-200 animate-shimmer" />
          </div>
          <div className="flex gap-3">
            <div className="h-11 w-40 rounded-full bg-neutral-200 animate-shimmer" />
            <div className="h-11 w-32 rounded-full bg-neutral-200 animate-shimmer" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function CartPageSkeleton() {
  return (
    <section className="bg-neutral-100 pt-28 pb-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <div className="mb-6 h-8 w-48 rounded bg-neutral-200 animate-shimmer" />
        <div className="mb-10 h-4 w-56 rounded bg-neutral-200 animate-shimmer" />
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {[1, 2, 3].map((n) => (
              <CartItemSkeleton key={n} />
            ))}
          </div>
          <div className="rounded-2xl border border-neutral-300 bg-white p-6">
            <div className="mb-5 h-5 w-32 rounded bg-neutral-200 animate-shimmer" />
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-4 w-full rounded bg-neutral-200 animate-shimmer" />
              ))}
            </div>
            <div className="mt-6 h-10 rounded-full bg-neutral-200 animate-shimmer" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function CheckoutPageSkeleton() {
  return (
    <section className="min-h-screen bg-neutral-100 pt-28 pb-12">
      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        <div className="mb-10 h-6 w-56 rounded bg-neutral-200 animate-shimmer" />
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <CheckoutSkeleton />
          </div>
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-neutral-300 bg-white p-6">
              <div className="mb-4 h-5 w-32 rounded bg-neutral-200 animate-shimmer" />
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-4 w-full rounded bg-neutral-200 animate-shimmer" />
                ))}
              </div>
              <div className="mt-6 h-10 rounded-full bg-neutral-200 animate-shimmer" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
