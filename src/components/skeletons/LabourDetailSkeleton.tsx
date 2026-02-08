import { Skeleton } from '@/components/ui/skeleton';

export function LabourDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
      {/* Header skeleton */}
      <div className="h-20 border-b border-white/10" />

      <main className="mx-auto max-w-[1600px] px-4 pb-8 pt-28">
        {/* Back Button */}
        <div className="mb-4">
          <Skeleton className="h-8 w-24" />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Header Card */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 p-6">
              <div className="flex flex-col gap-6 md:flex-row">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <Skeleton className="h-32 w-32 rounded-full bg-gradient-to-br from-cyan-500/20 to-emerald-500/20" />
                    <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full border-2 border-[#1a1a1a] bg-gradient-to-br from-cyan-400 to-emerald-400 shadow-lg shadow-emerald-500/50" />
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
                  <div className="flex flex-wrap gap-3">
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

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 p-4"
                >
                  <Skeleton className="mb-2 h-4 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-800">
              <div className="flex gap-6 overflow-x-auto pb-2">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>

            {/* Description */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 p-6">
              <div className="mb-4 flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-7 w-32" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-5/6" />
              </div>
            </div>

            {/* Skills */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 p-6">
              <div className="mb-4 flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-7 w-24" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-8 w-24 rounded-full bg-cyan-500/20" />
                <Skeleton className="h-8 w-28 rounded-full bg-emerald-500/20" />
                <Skeleton className="h-8 w-32 rounded-full bg-purple-500/20" />
                <Skeleton className="h-8 w-24 rounded-full bg-blue-500/20" />
                <Skeleton className="h-8 w-28 rounded-full bg-orange-500/20" />
                <Skeleton className="h-8 w-32 rounded-full bg-pink-500/20" />
              </div>
            </div>

            {/* Reviews */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-7 w-32" />
                </div>
                <Skeleton className="h-10 w-28 rounded-xl" />
              </div>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-white/5 bg-white/5 p-4">
                    <div className="mb-3 flex items-start gap-3">
                      <div className="relative">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <div className="sticky top-6 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 p-6">
              <Skeleton className="mb-4 h-7 w-24" />
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-4 py-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-4 py-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-4 py-3">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-6 w-28" />
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            </div>

            {/* Contact Info */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 p-6">
              <div className="mb-4 flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-7 w-28" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 px-4 py-3">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 px-4 py-3">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 px-4 py-3">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 p-6">
              <div className="mb-4 flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-7 w-28" />
              </div>
              <div className="space-y-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-4 py-2"
                  >
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer skeleton */}
      <div className="h-32 border-t border-white/10" />
    </div>
  );
}
