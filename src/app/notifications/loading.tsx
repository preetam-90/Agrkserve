/**
 * Next.js loading.tsx — shown instantly on navigation to /notifications
 * while the page component loads and fetches data.
 */
export default function NotificationsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header skeleton */}
      <div className="h-20 animate-pulse border-b border-white/5 bg-white/5" />

      <main className="mx-auto max-w-4xl flex-1 px-4 pb-4 pt-28 transition-all duration-300 lg:px-8 lg:pb-8">
        {/* Page title + actions skeleton */}
        <div className="mb-8 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-white/5" />
            <div className="h-4 w-64 animate-pulse rounded bg-white/5" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-28 animate-pulse rounded-md bg-white/5" />
            <div className="h-9 w-28 animate-pulse rounded-md bg-white/5" />
          </div>
        </div>

        {/* Filter tabs skeleton */}
        <div className="mb-6 flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 w-24 animate-pulse rounded-md bg-white/5" />
          ))}
        </div>

        {/* Notification cards skeleton */}
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex animate-pulse items-start gap-4 rounded-xl bg-white/5 p-4">
              <div className="h-10 w-10 shrink-0 rounded-full bg-white/10" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 rounded bg-white/10" />
                <div className="h-3 w-72 rounded bg-white/10" />
                <div className="h-3 w-24 rounded bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
