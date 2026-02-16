/**
 * Critical CSS for Landing Page
 *
 * Inlines essential styles for above-the-fold content to achieve sub-1s FCP.
 * This includes: Navigation, Hero text, CTA buttons, and video placeholder.
 *
 * These styles are extracted from Tailwind classes and optimized for immediate rendering.
 */

export function CriticalCSS() {
  return (
    <style
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: `
/* Critical CSS for Landing Page - Sub-1s FCP */

/* Navigation Base */
header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 0.75rem 1rem;
}

@media (min-width: 768px) {
  header { padding: 0.75rem 1.5rem; }
}

@media (min-width: 1024px) {
  header { padding: 0.75rem 2rem; }
}

/* Navigation Container */
nav {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 80rem;
  margin: 0 auto;
  padding: 0.625rem 1rem;
  border-radius: 1rem;
  border: 1px solid rgba(110, 231, 183, 0.12);
  background: rgba(7, 18, 13, 0.36);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

/* Logo */
nav a:first-child {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: white;
}

/* Logo Icon */
nav a:first-child div {
  position: relative;
  display: flex;
  height: 2.5rem;
  width: 2.5rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  border: 1px solid rgba(110, 231, 183, 0.3);
  background: linear-gradient(to bottom right, rgba(52, 211, 153, 0.35), rgba(16, 185, 129, 0.15), rgba(34, 211, 238, 0.2));
  box-shadow: 0 10px 32px rgba(74, 222, 128, 0.35);
}

/* Hero Section */
#hero-chapter {
  position: relative;
  min-height: 90vh;
  overflow: hidden;
  background: #040806;
}

/* Video Background */
.hero-video-layer {
  position: absolute;
  inset: 0;
  transform: translateZ(0);
  will-change: transform;
}

.hero-video-layer video,
.hero-video-layer div {
  position: absolute;
  inset: 0;
  height: 100%;
  width: 100%;
  object-fit: cover;
}

/* Video Overlay */
.hero-video-layer + div {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
}

/* Hero Content */
.hero-foreground-layer {
  position: relative;
  z-index: 20;
  display: grid;
  width: 100%;
  max-width: var(--landing-max-width, 1440px);
  margin: 0 auto;
  padding: max(5.5rem, 10vh) var(--landing-padding-x, 1.5rem) max(7rem, 12vh);
  min-height: 90vh;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 1024px) {
  .hero-foreground-layer {
    grid-template-columns: 1.03fr 0.97fr;
    align-items: end;
    padding-top: 9rem;
  }
}

/* Hero Kicker Badge */
.hero-kicker {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 0.5rem;
  border-radius: 9999px;
  border: 1px solid rgba(110, 231, 183, 0.2);
  background: rgba(0, 0, 0, 0.35);
  padding: 0.5rem 1rem;
  margin-bottom: 1.75rem;
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

/* Hero Headline */
h1 {
  margin-bottom: 1.5rem;
}

.hero-headline-line {
  display: block;
  overflow: hidden;
  line-height: 0.9;
  text-transform: uppercase;
}

.hero-headline-line:first-child {
  font-size: clamp(2.1rem, 7.6vw, 5.8rem);
  font-weight: 900;
  letter-spacing: -0.045em;
  color: white;
}

.hero-headline-line:nth-child(2) {
  font-size: clamp(2.1rem, 7.1vw, 5.2rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  background: linear-gradient(96deg, #d9f99d 0%, #34d399 45%, #2dd4bf 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Hero Subcopy */
.hero-subcopy {
  max-width: 48rem;
  margin-bottom: 2.25rem;
  font-size: 1rem;
  line-height: 1.625;
  color: rgba(255, 255, 255, 0.8);
}

@media (min-width: 768px) {
  .hero-subcopy {
    font-size: 1.25rem;
    line-height: 1.75;
  }
}

/* CTA Buttons */
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 2.5rem;
}

@media (min-width: 768px) {
  .hero-actions { gap: 1rem; }
}

/* Primary CTA */
.hero-action a,
.hero-action button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 9999px;
  border: 1px solid rgba(110, 231, 183, 0.15);
  background: linear-gradient(to right, #34d399, #bef264, #99f6e4);
  padding: 0.875rem 1.75rem;
  font-size: 0.875rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #052818;
  box-shadow: 0 22px 80px rgba(74, 222, 128, 0.4);
  transition: box-shadow 0.3s;
}

.hero-action a:hover,
.hero-action button:hover {
  box-shadow: 0 28px 100px rgba(74, 222, 128, 0.5);
}

/* Secondary CTA */
.hero-action:nth-child(2) a,
.hero-action:nth-child(3) a {
  background: rgba(0, 0, 0, 0.35);
  color: white;
  border-color: rgba(110, 231, 183, 0.3);
  box-shadow: none;
}

/* Content Visibility for Performance */
section[id="how-it-works"],
section[id="pricing"],
section[id="labour-network"],
section[id="provider-network"],
section[id="future-vision"] {
  content-visibility: auto;
  contain-intrinsic-size: 600px;
}

/* Loading States */
.chapter-skeleton {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #030705 0%, #040806 100%);
}

/* Font Display Swap */
@font-face {
  font-display: swap;
}
        `,
      }}
    />
  );
}

export default CriticalCSS;
