/**
 * Next.js loading.tsx — shown instantly on navigation to /settings
 * while the page component loads and fetches data.
 */
export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header skeleton */}
      <div className="h-20 animate-pulse border-b border-white/5 bg-white/5" />

      <main className="mx-auto max-w-4xl flex-1 px-4 pb-4 pt-28 transition-all duration-300 lg:px-8 lg:pb-8">
        {/* Page title skeleton */}
        <div className="mb-2 h-8 w-32 animate-pulse rounded-lg bg-white/5" />
        <div className="mb-8 h-4 w-64 animate-pulse rounded bg-white/5" />

        {/* Tab navigation skeleton */}
        <div className="mb-8 flex gap-4 border-b border-white/10 pb-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-9 w-28 animate-pulse rounded-md bg-white/5" />
          ))}
        </div>

        {/* Form fields skeleton */}
        <div className="space-y-6">
          {/* Avatar + name section */}
          <div className="mb-8 flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 animate-pulse rounded-full bg-white/5" />
            <div className="space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-white/5" />
              <div className="h-3 w-48 animate-pulse rounded bg-white/5" />
            </div>
          </div>

          {/* Form rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-white/5" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-white/5" />
            </div>
          ))}

          {/* Save button */}
          <div className="mt-8 h-10 w-32 animate-pulse rounded-lg bg-white/5" />
        </div>
      </main>
    </div>
  );
}
