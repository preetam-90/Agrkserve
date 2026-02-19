/**
 * Example: GSAP Scroll Animation Integration
 *
 * Demonstrates how to use GSAP ScrollTrigger in existing components
 */

'use client';

import { useRef } from 'react';
import { useGSAPAnimation } from '@/lib/animations/gsap-context';

function GSAPScrollExample() {
  const sectionRef = useRef<HTMLDivElement>(null);

  // GSAP scroll-triggered animation
  useGSAPAnimation((gsap) => {
    if (!sectionRef.current) return;

    // Fade in on scroll
    gsap.from(sectionRef.current.querySelectorAll('.fade-in'), {
      opacity: 0,
      y: 100,
      duration: 1,
      stagger: 0.2,
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
      },
    });

    // Parallax effect
    gsap.to(sectionRef.current.querySelector('.parallax'), {
      yPercent: -30,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });

    // Cleanup handled automatically by useGSAPAnimation
  }, []);

  return (
    <div ref={sectionRef} className="min-h-screen py-20">
      <div className="fade-in">
        <h2 className="text-4xl font-bold">Scroll-Triggered Content</h2>
      </div>
      <div className="fade-in mt-8">
        <p>This fades in as you scroll</p>
      </div>
      <div className="parallax mt-16">
        <div className="h-64 w-64 rounded-lg bg-emerald-500" />
      </div>
    </div>
  );
}
