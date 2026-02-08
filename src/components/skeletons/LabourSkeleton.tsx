import { Skeleton } from '@/components/ui/skeleton';

export function LabourCardSkeleton() {
  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm transition-all duration-300">
      {/* Profile Header - gradient background like actual card */}
      <div className="relative h-32 bg-gradient-to-br from-emerald-900/50 via-slate-900 to-slate-900">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-slate-900/90 to-transparent" />
      </div>

      <div className="relative -mt-16 px-6">
        <div className="flex items-end justify-between">
          {/* Avatar with availability indicator */}
          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border-4 border-slate-900 shadow-xl">
            <Skeleton className="h-full w-full bg-slate-800" />
            {/* Availability dot */}
            <div className="absolute bottom-2 right-2 h-4 w-4 rounded-full border-2 border-slate-900 bg-emerald-500/50" />
          </div>

          {/* Availability badge */}
          <div className="mb-1">
            <Skeleton className="h-7 w-20 rounded-md bg-emerald-500/10" />
          </div>
        </div>

        {/* Name and Rating */}
        <div className="mt-4 space-y-2">
          <Skeleton className="h-6 w-32 bg-white/10" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-16 rounded-full bg-yellow-500/10" />
            <Skeleton className="h-5 w-20 bg-white/10" />
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="space-y-5 p-6">
        {/* Location & Experience Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg bg-slate-800" />
            <Skeleton className="h-4 w-20 bg-white/10" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg bg-slate-800" />
            <Skeleton className="h-4 w-16 bg-white/10" />
          </div>
        </div>

        {/* Skills Section */}
        <div>
          <Skeleton className="mb-2 h-3 w-12 bg-slate-500/20" />
          <div className="flex flex-wrap gap-1.5">
            <Skeleton className="h-6 w-24 rounded-md bg-slate-800/50" />
            <Skeleton className="h-6 w-32 rounded-md bg-slate-800/50" />
            <Skeleton className="h-6 w-20 rounded-md bg-slate-800/50" />
            <Skeleton className="h-6 w-12 rounded-md bg-slate-800/50" />
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full bg-white/10" />
          <Skeleton className="h-4 w-4/5 bg-white/10" />
        </div>

        {/* Pricing Section */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <div className="space-y-1">
            <Skeleton className="h-7 w-24 bg-emerald-400/20" />
            <Skeleton className="h-3 w-16 bg-slate-500/20" />
          </div>
          <div className="space-y-1 text-right">
            <Skeleton className="h-6 w-20 bg-slate-300/20" />
            <Skeleton className="h-3 w-16 bg-slate-500/20" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-9 flex-1 rounded-md border border-slate-700 bg-transparent" />
          <Skeleton className="h-9 flex-1 rounded-md bg-emerald-600/20" />
        </div>
      </div>
    </div>
  );
}

export function LabourSkeleton() {
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

        {/* Labour Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 transition-all hover:border-white/20"
            >
              {/* Profile Image */}
              <div className="relative aspect-square overflow-hidden">
                <Skeleton className="h-full w-full" />
                <div className="absolute left-3 top-3 flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <div className="absolute right-3 top-3 flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4 p-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-10 w-24 rounded-xl" />
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
