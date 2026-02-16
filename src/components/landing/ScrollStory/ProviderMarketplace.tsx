'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Stats {
  totalUsers: number;
  totalEquipment: number;
  totalBookings: number;
}

const nodes = [
  { left: '8%', top: '30%' },
  { left: '18%', top: '60%' },
  { left: '32%', top: '42%' },
  { left: '46%', top: '66%' },
  { left: '59%', top: '38%' },
  { left: '72%', top: '58%' },
  { left: '86%', top: '34%' },
];

export function ProviderMarketplace({ stats }: { stats: Stats }) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.provider-card',
        { opacity: 0, y: 44 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.16,
          duration: 0.7,
          scrollTrigger: { trigger: '.provider-grid', start: 'top 75%' },
        }
      );

      gsap.to('.provider-node', {
        scale: 1.25,
        opacity: 1,
        duration: 1.3,
        stagger: 0.1,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      document.querySelectorAll<HTMLElement>('[data-provider]').forEach((el) => {
        const target = Number(el.dataset.provider || 0);
        gsap.fromTo(
          el,
          { innerText: 0 },
          {
            innerText: target,
            snap: { innerText: 1 },
            duration: 1.4,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%' },
            onUpdate: () => {
              el.innerText = Math.floor(Number(el.innerText)).toLocaleString();
            },
          }
        );
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="provider-network" ref={rootRef} className="bg-[#080f0b] px-5 py-24 md:px-8 md:py-36">
      <div className="mx-auto mb-14 max-w-7xl">
        <p className="mb-4 text-[11px] uppercase tracking-[0.3em] text-cyan-300/90">Chapter 03</p>
        <h2 className="max-w-4xl text-[clamp(2.8rem,6vw,5.2rem)] font-semibold leading-[0.9] tracking-[-0.02em] text-white">
          Provider Network At Scale
        </h2>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.25fr_1fr]">
        <div className="relative h-[420px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a120e]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(6,182,212,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.16)_1px,transparent_1px)] bg-[size:3.2rem_3.2rem]" />
          <svg className="absolute inset-0 h-full w-full opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M8 30 L32 42 L59 38 L86 34" stroke="#34d399" strokeWidth="0.45" fill="none" />
            <path d="M18 60 L32 42 L46 66 L59 38 L72 58" stroke="#22d3ee" strokeWidth="0.45" fill="none" />
          </svg>
          {nodes.map((node, i) => (
            <span
              key={i}
              className="provider-node absolute h-3 w-3 rounded-full bg-emerald-300 opacity-70 shadow-[0_0_22px_rgba(52,211,153,0.9)]"
              style={{ left: node.left, top: node.top }}
            />
          ))}
        </div>

        <div className="provider-grid grid gap-4">
          <article className="provider-card rounded-3xl border border-white/10 bg-white/8 p-7 backdrop-blur-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Providers</p>
            <p data-provider={Math.max(stats.totalUsers, 1200)} className="mt-4 text-5xl font-semibold tracking-[-0.02em] text-white">0</p>
          </article>
          <article className="provider-card rounded-3xl border border-emerald-300/20 bg-gradient-to-br from-emerald-500/18 to-transparent p-7 backdrop-blur-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-100">Machines</p>
            <p data-provider={Math.max(stats.totalEquipment, 5000)} className="mt-4 text-5xl font-semibold tracking-[-0.02em] text-white">0</p>
          </article>
          <article className="provider-card rounded-3xl border border-white/10 bg-white/8 p-7 backdrop-blur-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Bookings</p>
            <p data-provider={Math.max(stats.totalBookings, 23000)} className="mt-4 text-5xl font-semibold tracking-[-0.02em] text-white">0</p>
          </article>
        </div>
      </div>
    </section>
  );
}
