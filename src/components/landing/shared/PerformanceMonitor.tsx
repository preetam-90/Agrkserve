/**
 * Performance Monitor Component
 *
 * Tracks and displays performance metrics for the landing page
 * Shows real-time FPS, memory usage, and performance warnings
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { useDeviceCapabilities } from '@/lib/device-detection';
import { useAccessibility } from '@/hooks/useAccessibility';

interface PerformanceMetrics {
  fps: number;
  avgFps: number;
  frameTime: number;
  memoryUsage: number | null;
  isThrottled: boolean;
  deviceCapability: string;
  animationQuality: string;
}

interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

interface LayoutShiftEntry extends PerformanceEntry {
  hadRecentInput: boolean;
  value: number;
}

export function PerformanceMonitor({ show = false }: { show?: boolean }) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    avgFps: 0,
    frameTime: 0,
    memoryUsage: null,
    isThrottled: false,
    deviceCapability: 'unknown',
    animationQuality: 'high',
  });

  const deviceCapabilities = useDeviceCapabilities();
  const accessibility = useAccessibility();
  const { capability, isLowEnd, isHighEnd } = deviceCapabilities;
  const rafRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const fpsHistoryRef = useRef<number[]>([]);

  useEffect(() => {
    if (!show || process.env.NODE_ENV === 'production') {
      return;
    }
    lastTimeRef.current = performance.now();

    const measurePerformance = (currentTime: number) => {
      frameCountRef.current++;
      const deltaTime = currentTime - lastTimeRef.current;
      const currentFps = 1000 / deltaTime;

      // Update FPS history
      fpsHistoryRef.current.push(currentFps);
      if (fpsHistoryRef.current.length > 60) {
        fpsHistoryRef.current.shift();
      }

      // Calculate average FPS
      const avgFps =
        fpsHistoryRef.current.reduce((sum, fps) => sum + fps, 0) / fpsHistoryRef.current.length;

      // Get memory usage
      let memoryUsage = null;
      const performanceWithMemory = performance as PerformanceWithMemory;
      if (performanceWithMemory.memory) {
        const memory = performanceWithMemory.memory;
        memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      }

      // Determine throttling
      const isThrottled = avgFps < 30 && fpsHistoryRef.current.length >= 30;

      // Determine animation quality
      let animationQuality = 'high';
      if (isLowEnd) {
        animationQuality = 'low';
      } else if (isHighEnd) {
        animationQuality = 'high';
      } else {
        animationQuality = 'medium';
      }

      setMetrics({
        fps: Math.round(currentFps),
        avgFps: Math.round(avgFps),
        frameTime: deltaTime,
        memoryUsage,
        isThrottled,
        deviceCapability: capability,
        animationQuality,
      });

      lastTimeRef.current = currentTime;
      rafRef.current = requestAnimationFrame(measurePerformance);
    };

    rafRef.current = requestAnimationFrame(measurePerformance);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [show, capability, isLowEnd, isHighEnd]);

  if (!show || process.env.NODE_ENV === 'production') {
    return null;
  }

  const fpsColor =
    metrics.fps < 30 ? 'text-red-500' : metrics.fps < 45 ? 'text-yellow-400' : 'text-green-500';
  const memoryColor =
    metrics.memoryUsage && metrics.memoryUsage > 0.8 ? 'text-red-500' : 'text-white';

  return (
    <div className="fixed bottom-4 right-4 z-[9999] rounded-lg border border-emerald-500/30 bg-black/80 p-3 font-mono text-xs text-emerald-400 backdrop-blur-sm">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-white/70">FPS:</span>
          <span className={fpsColor}>{metrics.fps}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/70">Avg:</span>
          <span className={fpsColor}>{metrics.avgFps}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/70">Frame:</span>
          <span className="text-white">{metrics.frameTime.toFixed(2)}ms</span>
        </div>
        {metrics.memoryUsage && (
          <div className="flex items-center justify-between">
            <span className="text-white/70">Memory:</span>
            <span className={memoryColor}>{(metrics.memoryUsage * 100).toFixed(1)}%</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-white/70">Device:</span>
          <span className="text-cyan-400">{metrics.deviceCapability}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/70">Quality:</span>
          <span className="text-emerald-400">{metrics.animationQuality}</span>
        </div>
        {metrics.isThrottled && <div className="font-semibold text-red-500">THROTTLED</div>}
        {accessibility.prefersReducedMotion && (
          <div className="font-semibold text-yellow-400">REDUCED MOTION</div>
        )}
      </div>
    </div>
  );
}

/**
 * Performance Warning Banner
 *
 * Shows warnings when performance issues are detected
 */
export function PerformanceWarning() {
  const deviceCapabilities = useDeviceCapabilities();
  const { isLowEnd } = deviceCapabilities;

  if (!isLowEnd) {
    return null;
  }

  return (
    <div className="fixed left-1/2 top-4 z-[9999] -translate-x-1/2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs text-yellow-300 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 animate-pulse rounded-full bg-yellow-400" />
        <span>Performance optimized for your device. Some animations may be reduced.</span>
      </div>
    </div>
  );
}

/**
 * Performance Logger
 *
 * Logs performance metrics to console for debugging
 */
export function usePerformanceLogger(componentName: string) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const start = performance.now();

    return () => {
      const duration = performance.now() - start;
      console.log(`[Performance] ${componentName} render: ${duration.toFixed(2)}ms`);
    };
  }, [componentName]);
}

/**
 * Web Vitals Reporter
 *
 * Reports Core Web Vitals metrics
 */
export function WebVitalsReporter() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    // Report Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('[Web Vitals] LCP:', lastEntry.startTime.toFixed(2), 'ms');
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // Report First Input Delay (FID)
    const fidObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        const fidEntry = entry as PerformanceEventTiming;
        console.log('[Web Vitals] FID:', fidEntry.processingStart - fidEntry.startTime, 'ms');
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Report Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const layoutShiftEntry = entry as LayoutShiftEntry;
        if (!layoutShiftEntry.hadRecentInput) {
          clsValue += layoutShiftEntry.value;
          console.log('[Web Vitals] CLS:', clsValue.toFixed(4));
        }
      }
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });

    return () => {
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
    };
  }, []);

  return null;
}

export function LandingDevTools() {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      <PerformanceMonitor show={true} />
      <PerformanceWarning />
      <WebVitalsReporter />
    </>
  );
}
