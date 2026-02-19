import { Skeleton } from '@/components/ui/skeleton';

export function RenterDashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gray-800/50 p-8">
        <div className="relative z-10 space-y-4">
          <Skeleton className="h-10 w-64 md:w-96" />
          <Skeleton className="h-6 w-full max-w-lg" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { bg: 'bg-blue-500/10', iconBg: 'bg-blue-500/20', border: 'border-blue-500/20' },
          { bg: 'bg-emerald-500/10', iconBg: 'bg-emerald-500/20', border: 'border-emerald-500/20' },
          { bg: 'bg-purple-500/10', iconBg: 'bg-purple-500/20', border: 'border-purple-500/20' },
          { bg: 'bg-orange-500/10', iconBg: 'bg-orange-500/20', border: 'border-orange-500/20' },
        ].map((colors, i) => (
          <div
            key={i}
            className={`rounded-2xl border ${colors.border} ${colors.bg} p-6 backdrop-blur-sm`}
          >
            <div className="flex items-center gap-4">
              <Skeleton className={`h-12 w-12 rounded-xl ${colors.iconBg}`} />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 bg-white/10" />
                <Skeleton className="h-8 w-20 bg-white/20" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Skeleton className="h-14 w-full rounded-2xl" />
      </div>

      {/* Quick Actions */}
      <div>
        <Skeleton className="mb-6 h-8 w-48" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-[4/3] rounded-2xl bg-gray-800/50 p-6">
              <Skeleton className="mb-4 h-12 w-12 rounded-xl" />
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Bookings & Recommendations Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Bookings */}
        <div className="rounded-3xl bg-gray-800/50 p-6">
          <div className="mb-6 flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4 rounded-xl bg-gray-900/50 p-4">
                <Skeleton className="h-16 w-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Featured Equipment */}
        <div className="rounded-3xl bg-gray-800/50 p-6">
          <div className="mb-6 flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl bg-gray-900/50">
                <Skeleton className="aspect-video w-full" />
                <div className="space-y-2 p-4">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProviderDashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gray-800/50 p-8">
        <div className="relative z-10 space-y-4">
          <Skeleton className="h-10 w-64 md:w-96" />
          <Skeleton className="h-6 w-full max-w-lg" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { bg: 'bg-cyan-500/10', iconBg: 'bg-cyan-500/20', border: 'border-cyan-500/20' },
          { bg: 'bg-emerald-500/10', iconBg: 'bg-emerald-500/20', border: 'border-emerald-500/20' },
          { bg: 'bg-pink-500/10', iconBg: 'bg-pink-500/20', border: 'border-pink-500/20' },
          { bg: 'bg-amber-500/10', iconBg: 'bg-amber-500/20', border: 'border-amber-500/20' },
        ].map((colors, i) => (
          <div
            key={i}
            className={`rounded-2xl border ${colors.border} ${colors.bg} p-6 backdrop-blur-sm`}
          >
            <div className="flex items-center gap-4">
              <Skeleton className={`h-12 w-12 rounded-xl ${colors.iconBg}`} />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 bg-white/10" />
                <Skeleton className="h-8 w-20 bg-white/20" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Pending Equipment Requests */}
        <div className="rounded-3xl bg-gray-800/50 p-6">
          <div className="mb-6 flex items-center justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4 rounded-xl bg-gray-900/50 p-4">
                <div className="flex gap-4">
                  <Skeleton className="h-16 w-16 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-10 flex-1 rounded-lg" />
                  <Skeleton className="h-10 flex-1 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Labour Requests */}
        <div className="rounded-3xl bg-gray-800/50 p-6">
          <div className="mb-6 flex items-center justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4 rounded-xl bg-gray-900/50 p-4">
                <div className="flex gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-10 flex-1 rounded-lg" />
                  <Skeleton className="h-10 flex-1 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* My Equipment Grid */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-4 rounded-2xl bg-gray-800/50 p-4">
              <Skeleton className="aspect-[4/3] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-9 flex-1 rounded-lg" />
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LabourDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Welcome Banner - Enhanced gradient with decorative elements */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700 p-8 shadow-2xl">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-2xl bg-white/20" />
              <Skeleton className="h-10 w-80 bg-white/20" />
            </div>
            <Skeleton className="h-5 w-96 bg-white/15" />

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-11 w-32 rounded-lg bg-emerald-500/30" />
              <Skeleton className="h-11 w-40 rounded-lg bg-white/10 backdrop-blur-sm" />
            </div>
          </div>

          {/* Decorative icon on right */}
          <Skeleton className="hidden h-32 w-32 rounded-full bg-white/10 md:block" />
        </div>
      </div>

      {/* Stats Grid - Enhanced with colored icon backgrounds */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { bg: 'bg-blue-500/10', iconBg: 'bg-blue-500/20' },
          { bg: 'bg-emerald-500/10', iconBg: 'bg-emerald-500/20' },
          { bg: 'bg-pink-500/10', iconBg: 'bg-pink-500/20' },
          { bg: 'bg-orange-500/10', iconBg: 'bg-orange-500/20' },
        ].map((colors, i) => (
          <div
            key={i}
            className={`relative overflow-hidden rounded-2xl border border-slate-800 ${colors.bg} p-6 backdrop-blur-sm`}
          >
            {/* Trend indicator */}
            <div className="absolute right-4 top-4">
              <Skeleton className="h-5 w-16 rounded bg-emerald-400/20" />
            </div>

            <div className="space-y-4">
              <Skeleton className={`h-14 w-14 rounded-2xl ${colors.iconBg}`} />
              <div className="space-y-2">
                <Skeleton className="h-8 w-20 bg-white/20" />
                <Skeleton className="h-4 w-24 bg-white/10" />
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between border-t border-slate-700/50 pt-3">
              <Skeleton className="h-3 w-20 bg-slate-400/20" />
              <Skeleton className="h-4 w-4 bg-slate-400/20" />
            </div>
          </div>
        ))}
      </div>

      {/* Pending Job Requests Section */}
      <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-2xl bg-orange-500/20" />
            <Skeleton className="h-7 w-48 bg-white/10" />
          </div>
          <Skeleton className="h-6 w-24 bg-cyan-400/20" />
        </div>

        {/* Empty state */}
        <div className="flex min-h-[300px] flex-col items-center justify-center space-y-3 rounded-2xl border-2 border-dashed border-slate-700/50 bg-slate-800/30 p-8">
          <Skeleton className="h-20 w-20 rounded-full bg-slate-700/50" />
          <Skeleton className="h-5 w-48 bg-slate-600/30" />
          <Skeleton className="h-4 w-56 bg-slate-600/20" />
        </div>
      </div>

      {/* Upcoming Jobs Section */}
      <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-2xl bg-emerald-500/20" />
            <Skeleton className="h-7 w-40 bg-white/10" />
          </div>
          <Skeleton className="h-6 w-32 bg-cyan-400/20" />
        </div>

        {/* Empty state */}
        <div className="flex min-h-[300px] flex-col items-center justify-center space-y-3 rounded-2xl border-2 border-dashed border-slate-700/50 bg-slate-800/30 p-8">
          <Skeleton className="h-20 w-20 rounded-full bg-slate-700/50" />
          <Skeleton className="h-5 w-44 bg-slate-600/30" />
          <Skeleton className="h-4 w-64 bg-slate-600/20" />
        </div>
      </div>

      {/* Quick Action Cards Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { bg: 'bg-blue-500/10', iconBg: 'bg-blue-500/20' },
          { bg: 'bg-pink-500/10', iconBg: 'bg-pink-500/20' },
          { bg: 'bg-orange-500/10', iconBg: 'bg-orange-500/20' },
          { bg: 'bg-emerald-500/10', iconBg: 'bg-emerald-500/20' },
        ].map((colors, i) => (
          <div
            key={i}
            className={`rounded-2xl border border-slate-800 ${colors.bg} p-6 backdrop-blur-sm transition-all hover:scale-105`}
          >
            <div className="space-y-4">
              <Skeleton className={`h-16 w-16 rounded-2xl ${colors.iconBg}`} />
              <Skeleton className="h-6 w-32 bg-white/20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return <RenterDashboardSkeleton />;
}
