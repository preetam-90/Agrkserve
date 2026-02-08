import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function GallerySkeleton() {
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

        {/* Category Tabs */}
        <div className="mb-6 border-b border-gray-800">
          <div className="flex gap-6 overflow-x-auto pb-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative max-w-md flex-1">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 opacity-0 blur-sm" />
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80">
                <Skeleton className="h-14 w-full pl-14" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-32 rounded-xl" />
              <Skeleton className="h-10 w-32 rounded-xl" />
              <Skeleton className="h-10 w-32 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Gallery Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', iconBg: 'bg-cyan-500/20' },
            { bg: 'bg-purple-500/10', border: 'border-purple-500/20', iconBg: 'bg-purple-500/20' },
            { bg: 'bg-pink-500/10', border: 'border-pink-500/20', iconBg: 'bg-pink-500/20' },
          ].map((colors, i) => (
            <div
              key={i}
              className={`rounded-xl border ${colors.border} ${colors.bg} p-4 backdrop-blur-sm`}
            >
              <div className="space-y-2">
                <Skeleton className={`h-8 w-8 rounded-lg ${colors.iconBg} animate-pulse`} />
                <Skeleton className="h-4 w-24 animate-pulse bg-white/10" />
                <Skeleton className="h-6 w-16 animate-pulse bg-white/20" />
              </div>
            </div>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80',
                i % 2 === 0 ? 'aspect-[3/4]' : 'aspect-[4/3]'
              )}
            >
              {/* Image */}
              <Skeleton className="h-full w-full" />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                <div className="absolute bottom-0 left-0 right-0 space-y-2 p-4">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex items-center gap-2 pt-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="absolute left-3 top-3 flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>

              {/* Actions */}
              <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          ))}
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
