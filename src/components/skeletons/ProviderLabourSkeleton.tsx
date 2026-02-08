import { Skeleton } from '@/components/ui/skeleton';

export function ProviderLabourSkeleton() {
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

        {/* Profile Hero Card */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 p-6">
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="flex-shrink-0">
              <div className="relative">
                <Skeleton className="h-32 w-32 rounded-full" />
                <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400" />
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-28 rounded-xl" />
                  <Skeleton className="h-10 w-28 rounded-xl" />
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { bg: 'bg-blue-500/10', border: 'border-blue-500/20', iconBg: 'bg-blue-500/20' },
            {
              bg: 'bg-emerald-500/10',
              border: 'border-emerald-500/20',
              iconBg: 'bg-emerald-500/20',
            },
            { bg: 'bg-purple-500/10', border: 'border-purple-500/20', iconBg: 'bg-purple-500/20' },
            { bg: 'bg-pink-500/10', border: 'border-pink-500/20', iconBg: 'bg-pink-500/20' },
          ].map((colors, i) => (
            <div
              key={i}
              className={`rounded-xl border ${colors.border} ${colors.bg} p-4 backdrop-blur-sm`}
            >
              <div className="space-y-2">
                <Skeleton className={`h-10 w-10 rounded-xl ${colors.iconBg} animate-pulse`} />
                <Skeleton className="h-4 w-24 animate-pulse bg-white/10" />
                <Skeleton className="h-7 w-20 animate-pulse bg-white/20" />
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
          </div>
        </div>

        {/* Bookings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-32 rounded-xl" />
              <Skeleton className="h-10 w-32 rounded-xl" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 p-5 transition-all hover:border-white/20"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400" />
                    </div>
                    <div className="space-y-1">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-10 w-24 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
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
