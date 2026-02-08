import { Skeleton } from '@/components/ui/skeleton';

export function MessagesSkeleton() {
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

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          {/* Chat List */}
          <aside className="space-y-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 opacity-0 blur-sm" />
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80">
                <Skeleton className="h-12 w-full pl-12" />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-8 w-24 rounded-lg" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>

            {/* Conversations */}
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 p-4 transition-all hover:border-white/20"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-16 flex-shrink-0" />
                      </div>
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                    <div className="flex flex-shrink-0 flex-col items-end gap-1">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-5 w-5 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Chat Window */}
          <div className="flex flex-col rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80">
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-10 w-10 rounded-xl" />
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 space-y-4 p-6">
              {/* Date Separator */}
              <div className="flex items-center justify-center">
                <Skeleton className="h-6 w-32 rounded-full" />
              </div>

              {/* Received Message */}
              <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="rounded-2xl rounded-tl-none border border-white/10 bg-white/5 p-4">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>

              {/* Sent Message */}
              <div className="flex items-start justify-end gap-3">
                <div className="space-y-2">
                  <div className="rounded-2xl rounded-tr-none border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 p-4">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Received Message */}
              <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="rounded-2xl rounded-tl-none border border-white/10 bg-white/5 p-4">
                    <Skeleton className="h-4 w-56" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>

              {/* Typing Indicator */}
              <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <div className="rounded-2xl rounded-tl-none border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-2 w-2 rounded-full" />
                    <Skeleton className="h-2 w-2 rounded-full" />
                    <Skeleton className="h-2 w-2 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Input */}
            <div className="border-t border-white/10 p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="relative flex-1">
                  <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 opacity-0 blur-sm" />
                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80">
                    <Skeleton className="h-12 w-full pl-4 pr-12" />
                  </div>
                </div>
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-10 w-10 rounded-xl" />
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
