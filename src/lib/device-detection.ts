/**
 * Device Capability Detection
 *
 * Detects device performance characteristics for adaptive rendering
 */

import { useSyncExternalStore } from 'react';

interface DeviceCapabilities {
  isMobile: boolean;
  isTablet: boolean;
  isLowEnd: boolean;
  isHighEnd: boolean;
  capability: 'low' | 'medium' | 'high';
  memory: number | null;
  cores: number | null;
  connection: string;
  supportsWebGL: boolean;
}

type NetworkInfo = {
  effectiveType?: string;
  addEventListener?: (event: 'change', listener: () => void) => void;
  removeEventListener?: (event: 'change', listener: () => void) => void;
};

const DEFAULT_CAPABILITIES: DeviceCapabilities = {
  isMobile: false,
  isTablet: false,
  isLowEnd: false,
  isHighEnd: false,
  capability: 'medium',
  memory: null,
  cores: null,
  connection: 'unknown',
  supportsWebGL: false,
};

let cachedCapabilities: DeviceCapabilities = DEFAULT_CAPABILITIES;
let hasInitialMeasurement = false;
let cachedWebGLSupport: boolean | null = null;
let listenersInitialized = false;
let resizeTimeout: number | null = null;
const subscribers = new Set<() => void>();
let removeGlobalListeners: (() => void) | null = null;

function isBrowser() {
  return typeof window !== 'undefined';
}

function getNetworkInformation(): NetworkInfo | null {
  if (!isBrowser()) {
    return null;
  }

  const nav = navigator as Navigator & {
    connection?: NetworkInfo;
    mozConnection?: NetworkInfo;
    webkitConnection?: NetworkInfo;
  };
  return nav.connection ?? nav.mozConnection ?? nav.webkitConnection ?? null;
}

function detectWebGLSupport(): boolean {
  if (!isBrowser()) {
    return false;
  }

  if (cachedWebGLSupport !== null) {
    return cachedWebGLSupport;
  }

  try {
    const canvas = document.createElement('canvas');
    cachedWebGLSupport = Boolean(
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    );
  } catch {
    cachedWebGLSupport = false;
  }

  return cachedWebGLSupport;
}

function measureCapabilities(): DeviceCapabilities {
  if (!isBrowser()) {
    return DEFAULT_CAPABILITIES;
  }

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    memory?: { jsHeapSizeLimit?: number };
  };
  const userAgent = nav.userAgent || '';

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);

  const deviceMemoryGB = nav.deviceMemory ?? null;
  const heapLimitBytes = nav.memory?.jsHeapSizeLimit ?? null;
  const memory = heapLimitBytes ?? (deviceMemoryGB ? deviceMemoryGB * 1024 ** 3 : null);
  const memoryGB = deviceMemoryGB ?? (heapLimitBytes ? heapLimitBytes / 1024 ** 3 : null);

  const cores = nav.hardwareConcurrency ?? null;
  const connection = getNetworkInformation()?.effectiveType ?? 'unknown';
  const supportsWebGL = detectWebGLSupport();

  const coresCount = cores ?? 2;
  const isSlowConnection = connection === 'slow-2g' || connection === '2g' || connection === '3g';

  let capability: 'low' | 'medium' | 'high' = 'medium';
  let isLowEnd = false;
  let isHighEnd = false;

  if ((memoryGB !== null && memoryGB < 2) || coresCount < 4 || isSlowConnection || !supportsWebGL) {
    capability = 'low';
    isLowEnd = true;
  } else if (
    memoryGB !== null &&
    memoryGB >= 4 &&
    coresCount >= 6 &&
    connection !== 'slow-2g' &&
    connection !== '2g'
  ) {
    capability = 'high';
    isHighEnd = true;
  }

  return {
    isMobile,
    isTablet,
    isLowEnd,
    isHighEnd,
    capability,
    memory,
    cores,
    connection,
    supportsWebGL,
  };
}

function capabilitiesEqual(a: DeviceCapabilities, b: DeviceCapabilities): boolean {
  return (
    a.isMobile === b.isMobile &&
    a.isTablet === b.isTablet &&
    a.isLowEnd === b.isLowEnd &&
    a.isHighEnd === b.isHighEnd &&
    a.capability === b.capability &&
    a.memory === b.memory &&
    a.cores === b.cores &&
    a.connection === b.connection &&
    a.supportsWebGL === b.supportsWebGL
  );
}

function notifySubscribers() {
  subscribers.forEach((callback) => callback());
}

function updateCapabilities() {
  const nextCapabilities = measureCapabilities();
  if (capabilitiesEqual(cachedCapabilities, nextCapabilities)) {
    return;
  }
  cachedCapabilities = nextCapabilities;
  notifySubscribers();
}

function initializeGlobalListeners() {
  if (!isBrowser() || listenersInitialized) {
    return;
  }

  listenersInitialized = true;
  const handleResize = () => {
    if (resizeTimeout) {
      window.clearTimeout(resizeTimeout);
    }
    resizeTimeout = window.setTimeout(updateCapabilities, 150);
  };
  const handleChange = () => {
    updateCapabilities();
  };

  const connection = getNetworkInformation();
  window.addEventListener('resize', handleResize, { passive: true });
  window.addEventListener('orientationchange', handleResize, { passive: true });
  connection?.addEventListener?.('change', handleChange);

  removeGlobalListeners = () => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleResize);
    connection?.removeEventListener?.('change', handleChange);
    if (resizeTimeout) {
      window.clearTimeout(resizeTimeout);
      resizeTimeout = null;
    }
    listenersInitialized = false;
    removeGlobalListeners = null;
  };
}

function getSnapshot() {
  return getDeviceCapabilities();
}

function getServerSnapshot() {
  return DEFAULT_CAPABILITIES;
}

function subscribe(callback: () => void) {
  if (!isBrowser()) {
    return () => {};
  }

  subscribers.add(callback);
  initializeGlobalListeners();

  return () => {
    subscribers.delete(callback);
    if (subscribers.size === 0 && removeGlobalListeners) {
      removeGlobalListeners();
    }
  };
}

/**
 * Detect device capabilities for performance optimization
 */
function getDeviceCapabilities(): DeviceCapabilities {
  if (!isBrowser()) {
    return DEFAULT_CAPABILITIES;
  }

  if (!hasInitialMeasurement) {
    cachedCapabilities = measureCapabilities();
    hasInitialMeasurement = true;
  }

  return cachedCapabilities;
}

/**
 * Hook for device capability detection
 */
export function useDeviceCapabilities(): DeviceCapabilities {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Check if animations should be reduced based on device capability
 */
function shouldReduceAnimations(): boolean {
  // Check user preference
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return true;
  }

  // Check device capability
  const capabilities = getDeviceCapabilities();

  // Reduce animations on low-end devices
  if (capabilities.isLowEnd) {
    return true;
  }

  return false;
}

/**
 * Get appropriate animation duration based on device capability
 */
function getAnimationDuration(baseDuration: number): number {
  const capabilities = getDeviceCapabilities();

  if (capabilities.isLowEnd) {
    return baseDuration * 1.5; // Slower animations on low-end devices
  }

  if (capabilities.isHighEnd) {
    return baseDuration * 0.8; // Faster animations on high-end devices
  }

  return baseDuration;
}

/**
 * Check if 3D rendering should be enabled
 */
export function shouldEnable3D(): boolean {
  const capabilities = getDeviceCapabilities();

  // Disable 3D on low-end devices or if WebGL is not supported
  if (!capabilities.supportsWebGL || capabilities.isLowEnd) {
    return false;
  }

  // Check user preference for motion
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return false;
  }

  return true;
}

/**
 * Check if video backgrounds should be enabled
 */
function shouldEnableVideoBackground(): boolean {
  const capabilities = getDeviceCapabilities();

  // Disable video on low-end devices or slow connections
  if (capabilities.isLowEnd) {
    return false;
  }

  // Check connection type
  if (capabilities.connection === 'slow-2g' || capabilities.connection === '2g') {
    return false;
  }

  // Check user preference
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return false;
  }

  return true;
}

/**
 * Get appropriate image quality based on device capability
 */
function getImageQuality(): 'low' | 'medium' | 'high' {
  const capabilities = getDeviceCapabilities();

  if (capabilities.isLowEnd) {
    return 'low';
  }

  if (capabilities.isHighEnd) {
    return 'high';
  }

  return 'medium';
}

/**
 * Debounced capability check for performance
 */
function useDebouncedDeviceCapabilities(delay: number = 250): DeviceCapabilities {
  // Retained for API compatibility; updates are already debounced in the shared store.
  void delay;
  return useDeviceCapabilities();
}
