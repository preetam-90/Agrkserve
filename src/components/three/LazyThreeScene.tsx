/**
 * Lazy-loaded Three.js Scene Wrapper
 *
 * Dynamic import wrapper for Three.js components to reduce bundle size
 */

'use client';

import dynamic from 'next/dynamic';
import { Suspense, type ComponentType, type ReactNode } from 'react';
import { useDeviceCapability, shouldEnable3D } from '@/lib/animations/device-capability';

// Fallback component while 3D scene loads
function ThreeLoadingFallback({ message = 'Loading 3D view...' }: { message?: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-900/10 to-teal-900/10">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-500" />
        <p className="text-sm text-emerald-400/70">{message}</p>
      </div>
    </div>
  );
}

// Fallback component when 3D is not supported
function ThreeNotSupported({
  message = '3D view not available on this device',
}: {
  message?: string;
}) {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-lg border border-emerald-500/20 bg-gradient-to-br from-emerald-900/10 to-teal-900/10">
      <div className="p-6 text-center">
        <div className="mb-4 text-4xl">📦</div>
        <p className="text-sm text-emerald-400/70">{message}</p>
      </div>
    </div>
  );
}

interface LazyThreeSceneProps {
  /**
   * Path to the Three.js component (will be dynamically imported)
   */
  componentPath: string;
  /**
   * Props to pass to the Three.js component
   */
  componentProps?: Record<string, unknown>;
  /**
   * Custom loading fallback
   */
  loadingFallback?: ReactNode;
  /**
   * Custom not-supported fallback
   */
  notSupportedFallback?: ReactNode;
  /**
   * Force load even on unsupported devices (use with caution)
   */
  forceLoad?: boolean;
  /**
   * Container className
   */
  className?: string;
}

/**
 * Lazy-loaded Three.js scene wrapper with device capability detection
 *
 * @example
 * <LazyThreeScene
 *   componentPath="@/components/3d/EquipmentModel"
 *   componentProps={{ modelUrl: '/models/tractor.glb' }}
 * />
 */
export function LazyThreeScene({
  componentPath,
  componentProps = {},
  loadingFallback,
  notSupportedFallback,
  forceLoad = false,
  className = 'h-full w-full',
}: LazyThreeSceneProps) {
  const deviceInfo = useDeviceCapability();
  const can3D = shouldEnable3D(deviceInfo) || forceLoad;

  // Don't load 3D on incapable devices
  if (!can3D) {
    return notSupportedFallback || <ThreeNotSupported />;
  }

  // Dynamically import the Three.js component
  // This ensures Three.js is only loaded when needed
  const ThreeComponent = dynamic<Record<string, unknown>>(
    () =>
      import(`${componentPath}`).then(
        (mod) => mod.default as ComponentType<Record<string, unknown>>
      ),
    {
      loading: () => loadingFallback || <ThreeLoadingFallback />,
      ssr: false, // Three.js cannot be SSR'd
    }
  );

  const allProps: Record<string, unknown> = {
    ...componentProps,
    deviceCapability: deviceInfo.capability,
  };

  return (
    <Suspense fallback={loadingFallback || <ThreeLoadingFallback />}>
      <div className={className}>
        <ThreeComponent {...allProps} />
      </div>
    </Suspense>
  );
}

/**
 * HOC to make any Three.js component lazy-loaded
 */
export function withLazyThree<P extends object>(
  Component: ComponentType<P>,
  options?: {
    loadingFallback?: ReactNode;
    notSupportedFallback?: ReactNode;
  }
) {
  return function LazyThreeComponent(props: P) {
    const deviceInfo = useDeviceCapability();
    const can3D = shouldEnable3D(deviceInfo);

    if (!can3D) {
      return options?.notSupportedFallback || <ThreeNotSupported />;
    }

    return (
      <Suspense fallback={options?.loadingFallback || <ThreeLoadingFallback />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

/**
 * Canvas wrapper with performance optimizations
 */
export const OptimizedCanvas = dynamic(
  () => import('@react-three/fiber').then((mod) => mod.Canvas),
  {
    loading: () => <ThreeLoadingFallback />,
    ssr: false,
  }
);

/**
 * Get Three.js quality settings based on device
 */
export function getThreeQualitySettings(capability: 'low' | 'medium' | 'high') {
  switch (capability) {
    case 'high':
      return {
        shadows: true,
        antialias: true,
        pixelRatio: Math.min(window.devicePixelRatio, 2),
        powerPreference: 'high-performance' as const,
      };
    case 'medium':
      return {
        shadows: false,
        antialias: false,
        pixelRatio: 1,
        powerPreference: 'default' as const,
      };
    case 'low':
    default:
      return {
        shadows: false,
        antialias: false,
        pixelRatio: 1,
        powerPreference: 'low-power' as const,
      };
  }
}
