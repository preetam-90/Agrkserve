import { Skeleton } from '@/components/ui/skeleton';

export function AdminPaymentsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-9 w-64" />
      </div>

      {/* Revenue Summary - 3 cards */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="admin-stats-card rounded-xl border-l-4 p-6">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-2 h-8 w-40" />
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex flex-col gap-4 md:flex-row">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Data Table */}
      <div className="admin-card overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="admin-table w-full">
            <thead>
              <tr>
                {[
                  'Payment ID',
                  'Equipment',
                  'Customer',
                  'Amount',
                  'Method',
                  'Transaction ID',
                  'Status',
                  'Date',
                ].map((header) => (
                  <th key={header} className="px-6 py-4">
                    <Skeleton className="h-4 w-20" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(10)].map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="mt-1 h-3 w-40" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-5 w-24" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t px-6 py-4">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
      </div>
    </div>
  );
}
