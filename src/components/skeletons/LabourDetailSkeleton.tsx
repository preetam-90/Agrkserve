import { Skeleton } from '@/components/ui/skeleton';

export function LabourDetailSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950">
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex flex-col gap-6 md:flex-row">
              <Skeleton className="h-32 w-32 shrink-0 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-5 w-64" />
                <Skeleton className="h-4 w-80" />
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                  <Skeleton className="mb-2 h-5 w-5 rounded-full" />
                  <Skeleton className="mb-2 h-3 w-16" />
                  <Skeleton className="h-6 w-24" />
                </div>
              ))}
            </div>

            {/* Tabs Area */}
            <div className="space-y-4">
              <div className="flex gap-4 border-b border-slate-800 pb-2">
                <Skeleton className="h-10 w-16" />
                <Skeleton className="h-10 w-16" />
                <Skeleton className="h-10 w-16" />
              </div>
              <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-11/12" />
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-5 w-5/6" />
                <Skeleton className="h-5 w-3/4" />
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                  <Skeleton className="mb-4 h-5 w-24" />
                  <Skeleton className="mb-2 h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>

            {/* Service Location */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <Skeleton className="mb-4 h-6 w-40" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <div className="sticky top-6 space-y-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              {/* Rate */}
              <Skeleton className="h-10 w-32" />

              {/* Badge */}
              <Skeleton className="h-6 w-24 rounded-full" />

              {/* Date Input */}
              <Skeleton className="h-12 w-full rounded-xl" />

              {/* Workers Dropdown */}
              <Skeleton className="h-12 w-full rounded-xl" />

              {/* Price Breakdown */}
              <div className="space-y-3 border-t border-slate-800 pt-4">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>

              {/* Book Now Button */}
              <Skeleton className="h-14 w-full rounded-xl" />

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-4 pt-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
