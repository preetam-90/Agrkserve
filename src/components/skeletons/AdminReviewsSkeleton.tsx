import { Skeleton } from '@/components/ui/skeleton';

export function AdminReviewsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-9 w-64" />
      </div>

      {/* Search and Filters */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex flex-col gap-4 md:flex-row">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Reviews List */}
      <div className="admin-card space-y-4 rounded-2xl p-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <div className="flex items-start justify-between">
              <div className="flex flex-1 gap-4">
                {/* Equipment Image */}
                <Skeleton className="h-20 w-20 shrink-0 rounded" />

                <div className="flex-1">
                  {/* Equipment Name */}
                  <Skeleton className="h-6 w-48" />

                  {/* Reviewer Info */}
                  <div className="mt-1 flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>

                  {/* Rating */}
                  <div className="mt-2 flex items-center gap-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-12" />
                  </div>

                  {/* Comment */}
                  <Skeleton className="mt-3 h-16 w-full" />

                  {/* Review Images */}
                  <div className="mt-3 flex gap-2">
                    {[...Array(3)].map((_, j) => (
                      <Skeleton key={j} className="h-16 w-16 rounded" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
    </div>
  );
}
