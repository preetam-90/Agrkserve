/**
 * Next.js loading.tsx — shown instantly on navigation to /messages
 * while the page component loads and fetches data.
 */
export default function MessagesLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header skeleton */}
      <div className="h-20 animate-pulse border-b border-white/5 bg-white/5" />

      <div className="flex h-[calc(100vh-5rem)]">
        {/* Chat list sidebar skeleton */}
        <div className="w-80 space-y-3 border-r border-white/10 p-4">
          <div className="mb-4 h-10 animate-pulse rounded-lg bg-white/5" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg p-3">
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-white/5" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-white/5" />
                <div className="h-3 w-36 animate-pulse rounded bg-white/5" />
              </div>
            </div>
          ))}
        </div>

        {/* Chat window skeleton */}
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="mb-4 h-12 w-12 animate-pulse rounded-full bg-white/5" />
          <div className="h-4 w-48 animate-pulse rounded bg-white/5" />
        </div>
      </div>
    </div>
  );
}
