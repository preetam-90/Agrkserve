import { Skeleton } from '@/components/ui/skeleton';

export function AdminAnalyticsSkeleton() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="mb-4 flex flex-col justify-between gap-3 sm:mb-5 md:mb-6 md:flex-row md:items-center">
          <div>
            <Skeleton className="h-8 w-64 bg-slate-800" />
            <Skeleton className="mt-1 h-4 w-96 bg-slate-800" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-10 w-32 bg-slate-800" />
            <Skeleton className="h-10 w-24 bg-slate-800" />
          </div>
        </div>

        {/* Metrics Grid - 4 cards */}
        <div className="mb-4 grid gap-2.5 sm:mb-5 sm:grid-cols-2 sm:gap-3 md:mb-6 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm"
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-24 bg-slate-800" />
                  <Skeleton className="h-8 w-8 rounded-lg bg-slate-800" />
                </div>
                <Skeleton className="mt-3 h-8 w-32 bg-slate-800" />
                <Skeleton className="mt-2 h-3 w-28 bg-slate-800" />
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="mb-4 grid gap-3 sm:mb-5 sm:gap-4 md:mb-6 lg:grid-cols-3">
          {/* Revenue Chart - 2/3 width */}
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 lg:col-span-2">
            <div className="border-b border-slate-800/50 p-6">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-lg bg-slate-800" />
                <div>
                  <Skeleton className="h-5 w-40 bg-slate-800" />
                  <Skeleton className="mt-1 h-3 w-24 bg-slate-800" />
                </div>
              </div>
              <Skeleton className="mt-3 h-8 w-32 bg-slate-800" />
            </div>
            <div className="p-6">
              <Skeleton className="h-[240px] w-full bg-slate-800" />
            </div>
          </div>

          {/* Platform Overview - 1/3 width */}
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
            <div className="p-6">
              <Skeleton className="h-5 w-40 bg-slate-800" />
              <Skeleton className="mt-1 h-3 w-24 bg-slate-800" />
            </div>
            <div className="px-6 pb-6">
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="rounded-lg bg-slate-800/30 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-md bg-slate-800" />
                        <Skeleton className="h-4 w-20 bg-slate-800" />
                      </div>
                      <Skeleton className="h-6 w-12 bg-slate-800" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50"
            >
              <div className="p-6">
                <Skeleton className="h-5 w-32 bg-slate-800" />
                <Skeleton className="mt-1 h-3 w-24 bg-slate-800" />
              </div>
              <div className="px-6 pb-6">
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <Skeleton key={j} className="h-16 w-full rounded-lg bg-slate-800/30" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
