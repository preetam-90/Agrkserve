'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

export function Preloader() {
  const [visible, setVisible] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.eventCallback('onComplete', () => {
        window.setTimeout(() => setVisible(false), 120);
      });

      // Scene 0: cinematic logo trace over grain, then dissolve to hero.
      tl.fromTo('.preloader-line', { scaleX: 0 }, { scaleX: 1, transformOrigin: 'left center', duration: 1.1, ease: 'power2.out' })
        .fromTo('.preloader-word', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.6')
        .to('.preloader-overlay', { opacity: 0, duration: 0.8, ease: 'power2.inOut' }, '+=0.2');
    }, ref);

    return () => ctx.revert();
  }, []);

  if (!visible) return null;

  return (
    <div ref={ref} className="preloader-overlay fixed inset-0 z-[140] bg-black">
      <div className="absolute inset-0 [background-image:radial-gradient(circle,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:4px_4px] opacity-35" />
      <div className="relative flex h-full flex-col items-center justify-center">
        <div className="preloader-line h-[2px] w-48 bg-gradient-to-r from-emerald-300 via-emerald-500 to-cyan-300" />
        <p className="preloader-word mt-5 text-xs uppercase tracking-[0.34em] text-emerald-100">AGRISERVE</p>
      </div>
    </div>
  );
}
