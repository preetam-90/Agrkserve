import { Skeleton } from '@/components/ui/skeleton';

export function MessagesSkeleton() {
  return (
    <div className="flex min-h-[calc(100vh-56px)] flex-col bg-[radial-gradient(circle_at_top,rgba(20,83,45,0.2),transparent_45%),linear-gradient(180deg,#030a07_0%,#050907_100%)]">
      <div className="sticky top-0 z-20 border-b border-white/10 bg-[#07100d]/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3 md:px-6">
          <Skeleton className="h-8 w-36 rounded-full bg-white/10" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-32 rounded-lg bg-white/10" />
            <Skeleton className="h-9 w-44 rounded-lg bg-white/10" />
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-4 pb-28 pt-6 md:px-6">
        <div className="self-start rounded-2xl border border-white/10 bg-white/5 p-4">
          <Skeleton className="h-4 w-56 bg-white/10" />
          <Skeleton className="mt-2 h-4 w-64 bg-white/10" />
        </div>
        <div className="self-end rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
          <Skeleton className="h-4 w-48 bg-white/15" />
          <Skeleton className="mt-2 h-4 w-40 bg-white/15" />
        </div>
        <div className="self-start rounded-2xl border border-white/10 bg-white/5 p-4">
          <Skeleton className="h-4 w-60 bg-white/10" />
          <Skeleton className="mt-2 h-4 w-72 bg-white/10" />
          <Skeleton className="mt-2 h-4 w-44 bg-white/10" />
        </div>
      </div>

      <div className="sticky bottom-0 z-20 border-t border-white/10 bg-[#07100d]/90 px-4 pb-4 pt-3 backdrop-blur-xl md:px-6">
        <div className="mx-auto w-full max-w-5xl rounded-2xl border border-white/15 bg-white/[0.03] p-3">
          <Skeleton className="h-4 w-28 bg-white/10" />
          <Skeleton className="mt-3 h-24 w-full rounded-lg bg-white/10" />
          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-lg bg-white/10" />
              <Skeleton className="h-9 w-9 rounded-lg bg-white/10" />
            </div>
            <Skeleton className="h-9 w-20 rounded-lg bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
