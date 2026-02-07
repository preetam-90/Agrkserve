/**
 * Next.js loading.tsx — shown instantly on navigation to /provider/labour
 * while the page component loads and fetches data.
 */
export default function ProviderLabourLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header skeleton */}
      <div className="h-20 animate-pulse border-b border-white/5 bg-white/5" />

      <main className="mx-auto max-w-6xl flex-1 px-4 pb-4 pt-28 transition-all duration-300 lg:px-8 lg:pb-8">
        {/* Page title skeleton */}
        <div className="mb-2 h-8 w-56 animate-pulse rounded-lg bg-white/5" />
        <div className="mb-8 h-4 w-80 animate-pulse rounded bg-white/5" />

        {/* Labour profile card skeleton */}
        <div className="mb-8 h-48 animate-pulse rounded-xl bg-white/5" />

        {/* Stats grid skeleton */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>

        {/* Bookings list skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      </main>
    </div>
  );
}
