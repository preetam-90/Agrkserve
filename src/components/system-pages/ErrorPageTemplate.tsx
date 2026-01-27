'use client';

import { ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Home, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logError } from '@/lib/system-pages/error-logger';
import { CountdownTimer } from './CountdownTimer';

export interface ErrorPageAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface ErrorPageTemplateProps {
  errorCode: string;
  title: string;
  description: string;
  illustration: ReactNode;
  primaryAction: ErrorPageAction;
  secondaryAction?: ErrorPageAction;
  showSearchBar?: boolean;
  showPopularCategories?: boolean;
  countdown?: number; // For 429 rate limiting
  className?: string;
}

const popularCategories = [
  { name: 'Tractors', href: '/equipment?category=tractors' },
  { name: 'Harvesters', href: '/equipment?category=harvesters' },
  { name: 'Ploughs', href: '/equipment?category=ploughs' },
  { name: 'Seeders', href: '/equipment?category=seeders' },
];

/**
 * ErrorPageTemplate Component
 * Reusable template for HTTP error pages
 * 
 * Features:
 * - Displays error code prominently
 * - Shows culturally appropriate illustration
 * - Renders primary CTA button (min 44x44px touch target)
 * - Optional secondary action
 * - Logs error details without exposing to user
 * - Supports countdown timer for rate limiting
 */
export function ErrorPageTemplate({
  errorCode,
  title,
  description,
  illustration,
  primaryAction,
  secondaryAction,
  showSearchBar = false,
  showPopularCategories = false,
  countdown,
  className,
}: ErrorPageTemplateProps) {
  const router = useRouter();

  // Log error on mount (without stack trace) - only for actual errors, not 404s
  useEffect(() => {
    // Skip logging for 404 pages as they're expected user behavior
    if (errorCode !== '404') {
      logError(errorCode, title, {
        description,
        timestamp: new Date().toISOString(),
      });
    }
  }, [errorCode, title, description]);

  const handlePrimaryAction = () => {
    if (primaryAction.onClick) {
      primaryAction.onClick();
    } else if (primaryAction.href) {
      router.push(primaryAction.href);
    }
  };

  const handleSecondaryAction = () => {
    if (secondaryAction?.onClick) {
      secondaryAction.onClick();
    } else if (secondaryAction?.href) {
      router.push(secondaryAction.href);
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center px-4 py-8 md:py-12',
        className
      )}
    >
      {/* Error Code */}
      <div className="text-6xl md:text-8xl font-bold text-gray-200 mb-4">
        {errorCode}
      </div>

      {/* Illustration */}
      <div className="w-48 h-48 md:w-64 md:h-64 mb-6">
        {illustration}
      </div>

      {/* Title */}
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 max-w-2xl">
        {title}
      </h1>

      {/* Description */}
      <p className="text-base md:text-lg text-gray-600 mb-8 max-w-xl">
        {description}
      </p>

      {/* Countdown Timer (for 429 errors) */}
      {countdown && countdown > 0 && (
        <div className="mb-6">
          <CountdownTimer
            initialSeconds={countdown}
            onComplete={() => {
              // Enable retry button
            }}
          />
        </div>
      )}

      {/* Search Bar (for 404 pages) */}
      {showSearchBar && (
        <div className="w-full max-w-md mb-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const query = formData.get('search') as string;
              if (query) {
                router.push(`/equipment?search=${encodeURIComponent(query)}`);
              }
            }}
            className="relative"
          >
            <Input
              type="search"
              name="search"
              id="error-search-input"
              placeholder="Search for equipment..."
              className="pl-10 h-12 text-base"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </form>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <Button
          onClick={handlePrimaryAction}
          size="lg"
          className="min-h-[44px] min-w-[120px] bg-green-600 hover:bg-green-700 text-white"
        >
          {primaryAction.label}
        </Button>

        {secondaryAction && (
          <Button
            onClick={handleSecondaryAction}
            variant="outline"
            size="lg"
            className="min-h-[44px] min-w-[120px]"
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>

      {/* Popular Categories (for 404 pages) */}
      {showPopularCategories && (
        <div className="w-full max-w-2xl">
          <p className="text-sm text-gray-500 mb-4">Popular Categories:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {popularCategories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="flex items-center gap-4 mt-8 text-sm text-gray-500">
        <Link
          href="/"
          className="flex items-center gap-1 hover:text-green-600 transition-colors"
        >
          <Home className="h-4 w-4" />
          <span>Home</span>
        </Link>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 hover:text-green-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Go Back</span>
        </button>
      </div>
    </div>
  );
}
