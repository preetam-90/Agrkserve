'use client';

import { useMemo } from 'react';
import { Star, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

interface RatingDisplayProps {
  rating?: number | null;
  reviewCount?: number | null;
  showCTA?: boolean;
  onReviewClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function RatingDisplay({
  rating,
  reviewCount,
  showCTA = false,
  onReviewClick,
  size = 'md',
  className,
}: RatingDisplayProps) {
  const hasReviews = reviewCount && reviewCount > 0;
  const displayRating = rating?.toFixed(1) || '0.0';

  const sizeClasses = {
    sm: {
      badge: 'px-2 py-0.5 text-xs',
      star: 'h-3 w-3',
      text: 'text-xs',
      count: 'text-xs',
    },
    md: {
      badge: 'px-2.5 py-1 text-sm',
      star: 'h-4 w-4',
      text: 'text-sm',
      count: 'text-sm',
    },
    lg: {
      badge: 'px-3 py-1.5 text-base',
      star: 'h-5 w-5',
      text: 'text-base',
      count: 'text-base',
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _avgRating = useMemo(() => {
    return rating || 0;
  }, [rating]);

  if (!hasReviews) {
    return (
      <div className={cn('flex flex-wrap items-center gap-3', className)}>
        <Badge variant="secondary" className="border-blue-500/20 bg-blue-500/10 text-blue-400">
          <Sparkles className="mr-1.5 h-3 w-3" />
          New Listing
        </Badge>
        {showCTA && (
          <button
            onClick={onReviewClick}
            className="text-sm text-emerald-400 transition-colors hover:text-emerald-300 hover:underline"
          >
            Be the first to review →
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'flex items-center rounded-md border border-amber-500/20 bg-amber-500/10',
          sizeClasses[size].badge
        )}
      >
        <Star className={cn('mr-1.5 fill-amber-400 text-amber-400', sizeClasses[size].star)} />
        <span className={cn('font-bold text-amber-400', sizeClasses[size].text)}>
          {displayRating}
        </span>
      </div>
      <span className={cn('text-slate-400', sizeClasses[size].count)}>
        ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
      </span>
    </div>
  );
}
