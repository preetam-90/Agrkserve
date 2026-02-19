'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Loader2, AlertCircle, Package, RefreshCw } from 'lucide-react';

/**
 * Section States - Loading, Empty, Error
 */

interface LoadingStateProps {
  title?: string;
  className?: string;
}

function SectionLoadingState({ title = 'Loading content...', className = '' }: LoadingStateProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className={`flex min-h-[50vh] items-center justify-center px-6 py-16 ${className}`}>
      <div className="text-center">
        <motion.div
          animate={prefersReducedMotion ? {} : { rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center"
        >
          <Loader2 className="h-8 w-8 text-emerald-400" />
        </motion.div>
        <p className="text-sm font-medium uppercase tracking-wider text-white/60">{title}</p>
      </div>
    </section>
  );
}

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

function SectionEmptyState({
  title = 'No content available',
  description = 'Check back later for updates.',
  actionLabel,
  actionHref,
  icon: Icon = Package,
  className = '',
}: EmptyStateProps) {
  return (
    <section className={`flex min-h-[50vh] items-center justify-center px-6 py-16 ${className}`}>
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
          <Icon className="h-8 w-8 text-white/40" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-white">{title}</h3>
        <p className="mb-6 text-white/60">{description}</p>
        {actionLabel && actionHref && (
          <a
            href={actionHref}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-400"
          >
            {actionLabel}
          </a>
        )}
      </div>
    </section>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
}

function SectionErrorState({
  title = 'Something went wrong',
  description = 'Unable to load this section. Please try again.',
  retryLabel = 'Try Again',
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <section className={`flex min-h-[50vh] items-center justify-center px-6 py-16 ${className}`}>
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
          <AlertCircle className="h-8 w-8 text-red-400" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-white">{title}</h3>
        <p className="mb-6 text-white/60">{description}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4" />
            {retryLabel}
          </button>
        )}
      </div>
    </section>
  );
}

/**
 * Chapter Skeleton - For lazy-loaded chapters
 */
export function ChapterSkeleton({
  title = 'Loading chapter...',
  id,
}: {
  title?: string;
  id?: string;
}) {
  return (
    <section id={id} className="relative flex min-h-[70vh] items-center justify-center px-6 py-16">
      <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 animate-pulse rounded-full bg-emerald-500" />
          <span className="text-sm uppercase tracking-wider text-white/60">{title}</span>
        </div>
      </div>
    </section>
  );
}

/**
 * Equipment Card Skeleton
 */
export function EquipmentCardSkeleton() {
  return (
    <div className="w-[85vw] max-w-[360px] overflow-hidden rounded-2xl border border-white/10 bg-white/5 md:w-[45vw]">
      {/* Image placeholder */}
      <div className="h-48 w-full animate-pulse bg-white/10 md:h-56" />

      {/* Content placeholder */}
      <div className="space-y-3 p-4 md:p-5">
        <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
        <div className="h-6 w-3/4 animate-pulse rounded bg-white/10" />
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-white/10" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-white/10" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="h-5 w-20 animate-pulse rounded bg-white/10" />
          <div className="h-10 w-10 animate-pulse rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}

export default SectionLoadingState;
