/**
 * Next.js loading.tsx — shown instantly on navigation to /renter/bookings/[id]
 * while the page component loads and fetches data.
 */
export default function BookingDetailLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header skeleton */}
      <div className="h-20 animate-pulse border-b border-white/5 bg-white/5" />

      <main className="mx-auto max-w-4xl flex-1 px-4 pb-4 pt-28 transition-all duration-300 lg:px-8 lg:pb-8">
        {/* Back button skeleton */}
        <div className="mb-6 h-6 w-32 animate-pulse rounded bg-white/5" />

        {/* Title + status skeleton */}
        <div className="mb-8 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-56 animate-pulse rounded-lg bg-white/5" />
            <div className="h-4 w-40 animate-pulse rounded bg-white/5" />
          </div>
          <div className="h-8 w-24 animate-pulse rounded-full bg-white/5" />
        </div>

        {/* Main content grid skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column — details */}
          <div className="space-y-6 lg:col-span-2">
            <div className="h-48 animate-pulse rounded-xl bg-white/5" />
            <div className="h-64 animate-pulse rounded-xl bg-white/5" />
          </div>

          {/* Right column — sidebar */}
          <div className="space-y-6">
            <div className="h-40 animate-pulse rounded-xl bg-white/5" />
            <div className="h-32 animate-pulse rounded-xl bg-white/5" />
          </div>
        </div>
      </main>
    </div>
  );
}
