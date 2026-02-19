'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Home, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logError } from '@/lib/system-pages/error-logger';

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
  const [remainingTime, setRemainingTime] = useState(countdown || 0);

  // Countdown timer for rate limiting
  useEffect(() => {
    if (countdown && countdown > 0) {
       
      setRemainingTime(countdown);
      const timer = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [countdown]);

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
        'flex flex-col items-center justify-center px-4 py-8 text-center md:py-12',
        className
      )}
    >
      {/* Error Code */}
      <div className="mb-4 text-6xl font-bold text-gray-200 md:text-8xl">{errorCode}</div>

      {/* Illustration */}
      <div className="mb-6 h-48 w-48 md:h-64 md:w-64">{illustration}</div>

      {/* Title */}
      <h1 className="mb-4 max-w-2xl text-2xl font-bold text-gray-900 md:text-3xl lg:text-4xl">
        {title}
      </h1>

      {/* Description */}
      <p className="mb-8 max-w-xl text-base text-gray-600 md:text-lg">{description}</p>

      {/* Countdown Timer (for 429 errors) */}
      {remainingTime > 0 && (
        <div className="mb-6 text-center">
          <p className="text-lg font-medium text-gray-700">
            Please wait {remainingTime} second{remainingTime !== 1 ? 's' : ''} before trying again
          </p>
        </div>
      )}

      {/* Search Bar (for 404 pages) */}
      {showSearchBar && (
        <div className="mb-8 w-full max-w-md">
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
              className="h-12 pl-10 text-base"
            />
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          </form>
        </div>
      )}

      {/* Actions */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={handlePrimaryAction}
          size="lg"
          className="min-h-[44px] min-w-[120px] bg-green-600 text-white hover:bg-green-700"
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
          <p className="mb-4 text-sm text-gray-500">Popular Categories:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {popularCategories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-100"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="mt-8 flex items-center gap-4 text-sm text-gray-500">
        <Link href="/" className="flex items-center gap-1 transition-colors hover:text-green-600">
          <Home className="h-4 w-4" />
          <span>Home</span>
        </Link>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 transition-colors hover:text-green-600"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Go Back</span>
        </button>
      </div>
    </div>
  );
}
