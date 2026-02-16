'use client';

import dynamic from 'next/dynamic';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, CheckCircle2, Clock3, Search, WalletCards } from 'lucide-react';
import { safeGsapRevert } from '../shared/safeGsapRevert';
import { MagneticButton } from '../shared/MagneticButton';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface HowItWorksChapterProps {
  reducedMotion?: boolean;
}

interface Step {
  title: string;
  subtitle: string;
  kicker: string;
  body: string;
}

const steps: Step[] = [
  {
    title: 'Find Equipment',
    subtitle: '01',
    kicker: 'Discover',
    body: 'Search verified tractors and implements near your location with trusted ratings and service history.',
  },
  {
    title: 'Check Availability',
    subtitle: '02',
    kicker: 'Synchronize',
    body: 'Live availability timelines reveal which providers are ready today, tomorrow, or at your exact window.',
  },
  {
    title: 'Compare Prices',
    subtitle: '03',
    kicker: 'Evaluate',
    body: 'Review transparent quotes, distance and reliability signals so every booking choice is cost-smart.',
  },
  {
    title: 'Book Instantly',
    subtitle: '04',
    kicker: 'Execute',
    body: 'Confirm in seconds and lock your schedule with verified providers plus clear operational details.',
  },
];

const stepIcons = [Search, Clock3, WalletCards, CheckCircle2] as const;

const InteractiveTractorScene = dynamic(
  () => import('../3d/InteractiveTractorScene').then((mod) => mod.InteractiveTractorScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-300/20 border-t-cyan-300" />
      </div>
    ),
  }
);

export function HowItWorksChapter({ reducedMotion = false }: HowItWorksChapterProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const narrativeRefs = useRef<HTMLElement[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const particles = useMemo(
    () =>
      Array.from({ length: reducedMotion ? 10 : 20 }, (_, index) => ({
        id: `particle-${index}`,
        left: `${6 + ((index * 13) % 88)}%`,
        top: `${8 + ((index * 19) % 82)}%`,
        delay: `${(index % 7) * 0.7}s`,
        duration: `${5 + (index % 5) * 1.3}s`,
      })),
    [reducedMotion]
  );

  useLayoutEffect(() => {
    if (!sectionRef.current) return;

    const context = gsap.context(() => {
      // Holographic cards \u2014 organic floating with rotation
      if (!reducedMotion) {
        gsap.utils.toArray<HTMLElement>('[data-holo]').forEach((card, index) => {
          gsap.to(card, {
            y: -10,
            rotateZ: index % 2 === 0 ? 1.5 : -1.5,
            duration: 2.6 + index * 0.4,
            ease: 'sine.inOut',
            stagger: 0.22,
            yoyo: true,
            repeat: -1,
          });
        });
      }

      // Heading \u2014 blur dissolve reveal
      if (!reducedMotion) {
        gsap.fromTo(
          '[data-hiw-heading]',
          { y: 40, opacity: 0, filter: 'blur(6px)' },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 75%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => setScrollProgress(self.progress),
      });

      narrativeRefs.current.forEach((step, index) => {
        if (!step) return;

        // Narrative cards \u2014 scroll-driven clip-path + 3D rotation reveal
        if (!reducedMotion) {
          gsap.fromTo(
            step,
            {
              opacity: 0.15,
              y: 50,
              rotateX: -6,
              scale: 0.96,
              clipPath: 'inset(8% 0 8% 0)',
            },
            {
              opacity: 1,
              y: 0,
              rotateX: 0,
              scale: 1,
              clipPath: 'inset(0% 0 0% 0)',
              ease: 'power3.out',
              clearProps: 'rotateX,clipPath',
              scrollTrigger: {
                trigger: step,
                start: 'top 82%',
                end: 'top 55%',
                scrub: 0.7,
              },
            }
          );
        }

        ScrollTrigger.create({
          trigger: step,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => setActiveStep(index),
          onEnterBack: () => setActiveStep(index),
        });
      });

      // Background parallax depth
      if (!reducedMotion) {
        gsap.to('[data-hiw-bg]', {
          yPercent: -6,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.3,
          },
        });
      }
    }, sectionRef);

    return () => safeGsapRevert(context);
  }, [reducedMotion]);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative overflow-hidden bg-[linear-gradient(180deg,#020404_0%,#030607_38%,#020304_100%)] py-[var(--landing-section-y)]"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '1200px' }}
    >
      <div
        data-hiw-bg
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(34,197,94,0.22),transparent_34%),radial-gradient(circle_at_78%_24%,rgba(56,189,248,0.2),transparent_40%),radial-gradient(circle_at_64%_82%,rgba(20,184,166,0.16),transparent_42%)]"
      />
      <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(rgba(20,184,166,0.2)_1px,transparent_1px)] [background-size:22px_22px]" />
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(34,197,94,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.16)_1px,transparent_1px)] [background-size:76px_76px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_62%,rgba(2,6,23,0)_0%,rgba(2,6,23,0.66)_55%,rgba(2,6,23,0.9)_100%)]" />
      <div className="bg-cyan-200/6 pointer-events-none absolute inset-x-0 top-1/3 h-[420px] blur-3xl" />

      {particles.map((particle) => (
        <span
          key={particle.id}
          className="pointer-events-none absolute h-1 w-1 animate-pulse rounded-full bg-cyan-100/60 opacity-80"
          style={{
            left: particle.left,
            top: particle.top,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
          }}
        />
      ))}

      <div className="relative z-10 mx-auto w-full max-w-[var(--landing-max-width)] px-[var(--landing-padding-x)]">
        <div className="mx-auto mb-10 max-w-4xl text-center md:mb-14">
          <p className="text-[11px] uppercase tracking-[0.34em] text-cyan-100/75">
            Chapter 05 // How It Works
          </p>
          <h2
            data-hiw-heading
            className="mt-5 text-[clamp(1.9rem,7.2vw,5.6rem)] font-semibold uppercase leading-[0.9] text-white"
          >
            Instant Booking Engine for
            <span className="block bg-gradient-to-r from-emerald-200 via-cyan-100 to-cyan-300 bg-clip-text text-transparent">
              Verified Providers
            </span>
          </h2>
          <p className="text-white/72 mx-auto mt-5 max-w-3xl text-sm leading-relaxed md:text-lg">
            Scroll through the booking narrative while the tractor stage responds in real time with
            subtle cinematic camera movement and live process state.
          </p>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.12fr_0.88fr] xl:gap-12">
          <div className="xl:sticky xl:top-24 xl:h-fit">
            <div className="relative overflow-hidden rounded-[2rem] border border-cyan-100/15 bg-slate-950/60 p-4 shadow-[0_32px_100px_rgba(0,0,0,0.55)] backdrop-blur-xl md:p-6">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_52%_44%,rgba(34,197,94,0.12),rgba(7,17,35,0.55)_42%,rgba(2,6,23,0.9)_100%)]" />
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/25" />

              <div className="relative h-[300px] w-full min-[414px]:h-[340px] md:h-[430px]">
                <InteractiveTractorScene
                  reducedMotion={reducedMotion}
                  mode="cinematic"
                  scrollProgress={scrollProgress}
                  activeStep={activeStep}
                />

                <svg
                  className="pointer-events-none absolute inset-0 hidden md:block"
                  viewBox="0 0 100 100"
                  fill="none"
                >
                  {[
                    { d: 'M18 18 L48 50', active: activeStep === 0 },
                    { d: 'M82 20 L52 50', active: activeStep === 1 },
                    { d: 'M20 82 L48 58', active: activeStep === 2 },
                    { d: 'M80 82 L52 58', active: activeStep === 3 },
                  ].map((line, index) => (
                    <path
                      key={index}
                      d={line.d}
                      stroke={line.active ? '#67e8f9' : '#67e8f980'}
                      strokeWidth={line.active ? 1 : 0.7}
                      strokeDasharray="2 2"
                      className="transition-all duration-500"
                    />
                  ))}
                </svg>

                {steps.map((step, index) => {
                  const Icon = stepIcons[index];
                  const positionClasses =
                    index === 0
                      ? 'left-3 top-3 md:left-6 md:top-6'
                      : index === 1
                        ? 'right-3 top-3 md:right-6 md:top-8'
                        : index === 2
                          ? 'left-3 bottom-4 md:left-6 md:bottom-8'
                          : 'right-3 bottom-4 md:right-6 md:bottom-8';

                  return (
                    <article
                      key={step.subtitle}
                      data-holo
                      className={`absolute ${positionClasses} hidden w-[45%] rounded-2xl border p-3 backdrop-blur-xl transition duration-500 min-[375px]:block md:w-[36%] md:p-4 ${
                        activeStep === index
                          ? 'to-emerald-300/18 border-cyan-100/50 bg-gradient-to-br from-cyan-300/25 shadow-[0_0_48px_rgba(34,211,238,0.26)]'
                          : 'border-white/15 bg-slate-900/55'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="bg-white/8 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/25">
                          <Icon className="h-4 w-4 text-cyan-100" />
                        </span>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-100/80">
                          Step {step.subtitle}
                        </p>
                      </div>
                      <h3 className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-white md:text-sm">
                        {step.title}
                      </h3>
                    </article>
                  );
                })}
              </div>

              <div className="relative mt-4 w-full rounded-2xl border border-white/15 bg-black/40 p-4">
                <div className="relative h-2 rounded-full bg-white/10">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-cyan-200 transition-all duration-500"
                    style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-cyan-100/75">
                  <span>Stage {steps[activeStep]?.subtitle}</span>
                  <span>{Math.round(((activeStep + 1) / steps.length) * 100)}%</span>
                </div>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <MagneticButton
                href="/equipment"
                strength={0.3}
                className="landing-touch gap-2 border-emerald-200/35 bg-gradient-to-r from-emerald-500/90 to-cyan-500/90 px-6 py-3 text-[11px] tracking-[0.18em] text-white shadow-[0_0_44px_rgba(16,185,129,0.45)] max-[479px]:w-full max-[479px]:justify-center"
              >
                Browse Equipment
                <ArrowRight className="h-3.5 w-3.5" />
              </MagneticButton>
              <MagneticButton
                href="/provider/equipment"
                strength={0.24}
                className="landing-touch border-cyan-100/35 bg-cyan-300/10 px-6 py-3 text-[11px] tracking-[0.18em] text-cyan-50 shadow-[0_0_34px_rgba(34,211,238,0.26)] max-[479px]:w-full max-[479px]:justify-center"
              >
                Become a Verified Provider
              </MagneticButton>
            </div>
          </div>

          <div className="space-y-5 pt-1 md:space-y-6">
            {steps.map((step, index) => (
              <article
                key={step.subtitle}
                ref={(element) => {
                  if (element) narrativeRefs.current[index] = element;
                }}
                className={`rounded-[1.6rem] border p-6 backdrop-blur-xl transition duration-500 md:p-7 ${
                  activeStep === index
                    ? 'from-cyan-200/14 border-cyan-100/40 bg-gradient-to-br to-emerald-200/10'
                    : 'border-white/15 bg-black/35'
                }`}
              >
                <p className="text-[11px] uppercase tracking-[0.32em] text-cyan-100/70">
                  {step.kicker} • Step {step.subtitle}
                </p>
                <h3 className="mt-3 text-2xl font-semibold uppercase leading-tight text-white md:text-3xl">
                  {step.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-white/75 md:text-base">
                  {step.body}
                </p>
              </article>
            ))}

            <div className="rounded-[1.6rem] border border-white/15 bg-white/[0.03] p-5 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/70">Scroll state</p>
              <div
                className="mt-3 h-2 rounded-full bg-gradient-to-r from-cyan-200/20 via-emerald-200/20 to-cyan-200/20"
                style={{
                  width: `${Math.min(100, Math.max(8, scrollProgress * 100))}%`,
                  transition: reducedMotion ? 'width 0.2s linear' : 'width 0.35s ease-out',
                }}
              />
              <p className="mt-2 text-xs text-white/65">
                Camera glide and stage highlights are synchronized with this narrative progress.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
