/**
 * Performance Monitoring Utilities
 *
 * Track animation performance and adjust settings dynamically
 */

'use client';

import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  fps: number;
  avgFps: number;
  frameTime: number;
  memoryUsage: number | null;
  isThrottled: boolean;
}

interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

/**
 * Performance monitor hook
 * Tracks FPS and adjusts animation quality dynamically
 */
export function usePerformanceMonitor(
  onThrottle?: (metrics: PerformanceMetrics) => void
): PerformanceMetrics {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    avgFps: 60,
    frameTime: 16.67,
    memoryUsage: null,
    isThrottled: false,
  });

  const fpsHistoryRef = useRef<number[]>([]);
  const rafIdRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    let lastFrameTime = performance.now();

    const measurePerformance = (currentTime: number) => {
      const deltaTime = currentTime - lastFrameTime;
      const currentFps = 1000 / deltaTime;

      // Update FPS history (keep last 60 frames)
      fpsHistoryRef.current.push(currentFps);
      if (fpsHistoryRef.current.length > 60) {
        fpsHistoryRef.current.shift();
      }

      // Calculate average FPS
      const avgFps =
        fpsHistoryRef.current.reduce((sum, fps) => sum + fps, 0) / fpsHistoryRef.current.length;

      // Check if throttled (consistently below 30 FPS)
      const isThrottled = avgFps < 30 && fpsHistoryRef.current.length >= 30;

      // Get memory usage if available
      let memoryUsage = null;
      const perf = performance as PerformanceWithMemory;
      if (perf.memory) {
        const memory = perf.memory;
        memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      }

      const newMetrics: PerformanceMetrics = {
        fps: Math.round(currentFps),
        avgFps: Math.round(avgFps),
        frameTime: deltaTime,
        memoryUsage,
        isThrottled,
      };

      setMetrics(newMetrics);

      // Notify if throttled
      if (isThrottled && onThrottle) {
        onThrottle(newMetrics);
      }

      lastFrameTime = currentTime;
      rafIdRef.current = requestAnimationFrame(measurePerformance);
    };

    rafIdRef.current = requestAnimationFrame(measurePerformance);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [onThrottle]);

  return metrics;
}

/**
 * Adaptive performance manager
 * Automatically reduces animation quality when performance drops
 */
export function useAdaptivePerformance() {
  const [qualityLevel, setQualityLevel] = useState<'high' | 'medium' | 'low'>('high');
  const throttleCountRef = useRef(0);

  const metrics = usePerformanceMonitor(() => {
    // Increment throttle counter
    throttleCountRef.current++;

    // After 3 seconds of poor performance, reduce quality
    if (throttleCountRef.current > 180) {
      // 60fps * 3 seconds
      if (qualityLevel === 'high') {
        setQualityLevel('medium');
        console.warn('[Performance] Reducing animation quality to medium');
      } else if (qualityLevel === 'medium') {
        setQualityLevel('low');
        console.warn('[Performance] Reducing animation quality to low');
      }
      throttleCountRef.current = 0;
    }
  });

  // Reset throttle counter when performance improves
  useEffect(() => {
    if (!metrics.isThrottled) {
      throttleCountRef.current = 0;
    }
  }, [metrics.isThrottled]);

  return {
    qualityLevel,
    metrics,
    forceQuality: (level: 'high' | 'medium' | 'low') => setQualityLevel(level),
  };
}

/**
 * FPS Display Component for Development
 */
export function FPSMonitor({ show = false }: { show?: boolean }) {
  const metrics = usePerformanceMonitor();

  if (!show || process.env.NODE_ENV === 'production') {
    return null;
  }

  const fpsColor = metrics.fps < 30 ? 'text-red-500' : 'text-green-500';

  return (
    <div className="fixed bottom-4 right-4 z-[9999] rounded-lg border border-emerald-500/30 bg-black/80 p-3 font-mono text-xs text-emerald-400 backdrop-blur-sm">
      <div className="space-y-1">
        <div>
          FPS: <span className={fpsColor}>{metrics.fps}</span>
        </div>
        <div>Avg: {metrics.avgFps}</div>
        <div>Frame: {metrics.frameTime.toFixed(2)}ms</div>
        {metrics.memoryUsage && <div>Memory: {(metrics.memoryUsage * 100).toFixed(1)}%</div>}
        {metrics.isThrottled && <div className="text-red-500">THROTTLED</div>}
      </div>
    </div>
  );
}

/**
 * Log performance metrics to console
 */
export function logPerformanceMetrics(label: string, start: number) {
  const duration = performance.now() - start;
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
  }
}

/**
 * Measure component render time
 */
export function useRenderTime(componentName: string) {
  useEffect(() => {
    const start = performance.now();
    return () => {
      logPerformanceMetrics(`${componentName} render`, start);
    };
  });
}

/**
 * Debounce for performance-intensive operations
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttle for scroll/resize handlers
 */
export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(0);

  useEffect(() => {
    const now = Date.now();
    const timeUntilNextRun = Math.max(lastExecuted.current + interval - now, 0);
    const timerId = setTimeout(() => {
      lastExecuted.current = Date.now();
      setThrottledValue(value);
    }, timeUntilNextRun);

    return () => clearTimeout(timerId);
  }, [value, interval]);

  return throttledValue;
}
