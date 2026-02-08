import { Skeleton } from '@/components/ui/skeleton';

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
      {/* Header skeleton */}
      <div className="h-20 border-b border-white/10" />

      <main className="mx-auto max-w-[1600px] px-4 pb-8 pt-28">
        {/* Back Button */}
        <div className="mb-4">
          <Skeleton className="h-8 w-24" />
        </div>

        {/* Cover Image */}
        <div className="mb-16 h-48 overflow-hidden rounded-2xl">
          <Skeleton className="h-full w-full" />
          <div className="absolute right-4 top-4 flex gap-2">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        </div>

        {/* Profile Header */}
        <div className="-mt-20 mb-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end">
            <div className="relative">
              <Skeleton className="h-32 w-32 rounded-full border-4 border-[#0a0a0a] bg-gradient-to-br from-cyan-500/20 to-purple-500/20" />
              <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full border-2 border-[#0a0a0a] bg-gradient-to-br from-cyan-400 to-emerald-400 shadow-lg shadow-cyan-500/50" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-64" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-24 rounded-full bg-cyan-500/20" />
                <Skeleton className="h-6 w-28 rounded-full bg-emerald-500/20" />
                <Skeleton className="h-6 w-20 rounded-full bg-purple-500/20" />
                <Skeleton className="h-6 w-24 rounded-full bg-blue-500/20" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-28 rounded-xl" />
              <Skeleton className="h-10 w-28 rounded-xl" />
              <Skeleton className="h-10 w-28 rounded-xl" />
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

        {/* Content */}
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Main Content */}
          <div className="space-y-6">
            {/* About */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 p-6">
              <div className="mb-4 flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-7 w-24" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-5/6" />
              </div>
            </div>

            {/* Equipment */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-7 w-32" />
                </div>
                <Skeleton className="h-10 w-28 rounded-xl" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 transition-all hover:border-white/20"
                  >
                    <div className="relative mb-3 aspect-square">
                      <Skeleton className="h-full w-full" />
                      <div className="absolute left-2 top-2 flex gap-2">
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                      <div className="absolute right-2 top-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    </div>
                    <div className="space-y-2 p-3">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
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

            {/* Location */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 p-6">
              <div className="mb-4 flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-7 w-24" />
              </div>
              <div className="aspect-video rounded-xl">
                <Skeleton className="h-full w-full" />
              </div>
              <div className="mt-3 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 p-6">
              <div className="mb-4 flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-7 w-28" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
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
