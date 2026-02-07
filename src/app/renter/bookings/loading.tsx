/**
 * Next.js loading.tsx — shown instantly on navigation to /renter/bookings
 * while the page component loads and fetches data.
 */
export default function RenterBookingsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header skeleton */}
      <div className="h-20 animate-pulse border-b border-white/5 bg-white/5" />

      <main className="mx-auto max-w-6xl flex-1 px-4 pb-4 pt-28 transition-all duration-300 lg:px-8 lg:pb-8">
        {/* Page title skeleton */}
        <div className="mb-2 h-8 w-48 animate-pulse rounded-lg bg-white/5" />
        <div className="mb-8 h-4 w-72 animate-pulse rounded bg-white/5" />

        {/* Search + filter bar skeleton */}
        <div className="mb-6 flex gap-3">
          <div className="h-10 flex-1 animate-pulse rounded-lg bg-white/5" />
          <div className="h-10 w-32 animate-pulse rounded-lg bg-white/5" />
        </div>

        {/* Tab bar skeleton */}
        <div className="mb-6 flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 w-24 animate-pulse rounded-md bg-white/5" />
          ))}
        </div>

        {/* Booking cards skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      </main>
    </div>
  );
}
