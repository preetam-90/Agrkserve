'use client';

import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';
import { addNetworkListeners } from '@/lib/system-pages/network-detector';

type NetworkStatusType = 'online' | 'offline' | 'slow';
type NetworkStatusPosition = 'top' | 'bottom';

export interface NetworkStatusProps {
  status?: NetworkStatusType;
  showBanner?: boolean;
  className?: string;
}

/**
 * NetworkStatus Component
 * Real-time network connectivity indicator
 *
 * Features:
 * - Real-time network detection
 * - Visual indicator (banner or icon)
 * - Automatic retry on reconnection
 * - Cached data availability hint
 */
export function NetworkStatus({ showBanner = true, className }: NetworkStatusProps) {
  // Use a stable initial state to avoid hydration mismatch
  // Server: assume online (no way to check), client: actual status
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [showReconnectedBanner, setShowReconnectedBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
      setShowReconnectedBanner(true);
      setTimeout(() => setShowReconnectedBanner(false), 8000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
      setShowReconnectedBanner(false);
    };

    // Add network listeners
    const cleanup = addNetworkListeners(handleOnline, handleOffline);

    // Periodic check as fallback for missed events
    const interval = setInterval(() => {
      const actualStatus = navigator.onLine;
      if (actualStatus !== isOnline) {
        if (actualStatus) handleOnline();
        else handleOffline();
      }
    }, 3000);

    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, [isOnline]);

  if (!showBanner) {
    return null;
  }

  // Show reconnected banner
  if (showReconnectedBanner) {
    return (
      <div
        className={cn(
          'animate-in fade-in slide-in-from-bottom-4 fixed bottom-4 left-4 right-4 z-[9999] rounded-xl bg-green-600 px-4 py-3 text-white shadow-2xl duration-500 md:bottom-8 md:left-auto md:right-8 md:w-80',
          className
        )}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 rounded-lg bg-green-500/20 p-2">
            <Wifi className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">वापस ऑनलाइन</p>
            <p className="text-xs font-medium tracking-tight opacity-90">Back Online</p>
          </div>
        </div>
      </div>
    );
  }

  // Show offline popup (On top of everything)
  if (showOfflineBanner && !isOnline) {
    return (
      <div
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
        role="alert"
        aria-live="assertive"
      >
        {/* Backdrop */}
        <div className="animate-in fade-in absolute inset-0 bg-black/60 backdrop-blur-sm duration-300" />

        {/* Content */}
        <div
          className={cn(
            'animate-in zoom-in-95 relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl duration-300 dark:bg-zinc-900',
            className
          )}
        >
          <div className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <WifiOff className="h-8 w-8 text-red-600 dark:text-red-500" />
            </div>

            <h2 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">
              कोई इंटरनेट कनेक्शन नहीं
            </h2>
            <p className="mb-4 text-lg font-semibold tracking-tight text-gray-700 dark:text-gray-200">
              No Internet Connection
            </p>

            <div className="space-y-2 text-gray-600 dark:text-gray-400">
              <p className="text-sm">कृपया अपना इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।</p>
              <p className="text-xs font-medium uppercase tracking-wider opacity-75">
                Please check your internet connection and try again.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
            <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400">
              <div className="h-2 w-2 animate-pulse rounded-full bg-current" />
              <span className="text-xs font-bold uppercase tracking-widest">
                कनेक्ट करने का प्रयास किया जा रहा है... | Attempting to reconnect...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
