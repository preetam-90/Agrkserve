import { Skeleton } from '@/components/ui/skeleton';

export function BookingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
      {/* Header skeleton */}
      <div className="h-20 border-b border-white/10" />

      <main className="mx-auto max-w-[1600px] px-4 pb-8 pt-28">
        {/* Back Button */}
        <div className="mb-4">
          <Skeleton className="h-8 w-24" />
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3">
              <Skeleton className="h-12 w-64" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-28 rounded-xl" />
              <Skeleton className="h-10 w-48 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 p-6 transition-all hover:border-white/20"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-10 w-10 rounded-xl" />
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-800">
          <div className="flex gap-6 overflow-x-auto pb-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative max-w-md flex-1">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 opacity-0 blur-sm" />
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80">
                <Skeleton className="h-14 w-full pl-14" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-32 rounded-xl" />
              <Skeleton className="h-10 w-32 rounded-xl" />
              <Skeleton className="h-10 w-32 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-48" />
        </div>

        {/* Booking Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 transition-all hover:border-white/20"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <Skeleton className="h-full w-full" />
                {/* Category & Status badges */}
                <div className="absolute left-3 top-3 flex gap-2">
                  <Skeleton className="h-6 w-20 rounded-full bg-cyan-500/20" />
                  <Skeleton className="h-6 w-24 rounded-full bg-emerald-500/20" />
                </div>
                {/* Action buttons */}
                <div className="absolute right-3 top-3 flex gap-2">
                  <Skeleton className="h-9 w-9 rounded-full bg-white/10 backdrop-blur-sm" />
                  <Skeleton className="h-9 w-9 rounded-full bg-white/10 backdrop-blur-sm" />
                </div>
                {/* Image indicators */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <Skeleton className="h-1.5 w-6 rounded-full bg-cyan-400/30" />
                    <Skeleton className="h-1.5 w-6 rounded-full bg-white/20" />
                    <Skeleton className="h-1.5 w-6 rounded-full bg-white/20" />
                  </div>
                  <Skeleton className="h-8 w-16 rounded-lg bg-black/30 backdrop-blur-sm" />
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4 p-5">
                <div className="space-y-2">
                  {/* Brand/Category badge */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded bg-cyan-500/20" />
                    <Skeleton className="h-4 w-24 rounded bg-cyan-500/10" />
                  </div>
                  {/* Title & Subtitle */}
                  <Skeleton className="h-6 w-3/4 bg-white/20" />
                  <Skeleton className="h-4 w-1/2 bg-white/10" />
                </div>
                {/* Details grid with colored backgrounds */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-500/10 bg-emerald-500/5 px-3 py-2">
                    <Skeleton className="h-4 w-4 rounded bg-emerald-500/20" />
                    <Skeleton className="h-4 w-32 bg-emerald-500/10" />
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-blue-500/10 bg-blue-500/5 px-3 py-2">
                    <Skeleton className="h-4 w-4 rounded bg-blue-500/20" />
                    <Skeleton className="h-4 w-28 bg-blue-500/10" />
                  </div>
                </div>
                {/* Price & Action */}
                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <div className="space-y-1.5">
                    <Skeleton className="h-6 w-24 rounded bg-cyan-400/20" />
                    <Skeleton className="h-3 w-16 bg-white/10" />
                  </div>
                  <Skeleton className="h-10 w-28 rounded-xl bg-gradient-to-r from-cyan-500/20 to-emerald-500/20" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-8 flex justify-center">
          <Skeleton className="h-12 w-48 rounded-xl" />
        </div>
      </main>

      {/* Footer skeleton */}
      <div className="h-32 border-t border-white/10" />
    </div>
  );
}
