// Design Tokens for Landing Page Redesign

export const colors = {
  primary: {
    dark: '#0f3d2e',      // Deep agricultural green
    DEFAULT: '#16a34a',   // Green-600
    light: '#22c55e',     // Green-500
  },
  accent: {
    lime: '#84cc16',      // Lime-500 for CTAs
    yellow: '#fbbf24',    // Yellow-400 for highlights
  },
  earth: {
    sand: '#fef3c7',      // Amber-100
    beige: '#fef3c7',     // Amber-100
    brown: '#78350f',     // Amber-900
  },
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    800: '#262626',
    900: '#171717',
  }
} as const;

export const typography = {
  hero: {
    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
    fontWeight: 700,
    lineHeight: 1.1,
  },
  h2: {
    fontSize: 'clamp(2rem, 4vw, 3rem)',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  body: {
    fontSize: '1.125rem',
    lineHeight: 1.7,
  },
} as const;

export const spacing = {
  section: {
    mobile: '5rem',    // 80px
    desktop: '7.5rem', // 120px
  },
  container: {
    maxWidth: '1280px',
    padding: {
      mobile: '1rem',
      desktop: '2rem',
    },
  },
} as const;

export const borderRadius = {
  card: '1rem',      // 16px
  button: '0.75rem', // 12px
  badge: '9999px',   // pill shape
  large: '1.5rem',   // 24px
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  glow: '0 0 20px rgb(34 197 94 / 0.3)', // green glow
} as const;

export const timing = {
  fast: '150ms',
  DEFAULT: '300ms',
  slow: '600ms',
  easing: {
    easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
    easeIn: 'cubic-bezier(0.7, 0, 0.84, 0)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const;
