import { Skeleton } from '@/components/ui/skeleton';

export function SettingsSkeleton() {
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

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Sidebar */}
          <aside className="space-y-2">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="mb-2 h-12 w-full rounded-xl" />
              ))}
            </div>

            {/* Quick Stats */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 p-4">
              <Skeleton className="mb-4 h-6 w-24" />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-12" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-12" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-12" />
                </div>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="space-y-6">
            {/* Profile Section */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 p-6">
              <div className="mb-6 flex items-center justify-between">
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-10 w-28 rounded-xl" />
              </div>
              <div className="space-y-6">
                {/* Profile Picture Section */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Skeleton className="h-24 w-24 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20" />
                    <div className="absolute -bottom-2 -right-2 h-9 w-9 rounded-full border-2 border-[#1a1a1a] bg-gradient-to-br from-cyan-400 to-emerald-400" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-32 rounded-xl bg-gradient-to-r from-cyan-500/20 to-cyan-500/10" />
                    <Skeleton className="h-4 w-48 bg-white/10" />
                  </div>
                </div>
                {/* Form Fields with colored focus states */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20 bg-white/10" />
                    <Skeleton className="h-12 w-full rounded-xl border border-cyan-500/10 bg-cyan-500/5" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20 bg-white/10" />
                    <Skeleton className="h-12 w-full rounded-xl border border-emerald-500/10 bg-emerald-500/5" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20 bg-white/10" />
                    <Skeleton className="h-12 w-full rounded-xl border border-purple-500/10 bg-purple-500/5" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20 bg-white/10" />
                    <Skeleton className="h-12 w-full rounded-xl border border-blue-500/10 bg-blue-500/5" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 bg-white/10" />
                  <Skeleton className="h-32 w-full rounded-xl border border-white/10 bg-white/5" />
                </div>
              </div>
            </div>

            {/* Notifications Section */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 p-6">
              <div className="mb-6 flex items-center justify-between">
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-10 w-28 rounded-xl" />
              </div>
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm"
                  >
                    <div className="space-y-1">
                      <Skeleton className="h-5 w-36 bg-white/20" />
                      <Skeleton className="h-4 w-64 bg-white/10" />
                    </div>
                    <Skeleton className="h-6 w-12 rounded-full bg-cyan-400/20" />
                  </div>
                ))}
              </div>
            </div>

            {/* Security Section */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 p-6">
              <div className="mb-6 flex items-center justify-between">
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-10 w-28 rounded-xl" />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-32 rounded-xl" />
                  <Skeleton className="h-10 w-32 rounded-xl" />
                </div>
              </div>
            </div>

            {/* Privacy Section */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 p-6">
              <div className="mb-6 flex items-center justify-between">
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-10 w-28 rounded-xl" />
              </div>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4"
                  >
                    <div className="space-y-1">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-6 w-12" />
                  </div>
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent p-6">
              <Skeleton className="mb-4 h-7 w-32" />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <Skeleton className="h-10 w-32 rounded-xl border border-red-500/30 bg-red-500/10" />
                </div>
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
