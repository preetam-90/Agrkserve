/**
 * Enhanced Lenis Smooth Scroll with Mobile Optimization
 *
 * Upgraded from basic Lenis setup with performance tuning
 */

'use client';

import { ReactLenis, useLenis } from 'lenis/react';
import { useEffect, type ReactNode } from 'react';
import { useDeviceCapability } from '@/lib/animations/device-capability';

interface EnhancedSmoothScrollProps {
  children: ReactNode;
  root?: boolean;
}

export function EnhancedSmoothScroll({ children, root = true }: EnhancedSmoothScrollProps) {
  const deviceInfo = useDeviceCapability();

  // Determine scroll configuration based on device
  const scrollConfig = getScrollConfig(deviceInfo);

  // Disable smooth scroll if user prefers reduced motion
  if (deviceInfo.prefersReducedMotion) {
    return <>{children}</>;
  }

  // Disable smooth scroll on low-end mobile devices for better performance
  if (deviceInfo.isMobile && deviceInfo.capability === 'low') {
    return <>{children}</>;
  }

  return (
    <ReactLenis root={root} options={scrollConfig}>
      {children}
    </ReactLenis>
  );
}

/**
 * Get scroll configuration based on device capability
 */
function getScrollConfig(deviceInfo: ReturnType<typeof useDeviceCapability>) {
  const baseConfig = {
    smoothWheel: true,
    smoothTouch: false, // Generally better performance on touch devices
    normalizeWheel: true,
    infinite: false,
  };

  // High-end devices: smooth experience
  if (deviceInfo.capability === 'high' && !deviceInfo.isMobile) {
    return {
      ...baseConfig,
      lerp: 0.12,
      duration: 1.8,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -8 * t)),
      smoothTouch: false, // Keep off even on high-end for touch
      syncTouch: true,
    };
  }

  // Medium devices: balanced
  if (deviceInfo.capability === 'medium') {
    return {
      ...baseConfig,
      lerp: 0.18,
      duration: 1.5,
      smoothTouch: false,
      syncTouch: deviceInfo.isMobile,
    };
  }

  // Low-end devices: minimal smoothing
  return {
    ...baseConfig,
    lerp: 0.25,
    duration: 1.0,
    smoothTouch: false,
    syncTouch: false,
  };
}

/**
 * Hook to control Lenis scroll programmatically
 */
export function useLenisScroll() {
  const lenis = useLenis();

  return {
    /**
     * Scroll to a target element or position
     */
    scrollTo: (
      target: string | number | HTMLElement,
      options?: { offset?: number; duration?: number }
    ) => {
      lenis?.scrollTo(target, {
        offset: options?.offset || 0,
        duration: options?.duration,
      });
    },

    /**
     * Start scrolling
     */
    start: () => lenis?.start(),

    /**
     * Stop scrolling
     */
    stop: () => lenis?.stop(),

    /**
     * Get current scroll position
     */
    getScroll: () => lenis?.scroll || 0,

    /**
     * Check if currently scrolling
     */
    isScrolling: () => lenis?.isScrolling || false,

    /**
     * Lenis instance for advanced usage
     */
    lenis,
  };
}

/**
 * Hook to prevent Lenis scroll on specific elements
 * Use with data-lenis-prevent attribute for better performance
 */
export function useLenisPrevent(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Add data attribute for Lenis to detect
    element.setAttribute('data-lenis-prevent', 'true');

    return () => {
      element.removeAttribute('data-lenis-prevent');
    };
  }, [ref]);
}

/**
 * Component wrapper to prevent Lenis scroll on children
 */
export function LenisPrevent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div data-lenis-prevent="true" className={className}>
      {children}
    </div>
  );
}

/**
 * Hook for scroll-based animation triggers
 * Integrates with Lenis smooth scroll
 */
export function useLenisScrollAnimation(callback: (scroll: number) => void) {
  useLenis((lenis) => {
    callback(lenis.scroll);
  });
}
