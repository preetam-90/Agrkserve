'use client';

import { useLayoutEffect, useRef, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { safeGsapRevert } from './safeGsapRevert';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

/* ------------------------------------------------------------------ */
/*  1. Text split reveal — wraps each word (and optionally character) */
/*     in a <span> to animate them with stagger.                      */
/* ------------------------------------------------------------------ */

/**
 * Splits text nodes inside `selector` into word-level spans and
 * reveals them with a staggered GSAP animation on scroll.
 */
export function useTextSplitReveal(
    containerRef: RefObject<HTMLElement | null>,
    selector: string,
    options: {
        reducedMotion?: boolean;
        splitBy?: 'word' | 'char';
        stagger?: number;
        duration?: number;
        y?: number;
        start?: string;
        once?: boolean;
    } = {}
) {
    const {
        reducedMotion = false,
        splitBy = 'word',
        stagger = 0.035,
        duration = 0.7,
        y = 32,
        start = 'top 82%',
        once = true,
    } = options;

    useLayoutEffect(() => {
        if (!containerRef.current || reducedMotion) return;

        const container = containerRef.current;
        const elements = container.querySelectorAll<HTMLElement>(selector);
        if (!elements.length) return;

        // Store original HTML for cleanup
        const originals: { el: HTMLElement; html: string }[] = [];

        elements.forEach((el) => {
            originals.push({ el, html: el.innerHTML });
            const text = el.textContent || '';

            if (splitBy === 'char') {
                el.innerHTML = text
                    .split('')
                    .map((char) =>
                        char === ' '
                            ? '<span class="inline-block">&nbsp;</span>'
                            : `<span class="split-char inline-block" style="will-change:transform,opacity">${char}</span>`
                    )
                    .join('');
            } else {
                el.innerHTML = text
                    .split(/(\s+)/)
                    .map((w) =>
                        w.trim()
                            ? `<span class="split-word inline-block overflow-hidden"><span class="split-word-inner inline-block" style="will-change:transform,opacity">${w}</span></span>`
                            : w
                    )
                    .join('');
            }
        });

        const targets =
            splitBy === 'char'
                ? container.querySelectorAll('.split-char')
                : container.querySelectorAll('.split-word-inner');

        const ctx = gsap.context(() => {
            gsap.from(targets, {
                y,
                opacity: 0,
                duration,
                stagger,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: container,
                    start,
                    toggleActions: once
                        ? 'play none none none'
                        : 'play reverse play reverse',
                },
                onComplete: () => {
                    // Remove will-change after animation to free GPU memory
                    (targets as NodeListOf<HTMLElement>).forEach(
                        (t) => (t.style.willChange = 'auto')
                    );
                },
            });
        }, container);

        return () => {
            safeGsapRevert(ctx);
            // Restore original HTML
            originals.forEach(({ el, html }) => (el.innerHTML = html));
        };
    }, [containerRef, selector, reducedMotion, splitBy, stagger, duration, y, start, once]);
}

/* ------------------------------------------------------------------ */
/*  2. Parallax depth layer — moves an element at a different scroll  */
/*     speed to create depth.                                         */
/* ------------------------------------------------------------------ */

export function useParallaxDepth(
    elementRef: RefObject<HTMLElement | null>,
    options: {
        reducedMotion?: boolean;
        speed?: number; // negative = slower, positive = faster
        scrub?: number;
    } = {}
) {
    const { reducedMotion = false, speed = -0.15, scrub = 1.2 } = options;

    useLayoutEffect(() => {
        if (!elementRef.current || reducedMotion) return;

        const ctx = gsap.context(() => {
            gsap.to(elementRef.current!, {
                yPercent: speed * 100,
                ease: 'none',
                scrollTrigger: {
                    trigger: elementRef.current!,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub,
                },
            });
        }, elementRef.current!);

        return () => safeGsapRevert(ctx);
    }, [elementRef, reducedMotion, speed, scrub]);
}

/* ------------------------------------------------------------------ */
/*  3. Staggered entrance — reveal a group of elements with cascade   */
/* ------------------------------------------------------------------ */

export function useStaggeredEntrance(
    containerRef: RefObject<HTMLElement | null>,
    selector: string,
    options: {
        reducedMotion?: boolean;
        stagger?: number;
        duration?: number;
        y?: number;
        scale?: number;
        start?: string;
        ease?: string;
        rotateX?: number;
    } = {}
) {
    const {
        reducedMotion = false,
        stagger = 0.1,
        duration = 0.85,
        y = 50,
        scale = 0.96,
        start = 'top 78%',
        ease = 'power3.out',
        rotateX = 0,
    } = options;

    useLayoutEffect(() => {
        if (!containerRef.current || reducedMotion) return;

        const ctx = gsap.context(() => {
            gsap.from(selector, {
                y,
                opacity: 0,
                scale,
                rotateX,
                duration,
                stagger,
                ease,
                scrollTrigger: {
                    trigger: containerRef.current!,
                    start,
                    toggleActions: 'play none none none',
                },
                onComplete: () => {
                    gsap.utils
                        .toArray<HTMLElement>(selector)
                        .forEach((el) => (el.style.willChange = 'auto'));
                },
            });
        }, containerRef.current!);

        return () => safeGsapRevert(ctx);
    }, [containerRef, selector, reducedMotion, stagger, duration, y, scale, start, ease, rotateX]);
}

/* ------------------------------------------------------------------ */
/*  4. Scroll-velocity glow — intensifies a glow based on scroll      */
/*     velocity for a cinematic feel.                                  */
/* ------------------------------------------------------------------ */

export function useScrollVelocityGlow(
    containerRef: RefObject<HTMLElement | null>,
    selector: string,
    options: { reducedMotion?: boolean; maxOpacity?: number } = {}
) {
    const { reducedMotion = false, maxOpacity = 0.6 } = options;

    useLayoutEffect(() => {
        if (!containerRef.current || reducedMotion) return;

        const ctx = gsap.context(() => {
            ScrollTrigger.create({
                trigger: containerRef.current!,
                start: 'top bottom',
                end: 'bottom top',
                onUpdate: (self) => {
                    const velocity = Math.min(Math.abs(self.getVelocity()) / 2000, 1);
                    gsap.to(selector, {
                        opacity: velocity * maxOpacity,
                        duration: 0.3,
                        overwrite: 'auto',
                    });
                },
            });
        }, containerRef.current!);

        return () => safeGsapRevert(ctx);
    }, [containerRef, selector, reducedMotion, maxOpacity]);
}

/* ------------------------------------------------------------------ */
/*  5. Magnetic hover for entire section — subtle pull towards cursor  */
/* ------------------------------------------------------------------ */
export function useSectionMagneticPull(
    containerRef: RefObject<HTMLElement | null>,
    selector: string,
    options: { reducedMotion?: boolean; strength?: number } = {}
) {
    const { reducedMotion = false, strength = 0.02 } = options;

    useLayoutEffect(() => {
        if (!containerRef.current || reducedMotion) return;
        const container = containerRef.current;
        const elements = container.querySelectorAll<HTMLElement>(selector);
        if (!elements.length) return;

        let raf = 0;
        const targets = Array.from(elements);

        const handleMove = (e: PointerEvent) => {
            if (raf) return;
            raf = requestAnimationFrame(() => {
                const rect = container.getBoundingClientRect();
                const cx = (e.clientX - rect.left) / rect.width - 0.5;
                const cy = (e.clientY - rect.top) / rect.height - 0.5;

                targets.forEach((el) => {
                    gsap.to(el, {
                        x: cx * rect.width * strength,
                        y: cy * rect.height * strength,
                        duration: 0.6,
                        ease: 'power2.out',
                        overwrite: 'auto',
                    });
                });
                raf = 0;
            });
        };

        const handleLeave = () => {
            targets.forEach((el) => {
                gsap.to(el, {
                    x: 0,
                    y: 0,
                    duration: 0.8,
                    ease: 'elastic.out(1, 0.5)',
                    overwrite: 'auto',
                });
            });
        };

        container.addEventListener('pointermove', handleMove);
        container.addEventListener('pointerleave', handleLeave);

        return () => {
            container.removeEventListener('pointermove', handleMove);
            container.removeEventListener('pointerleave', handleLeave);
            if (raf) cancelAnimationFrame(raf);
        };
    }, [containerRef, selector, reducedMotion, strength]);
}

/* ------------------------------------------------------------------ */
/*  6. Counter scramble — numbers scramble through random digits       */
/*     before settling on the final value.                             */
/* ------------------------------------------------------------------ */

export function useCounterScramble(
    ref: RefObject<HTMLElement | null>,
    finalValue: string,
    options: {
        reducedMotion?: boolean;
        duration?: number;
        scrambleChars?: string;
    } = {}
) {
    const {
        reducedMotion = false,
        duration = 1.2,
        scrambleChars = '0123456789',
    } = options;
    const hasPlayed = useRef(false);

    useLayoutEffect(() => {
        if (!ref.current || reducedMotion || hasPlayed.current) return;

        const el = ref.current;
        el.textContent = finalValue.replace(/[0-9]/g, '0');

        const ctx = gsap.context(() => {
            ScrollTrigger.create({
                trigger: el,
                start: 'top 85%',
                once: true,
                onEnter: () => {
                    hasPlayed.current = true;
                    const chars = finalValue.split('');
                    const digitIndices = chars
                        .map((c, i) => (/[0-9]/.test(c) ? i : -1))
                        .filter((i) => i >= 0);

                    const obj = { progress: 0 };
                    gsap.to(obj, {
                        progress: 1,
                        duration,
                        ease: 'power2.inOut',
                        onUpdate: () => {
                            const result = [...chars];
                            digitIndices.forEach((idx) => {
                                if (Math.random() > obj.progress) {
                                    result[idx] =
                                        scrambleChars[
                                        Math.floor(Math.random() * scrambleChars.length)
                                        ];
                                }
                            });
                            el.textContent = result.join('');
                        },
                        onComplete: () => {
                            el.textContent = finalValue;
                        },
                    });
                },
            });
        }, el);

        return () => safeGsapRevert(ctx);
    }, [ref, finalValue, reducedMotion, duration, scrambleChars]);
}

/* ------------------------------------------------------------------ */
/*  7. Reveal clip-path — reveals an element by animating clip-path    */
/* ------------------------------------------------------------------ */

export function useRevealClipPath(
    containerRef: RefObject<HTMLElement | null>,
    selector: string,
    options: {
        reducedMotion?: boolean;
        direction?: 'up' | 'down' | 'left' | 'right';
        duration?: number;
        start?: string;
        stagger?: number;
    } = {}
) {
    const {
        reducedMotion = false,
        direction = 'up',
        duration = 1,
        start = 'top 80%',
        stagger = 0.12,
    } = options;

    useLayoutEffect(() => {
        if (!containerRef.current || reducedMotion) return;

        const clipFrom: Record<string, string> = {
            up: 'inset(100% 0 0 0)',
            down: 'inset(0 0 100% 0)',
            left: 'inset(0 100% 0 0)',
            right: 'inset(0 0 0 100%)',
        };

        const ctx = gsap.context(() => {
            gsap.fromTo(
                selector,
                { clipPath: clipFrom[direction], opacity: 0 },
                {
                    clipPath: 'inset(0 0 0 0)',
                    opacity: 1,
                    duration,
                    stagger,
                    ease: 'power3.inOut',
                    scrollTrigger: {
                        trigger: containerRef.current!,
                        start,
                        toggleActions: 'play none none none',
                    },
                }
            );
        }, containerRef.current!);

        return () => safeGsapRevert(ctx);
    }, [containerRef, selector, reducedMotion, direction, duration, start, stagger]);
}
