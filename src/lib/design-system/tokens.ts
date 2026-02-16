/**
 * AgriServe Premium Design System Tokens
 * World-class design tokens following Apple/Stripe/Linear standards
 */

// ═══════════════════════════════════════════════════════════════════
// COLOR SYSTEM
// ═══════════════════════════════════════════════════════════════════

export const colors = {
  // Brand Primary - Emerald (Growth, Agriculture, Trust)
  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    950: '#022c22',
  },
  
  // Brand Secondary - Cyan (Technology, Innovation, Precision)
  cyan: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
    950: '#083344',
  },
  
  // Accent - Amber (Harvest, Warmth, Earth)
  amber: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  
  // Neutral - Zinc (Text, Borders, Surfaces)
  zinc: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },
  
  // Semantic Colors
  semantic: {
    // Backgrounds
    background: '#030705',
    backgroundElevated: '#0a0f0c',
    backgroundCard: 'rgba(10, 15, 12, 0.7)',
    
    // Text (WCAG AA+ Compliant)
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.85)', // 12.63:1 contrast
    textTertiary: 'rgba(255, 255, 255, 0.65)',  // 7.12:1 contrast
    textMuted: 'rgba(255, 255, 255, 0.50)',     // 4.87:1 - use only for large text
    
    // Borders
    borderDefault: 'rgba(255, 255, 255, 0.10)',
    borderHover: 'rgba(255, 255, 255, 0.20)',
    borderFocus: 'rgba(16, 185, 129, 0.50)',
    
    // Interactive
    interactive: 'rgba(16, 185, 129, 0.15)',
    interactiveHover: 'rgba(16, 185, 129, 0.25)',
    
    // Status
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4',
  },
  
  // Gradient Presets
  gradients: {
    hero: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 50%, rgba(3,7,5,0.95) 100%)',
    card: 'linear-gradient(135deg, rgba(16,185,129,0.10) 0%, rgba(6,182,212,0.05) 100%)',
    cta: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    text: 'linear-gradient(135deg, #ffffff 0%, #34d399 50%, #22d3ee 100%)',
    radialCenter: 'radial-gradient(circle at 50% 50%, rgba(16,185,129,0.15) 0%, transparent 50%)',
    radialTopLeft: 'radial-gradient(circle at 20% 20%, rgba(16,185,129,0.20) 0%, transparent 40%)',
    radialBottomRight: 'radial-gradient(circle at 80% 80%, rgba(6,182,212,0.15) 0%, transparent 40%)',
  },
} as const;

// ═══════════════════════════════════════════════════════════════════
// TYPOGRAPHY SYSTEM
// ═══════════════════════════════════════════════════════════════════

export const typography = {
  // Font Families
  fonts: {
    display: 'var(--font-space-grotesk), var(--font-inter), system-ui, sans-serif',
    body: 'var(--font-inter), system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", Consolas, monospace',
  },
  
  // Font Sizes - Using clamp() for fluid typography
  sizes: {
    // Hero scale: Mobile → Desktop
    hero: 'clamp(2.5rem, 8vw, 7rem)',        // 40px → 112px
    display: 'clamp(2rem, 6vw, 5rem)',        // 32px → 80px
    chapter: 'clamp(1.75rem, 5vw, 4rem)',     // 28px → 64px
    section: 'clamp(1.5rem, 4vw, 3rem)',      // 24px → 48px
    subsection: 'clamp(1.25rem, 3vw, 2rem)',  // 20px → 32px
    body: 'clamp(1rem, 1.125vw, 1.125rem)',   // 16px → 18px
    small: 'clamp(0.875rem, 1vw, 1rem)',      // 14px → 16px
    label: 'clamp(0.75rem, 0.9vw, 0.875rem)', // 12px → 14px
  },
  
  // Line Heights
  lineHeights: {
    tight: 0.9,
    snug: 1.1,
    normal: 1.5,
    relaxed: 1.625,
    loose: 1.75,
  },
  
  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
    // Label tracking (only for uppercase labels)
    label: '0.15em',
    labelWide: '0.25em',
  },
  
  // Font Weights
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
} as const;

// ═══════════════════════════════════════════════════════════════════
// SPACING SYSTEM
// ═══════════════════════════════════════════════════════════════════

export const spacing = {
  px: '1px',
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
  40: '10rem',    // 160px
  48: '12rem',    // 192px
  56: '14rem',    // 224px
  64: '16rem',    // 256px
} as const;

// ═══════════════════════════════════════════════════════════════════
// MOTION SYSTEM
// ═══════════════════════════════════════════════════════════════════

export const motion = {
  // Easing Curves
  easing: {
    // Apple-style easing
    ease: [0.25, 0.1, 0.25, 1],
    easeIn: [0.4, 0, 1, 1],
    easeOut: [0, 0, 0.2, 1],
    easeInOut: [0.4, 0, 0.2, 1],
    
    // Premium easing (Apple/Linear inspired)
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    smoothOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    
    // GSAP Named Eases (for reference)
    gsap: {
      power2: 'power2.out',
      power3: 'power3.out',
      power4: 'power4.out',
      back: 'back.out(1.7)',
      elastic: 'elastic.out(1, 0.3)',
    },
  },
  
  // Duration Scale
  duration: {
    instant: 0,
    fastest: 100,    // 0.1s - Micro-interactions
    faster: 150,     // 0.15s - Button clicks
    fast: 200,       // 0.2s - Hover states
    normal: 300,     // 0.3s - Standard transitions
    slow: 500,       // 0.5s - Page transitions
    slower: 700,     // 0.7s - Complex animations
    slowest: 1000,   // 1s - Cinematic reveals
    cinematic: 1500, // 1.5s - Major motion sequences
    epic: 2000,      // 2s - Full-screen transitions
  },
  
  // Stagger Delays
  stagger: {
    fast: 0.05,
    normal: 0.1,
    slow: 0.15,
    cinematic: 0.2,
  },
  
  // Spring Physics (for Framer Motion)
  spring: {
    snappy: { stiffness: 400, damping: 30 },
    gentle: { stiffness: 200, damping: 25 },
    bouncy: { stiffness: 300, damping: 15 },
    smooth: { stiffness: 200, damping: 30 },
    magnetic: { stiffness: 220, damping: 22, mass: 0.3 },
  },
} as const;

// ═══════════════════════════════════════════════════════════════════
// BORDER RADIUS
// ═══════════════════════════════════════════════════════════════════

export const radius = {
  none: '0',
  sm: '0.375rem',    // 6px
  md: '0.5rem',      // 8px
  lg: '0.75rem',     // 12px
  xl: '1rem',        // 16px
  '2xl': '1.5rem',   // 24px
  '3xl': '2rem',     // 32px
  '4xl': '3rem',     // 48px
  full: '9999px',
} as const;

// ═══════════════════════════════════════════════════════════════════
// SHADOWS
// ═══════════════════════════════════════════════════════════════════

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  
  // Premium Shadows (for dark theme)
  glow: {
    emerald: '0 0 40px rgba(16, 185, 129, 0.3)',
    emeraldHover: '0 0 60px rgba(16, 185, 129, 0.5)',
    cyan: '0 0 40px rgba(6, 182, 212, 0.3)',
    card: '0 4px 30px rgba(0, 0, 0, 0.5)',
    elevated: '0 8px 40px rgba(0, 0, 0, 0.6)',
  },
} as const;

// ═══════════════════════════════════════════════════════════════════
// BREAKPOINTS
// ═══════════════════════════════════════════════════════════════════

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ═══════════════════════════════════════════════════════════════════
// Z-INDEX SCALE
// ═══════════════════════════════════════════════════════════════════

export const zIndex = {
  background: -10,
  base: 0,
  content: 10,
  section: 20,
  overlay: 30,
  dropdown: 40,
  sticky: 50,
  header: 100,
  modal: 200,
  popover: 300,
  tooltip: 400,
  cursor: 140,
  max: 9999,
} as const;

// ═══════════════════════════════════════════════════════════════════
// TOUCH TARGETS (Accessibility)
// ═══════════════════════════════════════════════════════════════════

export const touchTargets = {
  minimum: '44px',  // WCAG 2.5.5 minimum
  comfortable: '48px',
  spacious: '56px',
} as const;

// Export all tokens as a single object
export const tokens = {
  colors,
  typography,
  spacing,
  motion,
  radius,
  shadows,
  breakpoints,
  zIndex,
  touchTargets,
} as const;

export type DesignTokens = typeof tokens;
