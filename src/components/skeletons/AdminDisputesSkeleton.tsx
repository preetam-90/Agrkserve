import { Skeleton } from '@/components/ui/skeleton';

export function AdminDisputesSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="mt-1 h-5 w-96" />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 md:flex-row">
          <Skeleton className="h-10 flex-1" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>

      {/* Dispute Cards */}
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="p-6">
              <div className="flex flex-col gap-6 md:flex-row">
                {/* Status & ID */}
                <div className="flex-shrink-0 md:w-48">
                  <div className="mb-2 flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="mb-4 h-6 w-24 rounded-md" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 border-l border-t border-slate-100 pt-4 md:border-t-0 md:pl-6 md:pt-0">
                  <div className="mb-2 flex items-start justify-between">
                    <Skeleton className="h-6 w-64" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="mb-4 h-16 w-full" />

                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-5 w-5 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-5 w-5 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center gap-2 border-t border-slate-100 pt-4 md:w-32 md:flex-col md:border-l md:border-t-0 md:pt-0">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
