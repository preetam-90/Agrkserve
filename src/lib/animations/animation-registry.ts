/**
 * Animation Library Selection Matrix
 *
 * Decision tree for choosing the right animation library based on use case
 */

export const AnimationLibrary = {
  GSAP: 'gsap',
  FRAMER_MOTION: 'framer-motion',
  CSS: 'css',
  THREE: 'three',
} as const;

export type AnimationLibraryType = (typeof AnimationLibrary)[keyof typeof AnimationLibrary];

export interface AnimationUseCase {
  library: AnimationLibraryType;
  rationale: string;
  performance: 'high' | 'medium' | 'low';
  complexity: 'simple' | 'moderate' | 'complex';
  mobileSupport: 'excellent' | 'good' | 'fair' | 'poor';
}

/**
 * Animation selection matrix based on use case
 */
export const ANIMATION_USE_CASES: Record<string, AnimationUseCase> = {
  // Framer Motion - Declarative React animations
  uiTransitions: {
    library: AnimationLibrary.FRAMER_MOTION,
    rationale: 'Declarative, React-first, excellent for component transitions',
    performance: 'high',
    complexity: 'simple',
    mobileSupport: 'excellent',
  },
  pageTransitions: {
    library: AnimationLibrary.FRAMER_MOTION,
    rationale: 'Built-in layout animations, gesture support',
    performance: 'high',
    complexity: 'moderate',
    mobileSupport: 'excellent',
  },
  microInteractions: {
    library: AnimationLibrary.FRAMER_MOTION,
    rationale: 'Drag, hover, tap gestures with minimal code',
    performance: 'high',
    complexity: 'simple',
    mobileSupport: 'excellent',
  },

  // GSAP - Complex timeline animations
  scrollAnimations: {
    library: AnimationLibrary.GSAP,
    rationale: 'ScrollTrigger is unmatched for scroll-linked animations',
    performance: 'high',
    complexity: 'moderate',
    mobileSupport: 'good',
  },
  complexTimelines: {
    library: AnimationLibrary.GSAP,
    rationale: 'Fine-grained control over animation sequences',
    performance: 'high',
    complexity: 'complex',
    mobileSupport: 'good',
  },
  svgMorphing: {
    library: AnimationLibrary.GSAP,
    rationale: 'MorphSVG plugin for advanced path animations',
    performance: 'medium',
    complexity: 'complex',
    mobileSupport: 'good',
  },
  textAnimations: {
    library: AnimationLibrary.GSAP,
    rationale: 'SplitText plugin for character/word animations',
    performance: 'medium',
    complexity: 'moderate',
    mobileSupport: 'fair',
  },

  // CSS - Maximum performance
  simpleHoverEffects: {
    library: AnimationLibrary.CSS,
    rationale: 'GPU-accelerated, no JS overhead',
    performance: 'high',
    complexity: 'simple',
    mobileSupport: 'excellent',
  },
  spinners: {
    library: AnimationLibrary.CSS,
    rationale: 'Infinite animations best handled by CSS',
    performance: 'high',
    complexity: 'simple',
    mobileSupport: 'excellent',
  },
  gradientAnimations: {
    library: AnimationLibrary.CSS,
    rationale: 'Native CSS animations for background effects',
    performance: 'high',
    complexity: 'simple',
    mobileSupport: 'excellent',
  },

  // Three.js - 3D rendering
  productShowcase3D: {
    library: AnimationLibrary.THREE,
    rationale: '3D model viewing for equipment showcase',
    performance: 'medium',
    complexity: 'complex',
    mobileSupport: 'fair',
  },
  interactive3D: {
    library: AnimationLibrary.THREE,
    rationale: 'User-controllable 3D experiences',
    performance: 'low',
    complexity: 'complex',
    mobileSupport: 'poor',
  },
};

/**
 * Get recommended library for a specific animation need
 */
export function getRecommendedLibrary(useCase: keyof typeof ANIMATION_USE_CASES): AnimationUseCase {
  return ANIMATION_USE_CASES[useCase];
}

/**
 * Check if animation should be enabled based on device capability
 */
export function shouldEnableAnimation(
  useCase: keyof typeof ANIMATION_USE_CASES,
  deviceCapability: 'low' | 'medium' | 'high'
): boolean {
  const animation = ANIMATION_USE_CASES[useCase];

  // Disable complex animations on low-end devices
  if (deviceCapability === 'low') {
    return animation.complexity === 'simple' && animation.performance === 'high';
  }

  // Enable most animations on medium devices, except heavy 3D
  if (deviceCapability === 'medium') {
    return animation.library !== AnimationLibrary.THREE || animation.performance !== 'low';
  }

  // Enable all animations on high-end devices
  return true;
}
