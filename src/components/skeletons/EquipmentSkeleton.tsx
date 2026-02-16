import { Skeleton } from '@/components/ui/skeleton';

export function EquipmentCardSkeleton() {
  return (
    <div className="group overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/90 to-[#0a0a0a]/90 shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-900 to-gray-950">
        <Skeleton className="h-full w-full animate-pulse bg-gray-800/50" />
      </div>
      <div className="flex flex-col space-y-3 p-4">
        <Skeleton className="h-5 w-full rounded bg-gray-700/50" />
        <Skeleton className="h-5 w-2/3 rounded bg-gray-700/50" />
        <Skeleton className="h-7 w-24 rounded-lg bg-cyan-500/20" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-10 flex-1 rounded-xl bg-gray-700/50" />
          <Skeleton className="h-10 flex-1 rounded-xl bg-gray-700/50" />
        </div>
      </div>
    </div>
  );
}

export function EquipmentSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="sticky top-0 z-50 border-b border-gray-800/50 bg-[#0a0a0a]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4">
          <Skeleton className="h-9 w-32 rounded-lg bg-gray-800/50" />
          <div className="flex flex-1 justify-center px-8">
            <Skeleton className="h-11 w-full max-w-xl rounded-full bg-gray-800/50" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full bg-gray-800/50" />
            <Skeleton className="h-10 w-10 rounded-full bg-gray-800/50" />
          </div>
        </div>
      </header>

      <nav className="border-b border-gray-800/30 bg-[#0a0a0a]">
        <div className="mx-auto max-w-[1600px] px-4 py-4">
          <div className="flex gap-3 overflow-x-auto pb-1">
            <Skeleton className="h-10 w-28 shrink-0 rounded-full bg-gradient-to-r from-cyan-500/30 to-emerald-500/30" />
            <Skeleton className="h-10 w-24 shrink-0 rounded-full bg-gray-800/50" />
            <Skeleton className="h-10 w-32 shrink-0 rounded-full bg-gray-800/50" />
            <Skeleton className="h-10 w-20 shrink-0 rounded-full bg-gray-800/50" />
            <Skeleton className="h-10 w-28 shrink-0 rounded-full bg-gray-800/50" />
            <Skeleton className="h-10 w-24 shrink-0 rounded-full bg-gray-800/50" />
            <Skeleton className="h-10 w-32 shrink-0 rounded-full bg-gray-800/50" />
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-[1600px] px-4 py-6">
        <div className="flex gap-6">
          <aside className="hidden w-72 flex-shrink-0 lg:block">
            <div className="sticky top-24 space-y-6 rounded-2xl border border-gray-800/50 bg-[#0f0f0f] p-5">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded bg-gray-700/50" />
                <Skeleton className="h-7 w-20 rounded bg-gray-700/50" />
              </div>

              <div className="space-y-4">
                <Skeleton className="h-5 w-16 rounded bg-gray-700/50" />
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-5 w-5 rounded-sm bg-gray-700/50" />
                      <Skeleton className="h-5 w-28 rounded bg-gray-700/50" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 border-t border-gray-800/50 pt-5">
                <Skeleton className="h-5 w-24 rounded bg-gray-700/50" />
                <div className="space-y-3">
                  <div className="relative">
                    <div className="flex h-2 items-center justify-center">
                      <div className="h-1 w-full rounded-full bg-gray-700/50" />
                    </div>
                    <div className="absolute left-1/4 top-1/2 -translate-y-1/2">
                      <Skeleton className="h-4 w-4 rounded-full bg-cyan-500/30" />
                    </div>
                    <div className="absolute right-1/4 top-1/2 -translate-y-1/2">
                      <Skeleton className="h-4 w-4 rounded-full bg-cyan-500/30" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-20 rounded-lg bg-gray-800/50" />
                    <Skeleton className="h-4 w-4 rounded bg-gray-700/50" />
                    <Skeleton className="h-9 w-20 rounded-lg bg-gray-800/50" />
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t border-gray-800/50 pt-5">
                <Skeleton className="h-5 w-20 rounded bg-gray-700/50" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-9 w-20 rounded-lg bg-gray-800/50" />
                  <Skeleton className="h-9 w-24 rounded-lg bg-gray-800/50" />
                  <Skeleton className="h-9 w-16 rounded-lg bg-gray-800/50" />
                  <Skeleton className="w-22 h-9 rounded-lg bg-gray-800/50" />
                  <Skeleton className="w-18 h-9 rounded-lg bg-gray-800/50" />
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <EquipmentCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </main>

      <section className="mx-auto max-w-[1600px] px-4 py-12">
        <div className="overflow-hidden rounded-3xl border border-gray-800/50 bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f]">
          <div className="flex flex-col lg:flex-row">
            <div className="flex flex-1 flex-col justify-center p-8 lg:p-12">
              <Skeleton className="mb-4 h-12 w-3/4 rounded-lg bg-gray-700/50" />
              <Skeleton className="mb-3 h-6 w-full max-w-lg rounded bg-gray-700/50" />
              <Skeleton className="mb-6 h-6 w-2/3 max-w-md rounded bg-gray-700/50" />
              <div className="flex flex-wrap gap-4">
                <Skeleton className="h-12 w-40 rounded-xl bg-gradient-to-r from-cyan-500/30 to-emerald-500/30" />
                <Skeleton className="h-12 w-32 rounded-xl bg-gray-700/50" />
              </div>
            </div>
            <div className="flex-1 lg:p-6">
              <div className="relative h-64 w-full lg:h-full lg:min-h-[300px]">
                <Skeleton className="h-full w-full rounded-none bg-gradient-to-br from-gray-800/50 to-gray-900/50 lg:rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-800/50 bg-[#0a0a0a]">
        <div className="mx-auto max-w-[1600px] px-4 py-16">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <Skeleton className="mb-4 h-10 w-36 rounded-lg bg-gray-700/50" />
              <div className="mb-6 space-y-3">
                <Skeleton className="h-4 w-full max-w-sm rounded bg-gray-700/50" />
                <Skeleton className="h-4 w-3/4 max-w-xs rounded bg-gray-700/50" />
                <Skeleton className="h-4 w-2/3 max-w-xs rounded bg-gray-700/50" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full bg-gray-800/50" />
                <Skeleton className="h-10 w-10 rounded-full bg-gray-800/50" />
                <Skeleton className="h-10 w-10 rounded-full bg-gray-800/50" />
                <Skeleton className="h-10 w-10 rounded-full bg-gray-800/50" />
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-24 rounded bg-gray-700/50" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-28 rounded bg-gray-700/50" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-28 rounded bg-gray-700/50" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-24 rounded bg-gray-700/50" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-24 rounded bg-gray-700/50" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-28 rounded bg-gray-700/50" />
                ))}
              </div>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-800/50 pt-8 sm:flex-row">
            <Skeleton className="h-4 w-56 rounded bg-gray-700/50" />
            <div className="flex gap-6">
              <Skeleton className="h-4 w-20 rounded bg-gray-700/50" />
              <Skeleton className="h-4 w-24 rounded bg-gray-700/50" />
              <Skeleton className="h-4 w-16 rounded bg-gray-700/50" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
