import { Skeleton } from '@/components/ui/skeleton';

export function EquipmentDetailSkeleton() {
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
            {/* Image Gallery */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 p-6">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="relative aspect-square">
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
                <div className="grid gap-4">
                  <div className="relative aspect-square">
                    <Skeleton className="h-full w-full" />
                    <div className="absolute right-2 top-2">
                      <Skeleton className="h-6 w-6 rounded-full" />
                    </div>
                  </div>
                  <div className="relative aspect-square">
                    <Skeleton className="h-full w-full" />
                    <div className="absolute right-2 top-2">
                      <Skeleton className="h-6 w-6 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info */}
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

            {/* Specs */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 p-6">
              <div className="mb-4 flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-7 w-24" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 rounded-lg border border-cyan-500/10 bg-cyan-500/5 px-4 py-3 backdrop-blur-sm">
                  <Skeleton className="h-4 w-16 bg-cyan-500/20" />
                  <Skeleton className="h-5 w-20 bg-cyan-500/30" />
                </div>
                <div className="space-y-2 rounded-lg border border-emerald-500/10 bg-emerald-500/5 px-4 py-3 backdrop-blur-sm">
                  <Skeleton className="h-4 w-20 bg-emerald-500/20" />
                  <Skeleton className="h-5 w-24 bg-emerald-500/30" />
                </div>
                <div className="space-y-2 rounded-lg border border-purple-500/10 bg-purple-500/5 px-4 py-3 backdrop-blur-sm">
                  <Skeleton className="h-4 w-24 bg-purple-500/20" />
                  <Skeleton className="h-5 w-28 bg-purple-500/30" />
                </div>
                <div className="space-y-2 rounded-lg border border-blue-500/10 bg-blue-500/5 px-4 py-3 backdrop-blur-sm">
                  <Skeleton className="h-4 w-20 bg-blue-500/20" />
                  <Skeleton className="h-5 w-16 bg-blue-500/30" />
                </div>
                <div className="space-y-2 rounded-lg border border-orange-500/10 bg-orange-500/5 px-4 py-3 backdrop-blur-sm">
                  <Skeleton className="h-4 w-16 bg-orange-500/20" />
                  <Skeleton className="h-5 w-20 bg-orange-500/30" />
                </div>
                <div className="space-y-2 rounded-lg border border-pink-500/10 bg-pink-500/5 px-4 py-3 backdrop-blur-sm">
                  <Skeleton className="h-4 w-20 bg-pink-500/20" />
                  <Skeleton className="h-5 w-24 bg-pink-500/30" />
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 p-6">
              <div className="mb-4 flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-7 w-28" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 px-4 py-3"
                  >
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
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

            {/* Provider Contact */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 p-6">
              <div className="mb-4 flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-7 w-28" />
              </div>
              <div className="mb-4 flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 p-4">
                <div className="relative">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <div className="space-y-3">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
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
