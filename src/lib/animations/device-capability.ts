/**
 * Device Capability Detection for Animation Optimization
 *
 * Detects device performance tier to adjust animation complexity
 */

import { useEffect, useState } from 'react';

export type DeviceCapability = 'low' | 'medium' | 'high';
export type ConnectionSpeed = 'slow' | 'medium' | 'fast';

interface NetworkConnectionInfo {
  effectiveType?: string;
  saveData?: boolean;
  addEventListener?: (type: 'change', listener: () => void) => void;
  removeEventListener?: (type: 'change', listener: () => void) => void;
}

interface DeviceNavigator extends Navigator {
  deviceMemory?: number;
  connection?: NetworkConnectionInfo;
}

interface DeviceInfo {
  capability: DeviceCapability;
  connectionSpeed: ConnectionSpeed;
  prefersReducedMotion: boolean;
  gpu: string | null;
  cores: number;
  memory: number | null;
  isMobile: boolean;
  isTouch: boolean;
}

const DEFAULT_DEVICE_INFO: DeviceInfo = {
  capability: 'medium',
  connectionSpeed: 'medium',
  prefersReducedMotion: false,
  gpu: null,
  cores: 4,
  memory: null,
  isMobile: false,
  isTouch: false,
};

/**
 * Detect device performance capability
 */
export function detectDeviceCapability(): DeviceInfo {
  if (typeof window === 'undefined') {
    return getDefaultDeviceInfo();
  }

  const nav = navigator as DeviceNavigator;
  const capability = calculateCapability(nav);
  const connectionSpeed = detectConnectionSpeed(nav);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    nav.userAgent
  );
  const isTouch = 'ontouchstart' in window || nav.maxTouchPoints > 0;

  return {
    capability,
    connectionSpeed,
    prefersReducedMotion,
    gpu: getGPUInfo(),
    cores: nav.hardwareConcurrency || 4,
    memory: nav.deviceMemory ?? null,
    isMobile,
    isTouch,
  };
}

/**
 * Calculate device capability tier
 */
function calculateCapability(nav: DeviceNavigator): DeviceCapability {
  const scores = {
    cores: 0,
    memory: 0,
    connection: 0,
    gpu: 0,
  };

  // CPU cores
  const cores = nav.hardwareConcurrency || 4;
  if (cores >= 8) scores.cores = 2;
  else if (cores >= 4) scores.cores = 1;

  // Device memory (GB)
  const memory = nav.deviceMemory ?? 0;
  if (memory >= 8) scores.memory = 2;
  else if (memory >= 4) scores.memory = 1;

  // Network connection
  const effectiveType = nav.connection?.effectiveType;
  if (effectiveType === '4g') scores.connection = 2;
  else if (effectiveType === '3g') scores.connection = 1;

  // GPU detection (basic)
  const gpu = getGPUInfo();
  if (gpu && (gpu.includes('Apple') || gpu.includes('Mali') || gpu.includes('Adreno'))) {
    scores.gpu = 1;
  }

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

  if (totalScore >= 5) return 'high';
  if (totalScore >= 3) return 'medium';
  return 'low';
}

/**
 * Detect connection speed
 */
function detectConnectionSpeed(nav: DeviceNavigator): ConnectionSpeed {
  const connection = nav.connection;
  if (!connection) return 'medium';

  const effectiveType = connection.effectiveType;
  const saveData = connection.saveData;

  if (saveData || effectiveType === 'slow-2g' || effectiveType === '2g') {
    return 'slow';
  }

  if (effectiveType === '4g') {
    return 'fast';
  }

  return 'medium';
}

/**
 * Get GPU information
 */
function getGPUInfo(): string | null {
  if (typeof document === 'undefined') return null;

  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl') ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);

    if (!gl) return null;

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return null;

    return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string;
  } catch {
    return null;
  }
}

/**
 * Default device info for SSR
 */
function getDefaultDeviceInfo(): DeviceInfo {
  return { ...DEFAULT_DEVICE_INFO };
}

/**
 * React hook for device capability
 */
export function useDeviceCapability(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => detectDeviceCapability());

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const nav = navigator as DeviceNavigator;
    const connection = nav.connection;
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = () => {
      setDeviceInfo(detectDeviceCapability());
    };

    connection?.addEventListener?.('change', handleChange);
    motionQuery.addEventListener('change', handleChange);

    return () => {
      connection?.removeEventListener?.('change', handleChange);
      motionQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return deviceInfo;
}

/**
 * Should enable heavy animations?
 */
export function shouldEnableHeavyAnimations(deviceInfo: DeviceInfo): boolean {
  if (deviceInfo.prefersReducedMotion) return false;
  if (deviceInfo.capability === 'low') return false;
  if (deviceInfo.connectionSpeed === 'slow') return false;
  return true;
}

/**
 * Should enable 3D rendering?
 */
export function shouldEnable3D(deviceInfo: DeviceInfo): boolean {
  if (!shouldEnableHeavyAnimations(deviceInfo)) return false;
  if (deviceInfo.capability === 'low') return false;
  if (deviceInfo.isMobile && deviceInfo.capability === 'medium') return false;
  return true;
}

/**
 * Get animation quality settings based on device
 */
export function getAnimationQuality(deviceInfo: DeviceInfo): {
  particleCount: number;
  shadowQuality: 'high' | 'medium' | 'low' | 'off';
  antialiasing: boolean;
  pixelRatio: number;
} {
  if (deviceInfo.capability === 'high') {
    return {
      particleCount: 50,
      shadowQuality: 'high',
      antialiasing: true,
      pixelRatio: Math.min(window.devicePixelRatio, 2),
    };
  }

  if (deviceInfo.capability === 'medium') {
    return {
      particleCount: 20,
      shadowQuality: 'medium',
      antialiasing: false,
      pixelRatio: 1,
    };
  }

  return {
    particleCount: 0,
    shadowQuality: 'off',
    antialiasing: false,
    pixelRatio: 1,
  };
}
