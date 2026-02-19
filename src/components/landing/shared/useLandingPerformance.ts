'use client';

import { useMemo } from 'react';
import { useDeviceCapability } from '@/lib/animations/device-capability';

type VisualTier = 'high' | 'mid' | 'low';

function supportsWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch {
    return false;
  }
}

export function useLandingPerformance() {
  const device = useDeviceCapability();

  return useMemo(() => {
    const webgl = supportsWebGL();
    const mobile = device.isMobile;
    const lowNetwork = device.connectionSpeed === 'slow';
    const cores = device.cores || 4;
    const memory = device.memory;
    const prefersReducedMotion = device.prefersReducedMotion;

    // Prefer practical capability checks over strict scoring so desktop WebGL isn't
    // incorrectly pushed to fallback mode when memory/network APIs are unavailable.
    const lowHardware = cores <= 2 || (memory !== null && memory <= 2);
    const mediumHardware = cores <= 4 || (memory !== null && memory <= 4);

    let tier: VisualTier = 'high';
    if (!webgl || lowNetwork || lowHardware) {
      tier = 'low';
    } else if (mobile || mediumHardware || device.capability === 'medium') {
      tier = 'mid';
    }

    const canRender3D = webgl;

    return {
      tier,
      enableFull3D: canRender3D && tier === 'high' && !mobile && !prefersReducedMotion,
      enableLite3D: canRender3D,
      useVideoFallback: !canRender3D,
      prefersReducedMotion,
    };
  }, [device]);
}
