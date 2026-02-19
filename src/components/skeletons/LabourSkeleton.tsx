import { Skeleton } from '@/components/ui/skeleton';

export function LabourCardSkeleton() {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[28px] border border-slate-800/60 bg-[#121826]/40 p-6 backdrop-blur-xl min-h-[420px]">
      {/* Top Section Skeleton */}
      <div className="flex items-start gap-4 mb-5">
        <Skeleton className="h-14 w-14 rounded-full bg-slate-800/50 flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-4 w-1/2 bg-slate-800/60 rounded-lg" />
            <Skeleton className="h-4 w-8 bg-slate-800/40 rounded-md" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-3 w-1/3 bg-slate-800/40 rounded-md" />
            <Skeleton className="h-1 w-1 bg-slate-800/30 rounded-full" />
            <Skeleton className="h-3 w-1/4 bg-slate-800/30 rounded-md" />
          </div>
          <div className="flex items-center gap-3 pt-1">
            <div className="space-y-1">
              <Skeleton className="h-1.5 w-10 bg-slate-800/20 rounded-full" />
              <Skeleton className="h-3 w-12 bg-slate-800/40 rounded-md" />
            </div>
            <div className="h-6 w-[1px] bg-slate-800/40" />
            <div className="space-y-1">
              <Skeleton className="h-1.5 w-10 bg-slate-800/20 rounded-full" />
              <Skeleton className="h-3 w-12 bg-slate-800/40 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Bio Section Skeleton */}
      <div className="space-y-2 mb-5">
        <Skeleton className="h-2.5 w-full bg-slate-800/20 rounded-full" />
        <Skeleton className="h-2.5 w-2/3 bg-slate-800/20 rounded-full" />
      </div>

      {/* Skills Section Skeleton */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        <Skeleton className="h-6 w-16 bg-slate-800/30 rounded-lg" />
        <Skeleton className="h-6 w-20 bg-slate-800/30 rounded-lg" />
        <Skeleton className="h-6 w-14 bg-slate-800/30 rounded-lg" />
      </div>

      <div className="flex-1" />

      {/* Bottom Section Skeleton */}
      <div className="pt-6 border-t border-slate-800/40">
        <div className="flex items-center justify-between mb-5">
          <div className="flex gap-4">
            <div className="space-y-2">
              <Skeleton className="h-1.5 w-10 bg-slate-800/20 rounded-full" />
              <Skeleton className="h-6 w-16 bg-slate-800/40 rounded-lg" />
            </div>
            <div className="w-[1px] h-8 bg-slate-800/40 self-end mb-0.5" />
            <div className="space-y-2">
              <Skeleton className="h-1.5 w-10 bg-slate-800/20 rounded-full" />
              <Skeleton className="h-6 w-16 bg-slate-800/40 rounded-lg" />
            </div>
          </div>
          <Skeleton className="h-6 w-16 bg-slate-800/30 rounded-full" />
        </div>
        <Skeleton className="h-12 w-full bg-slate-800/40 rounded-2xl" />
      </div>
    </div>
  );
}

export function LabourSkeleton() {
  return (
    <div className="min-h-screen bg-[#0B0F1A]">
      {/* Header spacer */}
      <div className="h-20" />

      <main className="mx-auto max-w-[1400px] px-8 pb-16 pt-32">
        <div className="flex gap-12">
          {/* Sidebar Skeleton */}
          <div className="hidden w-64 flex-shrink-0 space-y-12 lg:block">
            {/* Expertise Section */}
            <div>
              <Skeleton className="mb-6 h-3 w-20 bg-slate-800/40 rounded-full" />
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5 bg-slate-800/50 rounded" />
                    <Skeleton className="h-4 w-24 bg-slate-800/30 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Experience Section */}
            <div>
              <Skeleton className="mb-6 h-3 w-24 bg-slate-800/40 rounded-full" />
              <div className="flex flex-wrap gap-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-14 bg-slate-800/40 rounded-full" />
                ))}
              </div>
            </div>

            {/* Availability Section */}
            <div>
              <Skeleton className="mb-6 h-3 w-24 bg-slate-800/40 rounded-full" />
              <Skeleton className="h-12 w-full bg-slate-800/30 rounded-xl" />
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="min-w-0 flex-1">
            {/* Page Header */}
            <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Skeleton className="h-10 w-64 bg-slate-800/50 rounded-xl" />
                <Skeleton className="mt-3 h-5 w-80 bg-slate-800/30 rounded-lg" />
              </div>

              <Skeleton className="h-10 w-40 bg-slate-800/30 rounded-xl" />
            </div>

            {/* Results Grid - 2-column horizontal cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <LabourCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
