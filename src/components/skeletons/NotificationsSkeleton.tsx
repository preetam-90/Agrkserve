import { Skeleton } from '@/components/ui/skeleton';

export function NotificationsSkeleton() {
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

        {/* Notification Filters */}
        <div className="mb-6 border-b border-gray-800">
          <div className="flex gap-6 overflow-x-auto pb-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 flex items-center gap-3">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="ml-auto h-10 w-32 rounded-xl" />
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {/* Today Section */}
          <div className="mb-6">
            <Skeleton className="mb-4 h-6 w-24" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 p-5 transition-all hover:border-cyan-500/20"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <Skeleton className="h-14 w-14 rounded-full bg-gradient-to-br from-cyan-500/20 to-emerald-500/20" />
                      <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-[#1a1a1a] bg-gradient-to-br from-cyan-400 to-emerald-400" />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <Skeleton className="h-5 w-3/4 bg-white/20" />
                          <Skeleton className="h-4 w-full bg-white/10" />
                          <Skeleton className="h-4 w-2/3 bg-white/10" />
                        </div>
                        <Skeleton className="h-4 w-20 flex-shrink-0 bg-white/10" />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-2">
                        <Skeleton className="h-9 w-24 rounded-lg bg-gradient-to-r from-cyan-500/20 to-cyan-500/10" />
                        <Skeleton className="h-9 w-24 rounded-lg bg-white/5 backdrop-blur-sm" />
                      </div>
                    </div>

                    {/* Unread Indicator */}
                    <div className="mt-2 flex-shrink-0">
                      <Skeleton className="h-3 w-3 rounded-full bg-cyan-400/50" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Yesterday Section */}
          <div className="mb-6">
            <Skeleton className="mb-4 h-6 w-28" />
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 p-5 transition-all hover:border-white/20"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      <Skeleton className="h-14 w-14 rounded-full" />
                      <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                        <Skeleton className="h-4 w-20" />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-2">
                        <Skeleton className="h-8 w-24 rounded-lg" />
                        <Skeleton className="h-8 w-24 rounded-lg" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Earlier Section */}
          <div>
            <Skeleton className="mb-4 h-6 w-24" />
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 p-5 transition-all hover:border-white/20"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      <Skeleton className="h-14 w-14 rounded-full" />
                      <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                        <Skeleton className="h-4 w-20" />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-2">
                        <Skeleton className="h-8 w-24 rounded-lg" />
                        <Skeleton className="h-8 w-24 rounded-lg" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
