import { Skeleton } from '@/components/ui/skeleton';

export function AuthSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <Skeleton className="h-20 w-20 rounded-2xl" />
            <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400" />
          </div>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#0a0a0a]/80 p-8">
          {/* Header */}
          <div className="mb-8 space-y-3 text-center">
            <Skeleton className="mx-auto h-10 w-64" />
            <Skeleton className="mx-auto h-5 w-80" />
          </div>

          {/* Social Buttons */}
          <div className="mb-6 space-y-3">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>

          {/* Divider */}
          <div className="mb-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <Skeleton className="h-4 w-12" />
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <div className="relative">
                <Skeleton className="h-12 w-full rounded-xl pl-12" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <div className="relative">
                <Skeleton className="h-12 w-full rounded-xl pl-12" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>

          {/* Footer */}
          <div className="mt-6 space-y-2 text-center">
            <Skeleton className="mx-auto h-4 w-64" />
            <Skeleton className="mx-auto h-4 w-48" />
          </div>
        </div>

        {/* Additional Links */}
        <div className="mt-6 flex flex-col gap-3 text-center">
          <Skeleton className="mx-auto h-4 w-48" />
          <Skeleton className="mx-auto h-4 w-40" />
        </div>
      </div>
    </div>
  );
}
