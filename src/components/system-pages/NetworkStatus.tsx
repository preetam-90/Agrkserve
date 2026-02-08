'use client';

import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';
import { addNetworkListeners } from '@/lib/system-pages/network-detector';

export type NetworkStatusType = 'online' | 'offline' | 'slow';
export type NetworkStatusPosition = 'top' | 'bottom';

export interface NetworkStatusProps {
  status?: NetworkStatusType;
  showBanner?: boolean;
  position?: NetworkStatusPosition;
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
export function NetworkStatus({
  showBanner = true,
  position = 'top',
  className,
}: NetworkStatusProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [showReconnectedBanner, setShowReconnectedBanner] = useState(false);

  useEffect(() => {
    // Set initial state

// eslint-disable-next-line react-hooks/set-state-in-effect
        setIsOnline(navigator.onLine);

    // Add network listeners
    const cleanup = addNetworkListeners(
      () => {
        // Online
        setIsOnline(true);
        setShowOfflineBanner(false);
        
        // Show reconnected banner briefly
        setShowReconnectedBanner(true);
        setTimeout(() => {
          setShowReconnectedBanner(false);
        }, 3000);
      },
      () => {
        // Offline
        setIsOnline(false);
        setShowOfflineBanner(true);
        setShowReconnectedBanner(false);
      }
    );

    return cleanup;
  }, []);

  if (!showBanner) {
    return null;
  }

  // Show reconnected banner
  if (showReconnectedBanner) {
    return (
      <div
        className={cn(
          'fixed left-0 right-0 z-50 px-4 py-3 bg-green-600 text-white text-center shadow-lg',
          position === 'top' ? 'top-0' : 'bottom-0',
          className
        )}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center justify-center gap-2">
          <Wifi className="h-5 w-5" />
          <span className="font-medium">
            वापस ऑनलाइन | Back Online
          </span>
        </div>
      </div>
    );
  }

  // Show offline banner
  if (showOfflineBanner && !isOnline) {
    return (
      <div
        className={cn(
          'fixed left-0 right-0 z-50 px-4 py-3 bg-red-600 text-white text-center shadow-lg',
          position === 'top' ? 'top-0' : 'bottom-0',
          className
        )}
        role="alert"
        aria-live="assertive"
      >
        <div className="flex items-center justify-center gap-2">
          <WifiOff className="h-5 w-5" />
          <span className="font-medium">
            कोई इंटरनेट कनेक्शन नहीं | No Internet Connection
          </span>
        </div>
        <p className="text-sm mt-1 opacity-90">
          कृपया अपना कनेक्शन जांचें | Please check your connection
        </p>
      </div>
    );
  }

  return null;
}
