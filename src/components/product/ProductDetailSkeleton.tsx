'use client';

export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-16">
        {/* Back link skeleton */}
        <div className="mb-6 h-4 w-32 animate-pulse rounded bg-slate-800" />

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image skeleton */}
          <div className="space-y-4">
            <div className="aspect-[4/3] w-full animate-pulse rounded-2xl bg-slate-800" />
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 w-20 animate-pulse rounded-lg bg-slate-800" />
              ))}
            </div>
          </div>

          {/* Content skeleton */}
          <div className="space-y-6">
            <div className="h-6 w-24 animate-pulse rounded bg-slate-800" />
            <div className="h-10 w-3/4 animate-pulse rounded bg-slate-800" />
            <div className="h-5 w-1/2 animate-pulse rounded bg-slate-800" />

            {/* Price card skeleton */}
            <div className="h-48 animate-pulse rounded-xl bg-slate-800" />

            {/* Provider card skeleton */}
            <div className="h-32 animate-pulse rounded-xl bg-slate-800" />
          </div>
        </div>
      </div>
    </div>
  );
}
