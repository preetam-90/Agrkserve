/**
 * Next.js loading.tsx — shown instantly on navigation to /
 * while the page component loads and fetches data.
 */
export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header skeleton */}
      <div className="h-20 animate-pulse border-b border-white/5 bg-white/5" />

      {/* Hero skeleton */}
      <div className="flex flex-col items-center justify-center px-4 py-32">
        <div className="mb-6 h-12 w-96 max-w-full animate-pulse rounded-lg bg-white/5" />
        <div className="mb-4 h-6 w-64 max-w-full animate-pulse rounded-md bg-white/5" />
        <div className="mb-8 h-6 w-48 animate-pulse rounded-md bg-white/5" />
        <div className="h-12 w-40 animate-pulse rounded-full bg-white/5" />
      </div>

      {/* Stats skeleton */}
      <div className="mx-auto mb-16 grid max-w-6xl grid-cols-2 gap-4 px-4 md:grid-cols-4 lg:px-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-white/5" />
        ))}
      </div>

      {/* Equipment grid skeleton */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3 lg:px-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-xl bg-white/5" />
        ))}
      </div>
    </div>
  );
}
