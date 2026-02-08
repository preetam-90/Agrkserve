import { Skeleton } from '@/components/ui/skeleton';

export function EquipmentCardSkeleton() {
  return (
    <div className="perspective-1000 group">
      <div className="relative h-full overflow-hidden rounded-2xl transition-all duration-500">
        {/* Gradient border glow */}
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 opacity-0 blur-sm transition-opacity duration-500" />

        {/* Glassmorphism card */}
        <div className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/90 to-[#0a0a0a]/90 shadow-xl backdrop-blur-xl">
          {/* Image Gallery section */}
          <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-900 to-gray-950">
            {/* Main image skeleton with animated shimmer */}
            <Skeleton className="h-full w-full animate-pulse" />

            {/* Navigation buttons skeleton - only visible on hover in actual card */}
            <div className="absolute left-3 top-1/2 z-10 -translate-y-1/2">
              <Skeleton className="h-9 w-9 rounded-full bg-white/10" />
            </div>
            <div className="absolute right-3 top-1/2 z-10 -translate-y-1/2">
              <Skeleton className="h-9 w-9 rounded-full bg-white/10" />
            </div>

            {/* Image indicators skeleton */}
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2">
              <Skeleton className="h-1.5 w-8 rounded-full bg-white/40" />
              <Skeleton className="h-1.5 w-1.5 rounded-full bg-white/40" />
              <Skeleton className="h-1.5 w-1.5 rounded-full bg-white/40" />
            </div>

            {/* Availability badge skeleton - right side */}
            <div className="absolute right-4 top-4 z-10">
              <Skeleton className="h-8 w-24 rounded-full bg-emerald-500/20" />
            </div>

            {/* Category badge skeleton - left side */}
            <div className="absolute left-4 top-4 z-10">
              <Skeleton className="h-8 w-28 rounded-full bg-black/40" />
            </div>
          </div>

          {/* Enhanced content section - matches actual card structure */}
          <div className="flex flex-grow flex-col space-y-4 p-5">
            {/* Brand and model badges row */}
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Skeleton className="h-5 w-20 rounded-full bg-cyan-500/10" />
                <Skeleton className="h-3.5 w-14 rounded bg-white/5" />
              </div>
              {/* Equipment name - 2 lines for long names */}
              <Skeleton className="mb-2 h-6 w-full rounded" />
              <Skeleton className="h-6 w-3/4 rounded" />
            </div>

            {/* Specs grid - 2 cols then full width for fuel */}
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-9 w-full rounded-lg border border-white/5 bg-white/5" />
              <Skeleton className="h-9 w-full rounded-lg border border-white/5 bg-white/5" />
              <Skeleton className="col-span-2 h-9 w-full rounded-lg border border-white/5 bg-white/5" />
            </div>

            {/* Price section - hourly + daily */}
            <div className="mt-auto space-y-2 pt-2">
              {/* Hourly price */}
              <div className="inline-flex items-baseline gap-1 rounded-lg border border-purple-500/20 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 px-3 py-1.5">
                <Skeleton className="h-4 w-3 rounded bg-purple-400/20" />
                <Skeleton className="h-5 w-12 rounded bg-purple-400/20" />
                <Skeleton className="h-3 w-10 rounded bg-white/10" />
              </div>
              {/* Daily price - prominent */}
              <div className="inline-flex w-full items-baseline gap-1 rounded-xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-emerald-500/10 to-teal-500/10 px-4 py-2">
                <Skeleton className="h-5 w-4 rounded bg-cyan-400/20" />
                <Skeleton className="h-7 w-24 rounded bg-cyan-400/20" />
                <Skeleton className="h-4 w-10 rounded bg-white/10" />
              </div>
            </div>

            {/* Location & Rating row */}
            <div className="flex items-center justify-between border-t border-white/5 pt-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded bg-cyan-400/20" />
                <Skeleton className="h-4 w-28 rounded bg-white/10" />
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-1">
                <Skeleton className="h-4 w-4 rounded bg-amber-400/20" />
                <Skeleton className="h-4 w-8 rounded bg-amber-400/20" />
                <Skeleton className="h-3 w-8 rounded bg-white/10" />
              </div>
            </div>

            {/* Floating action buttons */}
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1 rounded-xl bg-gradient-to-r from-cyan-500/20 via-emerald-500/20 to-teal-500/20" />
              <Skeleton className="h-10 w-10 rounded-xl border border-white/10 bg-white/5" />
              <Skeleton className="h-10 w-10 rounded-xl border border-white/10 bg-white/5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EquipmentSkeleton() {
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

        {/* Category Tabs */}
        <div className="mb-6 border-b border-gray-800">
          <div className="flex gap-6 overflow-x-auto pb-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>

        {/* Main Content - Sidebar + Grid */}
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className="hidden w-72 flex-shrink-0 lg:block">
            <div className="sticky top-6 space-y-4">
              {/* Reset button */}
              <Skeleton className="h-12 w-full rounded-xl" />

              {/* Price Filter */}
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <Skeleton className="h-6 w-28" />
                  <Skeleton className="h-5 w-5" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full rounded-xl" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              </div>

              {/* Brand Filter */}
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <div className="relative mb-3">
                    <Skeleton className="h-10 w-full rounded-xl pl-10" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 rounded-lg p-2.5">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <div className="flex items-center gap-3 rounded-lg p-2.5">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                    <div className="flex items-center gap-3 rounded-lg p-2.5">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                    <div className="flex items-center gap-3 rounded-lg p-2.5">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <div className="flex items-center gap-3 rounded-lg p-2.5">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="w-18 h-5" />
                    </div>
                  </div>
                  <Skeleton className="mt-2 h-8 w-full rounded-lg" />
                </div>
              </div>
            </div>
          </aside>

          {/* Equipment Grid */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative">
                <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 opacity-0 blur-sm" />
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80">
                  <Skeleton className="h-14 w-full pl-14" />
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-4 flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-48" />
            </div>

            {/* Equipment Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <EquipmentCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer skeleton */}
      <div className="h-32 border-t border-white/10" />
    </div>
  );
}
