'use client';

import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { safeGsapRevert } from './safeGsapRevert';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollTransitionsProps {
  reducedMotion?: boolean;
}

const SECTION_SELECTOR = '#main-content > .landing-deferred, #main-content > section';

function shouldSkipSection(section: HTMLElement, index: number) {
  const hasTransitionOptOut =
    section.dataset.noGlobalTransition === 'true' ||
    Boolean(section.querySelector('[data-no-global-transition="true"]'));

  return section.id === 'hero' || index === 0 || hasTransitionOptOut;
}

export function ScrollTransitions({ reducedMotion = false }: ScrollTransitionsProps) {
  const hasRun = useRef(false);
  const disposedRef = useRef(false);

  useLayoutEffect(() => {
    if (reducedMotion || hasRun.current) return;
    hasRun.current = true;
    disposedRef.current = false;

    let context: gsap.Context | null = null;
    let mutationObserver: MutationObserver | null = null;
    let refreshRaf = 0;
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;

    const timer = setTimeout(() => {
      context = gsap.context(() => {
        const configured = new WeakSet<HTMLElement>();
        const isMobile = window.matchMedia('(max-width: 767px)').matches;

        const setupSectionAnimation = (section: HTMLElement, index: number) => {
          if (disposedRef.current || !section.isConnected || !section.closest('#main-content')) {
            return;
          }

          if (configured.has(section) || shouldSkipSection(section, index)) {
            return;
          }

          configured.add(section);

          gsap.set(section, {
            transformOrigin: 'center center',
            force3D: true,
            willChange: 'transform, opacity',
          });

          gsap.fromTo(
            section,
            {
              autoAlpha: 0.45,
              y: isMobile ? 40 : 60,
              scale: isMobile ? 0.992 : 0.982,
              filter: 'blur(4px)',
            },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              filter: 'blur(0px)',
              ease: 'power3.out',
              clearProps: 'filter',
              scrollTrigger: {
                trigger: section,
                start: 'top 94%',
                end: 'top 56%',
                scrub: isMobile ? 0.85 : 1.0,
              },
            }
          );

          gsap.to(section, {
            yPercent: isMobile ? -1 : -2,
            scale: isMobile ? 0.998 : 0.994,
            autoAlpha: 0.94,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'bottom 46%',
              end: 'bottom top',
              scrub: isMobile ? 0.7 : 0.85,
            },
          });

          const content = section.querySelector<HTMLElement>(
            '.landing-container, [data-scroll-content]'
          );
          if (content) {
            gsap.fromTo(
              content,
              { y: isMobile ? 22 : 36 },
              {
                y: 0,
                ease: 'none',
                scrollTrigger: {
                  trigger: section,
                  start: 'top 92%',
                  end: 'top 58%',
                  scrub: isMobile ? 0.8 : 0.95,
                },
              }
            );
          }

          const depthLayers = gsap.utils.toArray<HTMLElement>('[data-scroll-depth]', section);
          depthLayers.forEach((layer, layerIndex) => {
            gsap.to(layer, {
              yPercent: (isMobile ? -5 : -10) - layerIndex * 2,
              scale: 1.02 + layerIndex * 0.008,
              ease: 'none',
              scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: isMobile ? 1.2 : 1.5,
              },
            });
          });

          const floatLayers = gsap.utils.toArray<HTMLElement>('[data-scroll-float]', section);
          floatLayers.forEach((layer, layerIndex) => {
            gsap.to(layer, {
              yPercent: layerIndex % 2 === 0 ? -8 : 8,
              xPercent: layerIndex % 2 === 0 ? 4 : -4,
              ease: 'none',
              scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: isMobile ? 1.1 : 1.4,
              },
            });
          });
        };

        const scanSections = () => {
          if (disposedRef.current) return;
          const sections = gsap.utils.toArray<HTMLElement>(SECTION_SELECTOR);
          sections.forEach((section, index) => setupSectionAnimation(section, index));
        };

        const scheduleRefresh = () => {
          if (disposedRef.current) return;

          if (refreshTimer) {
            clearTimeout(refreshTimer);
          }

          refreshTimer = setTimeout(() => {
            if (disposedRef.current || refreshRaf) return;

            refreshRaf = window.requestAnimationFrame(() => {
              refreshRaf = 0;
              if (disposedRef.current) return;

              try {
                scanSections();
                if (ScrollTrigger.getAll().length > 0) {
                  ScrollTrigger.refresh();
                }
              } catch (error) {
                // Prevent rare DOM race crashes during lazy mount/hydration churn.
                console.warn('Landing ScrollTransitions skipped refresh after DOM race:', error);
              }
            });
          }, 72);
        };

        scanSections();

        const mainContent = document.querySelector('#main-content');
        if (mainContent) {
          mutationObserver = new MutationObserver(() => {
            scheduleRefresh();
          });
          mutationObserver.observe(mainContent, {
            childList: true,
            subtree: true,
          });
        }
      });
    }, 260);

    return () => {
      disposedRef.current = true;
      clearTimeout(timer);
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
      if (refreshRaf) {
        window.cancelAnimationFrame(refreshRaf);
      }
      mutationObserver?.disconnect();
      safeGsapRevert(context);
    };
  }, [reducedMotion]);

  return null;
}

export default ScrollTransitions;
