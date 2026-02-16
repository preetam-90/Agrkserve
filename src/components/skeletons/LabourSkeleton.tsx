import { Skeleton } from '@/components/ui/skeleton';

const SKILL_TAG_WIDTHS = [60, 72, 84, 96, 68, 92, 76, 88];

export function LabourCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm">
      {/* Profile Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Skeleton className="h-full w-full bg-slate-800" />
        {/* Availability badge */}
        <div className="absolute left-3 top-3">
          <Skeleton className="h-7 w-24 rounded-md bg-emerald-600/20" />
        </div>
        {/* Rating badge */}
        <div className="absolute right-3 top-3">
          <Skeleton className="h-7 w-14 rounded-md bg-slate-700/50" />
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5">
        {/* Name + Location */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-36 bg-white/10" />
            <Skeleton className="h-5 w-5 rounded-full bg-emerald-500/20" />
          </div>
          <div className="mt-1.5 flex items-center gap-1">
            <Skeleton className="h-3.5 w-3.5 rounded-full bg-emerald-500/10" />
            <Skeleton className="h-3.5 w-28 bg-white/5" />
          </div>
        </div>

        {/* Stats Row */}
        <div className="mb-4 grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="mb-1 h-2.5 w-14 bg-slate-500/20" />
              <Skeleton className="h-4 w-16 bg-white/10" />
            </div>
          ))}
        </div>

        {/* Skill Tags */}
        <div className="mb-5 flex flex-wrap gap-1.5">
          <Skeleton className="h-7 w-24 rounded-md bg-slate-800/50" />
          <Skeleton className="h-7 w-20 rounded-md bg-slate-800/50" />
          <Skeleton className="h-7 w-16 rounded-md bg-slate-800/50" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5">
          <Skeleton className="h-10 flex-1 rounded-lg bg-emerald-600/20" />
          <Skeleton className="h-10 flex-1 rounded-lg border border-slate-700 bg-transparent" />
        </div>
      </div>
    </div>
  );
}

export function LabourSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header skeleton */}
      <div className="h-20 border-b border-slate-800" />

      <main className="mx-auto max-w-[1400px] px-4 pb-16 pt-24">
        <div className="flex gap-8">
          {/* Sidebar skeleton */}
          <div className="hidden w-64 flex-shrink-0 space-y-7 lg:block">
            {/* Availability */}
            <div>
              <Skeleton className="mb-3 h-3 w-20 bg-emerald-500/20" />
              <div className="space-y-2.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2.5 px-1">
                    <Skeleton className="h-5 w-5 rounded-md bg-slate-800" />
                    <Skeleton className="h-4 w-24 bg-white/5" />
                  </div>
                ))}
              </div>
            </div>
            {/* Skills */}
            <div>
              <Skeleton className="mb-3 h-3 w-28 bg-emerald-500/20" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-8 rounded-lg bg-slate-800/50"
                    style={{ width: `${SKILL_TAG_WIDTHS[i]}px` }}
                  />
                ))}
              </div>
            </div>
            {/* Price Range */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <Skeleton className="h-3 w-20 bg-emerald-500/20" />
                <Skeleton className="h-3 w-32 bg-white/5" />
              </div>
              <Skeleton className="h-2 w-full rounded-full bg-slate-800" />
            </div>
            {/* Experience */}
            <div>
              <Skeleton className="mb-3 h-3 w-20 bg-emerald-500/20" />
              <Skeleton className="h-10 w-full rounded-md border border-slate-700 bg-slate-800/50" />
            </div>
          </div>

          {/* Main Content */}
          <div className="min-w-0 flex-1">
            {/* Top bar */}
            <div className="mb-6 flex items-center justify-between">
              <Skeleton className="h-8 w-64 bg-white/10" />
              <Skeleton className="h-10 w-44 rounded-md bg-slate-800/50" />
            </div>

            {/* Search bar */}
            <Skeleton className="mb-6 h-12 w-full rounded-xl border border-slate-800 bg-slate-900/80" />

            {/* Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <LabourCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
