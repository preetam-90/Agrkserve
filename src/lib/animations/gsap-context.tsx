/**
 * GSAP Context Provider for Next.js 16 App Router
 *
 * Provides GSAP context and utilities for client components
 */

'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type DependencyList,
  type ReactNode,
} from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useDeviceCapability } from './device-capability';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface GSAPContextValue {
  gsap: typeof gsap;
  ScrollTrigger: typeof ScrollTrigger;
}

const GSAPContext = createContext<GSAPContextValue | null>(null);

/**
 * GSAP Provider Component
 */
export function GSAPProvider({ children }: { children: ReactNode }) {
  const deviceInfo = useDeviceCapability();

  useEffect(() => {
    // Configure GSAP defaults based on device capability
    gsap.defaults({
      ease: 'power2.out',
      duration: deviceInfo.prefersReducedMotion ? 0 : 0.6,
    });

    // Configure ScrollTrigger
    ScrollTrigger.config({
      // Reduce markers in production
      ignoreMobileResize: true,
      // Better mobile performance
      autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load',
    });

    // Disable animations if reduced motion is preferred
    if (deviceInfo.prefersReducedMotion) {
      gsap.globalTimeline.timeScale(0);
    }

    return () => {
      // Cleanup all ScrollTriggers on unmount
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [deviceInfo.prefersReducedMotion]);

  const value: GSAPContextValue = {
    gsap,
    ScrollTrigger,
  };

  return <GSAPContext.Provider value={value}>{children}</GSAPContext.Provider>;
}

/**
 * Hook to access GSAP context
 */
export function useGSAP() {
  const context = useContext(GSAPContext);
  if (!context) {
    throw new Error('useGSAP must be used within GSAPProvider');
  }
  return context;
}

/**
 * Custom hook for GSAP animations with automatic cleanup
 *
 * @example
 * useGSAPAnimation((gsap, ScrollTrigger) => {
 *   gsap.from('.element', { opacity: 0, y: 50 });
 * }, [dependencies]);
 */
export function useGSAPAnimation(
  callback: (
    gsapInstance: typeof gsap,
    scrollTriggerInstance: typeof ScrollTrigger
  ) => void | (() => void),
  dependencies: DependencyList = []
) {
  const { gsap: gsapInstance, ScrollTrigger: scrollTriggerInstance } = useGSAP();
  const contextRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    // Create GSAP context for automatic cleanup
    contextRef.current = gsapInstance.context(() => {
      const cleanup = callback(gsapInstance, scrollTriggerInstance);
      return cleanup;
    });

    return () => {
      contextRef.current?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gsapInstance, scrollTriggerInstance, ...dependencies]);
}

/**
 * Hook for scroll-triggered animations
 */
export function useScrollAnimation(
  trigger: string | Element,
  animation: (gsapInstance: typeof gsap) => void,
  options: ScrollTrigger.Vars = {}
) {
  const { gsap: gsapInstance, ScrollTrigger: scrollTriggerInstance } = useGSAP();
  const deviceInfo = useDeviceCapability();

  useEffect(() => {
    if (deviceInfo.prefersReducedMotion) return;

    const ctx = gsapInstance.context(() => {
      scrollTriggerInstance.create({
        trigger,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
        ...options,
        onEnter: () => animation(gsapInstance),
      });
    });

    return () => ctx.revert();
  }, [
    trigger,
    animation,
    options,
    deviceInfo.prefersReducedMotion,
    gsapInstance,
    scrollTriggerInstance,
  ]);
}

/**
 * Utility to create scroll-linked parallax effect
 */
export function createParallax(
  element: string | Element,
  speed: number = 0.5,
  options: Partial<ScrollTrigger.Vars> = {}
) {
  return gsap.to(element, {
    yPercent: speed * 100,
    ease: 'none',
    scrollTrigger: {
      trigger: element,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      ...options,
    },
  });
}

/**
 * Stagger animation helper
 */
export function staggerAnimation(
  selector: string,
  animationProps: gsap.TweenVars,
  staggerAmount: number = 0.1
) {
  return gsap.from(selector, {
    ...animationProps,
    stagger: staggerAmount,
  });
}
