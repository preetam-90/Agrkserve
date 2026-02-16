'use client';

import { useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';

gsap.registerPlugin(ScrollTrigger);

interface EquipmentItem {
  id: string;
  name: string;
  image?: string;
  price: number;
  location: string;
  category?: string;
}

export function EquipmentGallery({ equipment }: { equipment: EquipmentItem[] }) {
  const rootRef = useRef<HTMLElement>(null);
  const items = useMemo(() => equipment.slice(0, 8), [equipment]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const track = document.querySelector('.eq-runway');
      if (!track) return;

      const distance = track.scrollWidth - window.innerWidth;
      if (distance <= 0) return;

      const tween = gsap.to(track, {
        x: () => -distance,
        ease: 'none',
        scrollTrigger: {
          trigger: '.eq-pin',
          start: 'top top',
          end: () => `+=${distance + 1100}`,
          pin: true,
          scrub: 0.9,
        },
      });

      gsap.utils.toArray<HTMLElement>('.eq-panel').forEach((panel) => {
        ScrollTrigger.create({
          trigger: panel,
          containerAnimation: tween,
          start: 'left center',
          end: 'right center',
          onEnter: () => panel.classList.add('eq-focus'),
          onLeave: () => panel.classList.remove('eq-focus'),
          onEnterBack: () => panel.classList.add('eq-focus'),
          onLeaveBack: () => panel.classList.remove('eq-focus'),
        });
      });
    }, rootRef);

    return () => ctx.revert();
  }, [items.length]);

  return (
    <section id="equipment-universe" ref={rootRef} className="relative bg-[#050906] px-5 py-24 md:px-8 md:py-36">
      <div className="mx-auto mb-14 max-w-7xl">
        <p className="mb-4 text-[11px] uppercase tracking-[0.3em] text-cyan-300/90">Chapter 02</p>
        <h2 className="max-w-4xl text-[clamp(2.8rem,6vw,5.2rem)] font-semibold leading-[0.9] tracking-[-0.02em] text-white">
          Equipment Universe
        </h2>
      </div>

      <div className="eq-pin overflow-hidden">
        <div className="eq-runway flex w-max gap-10">
          {items.map((item, i) => (
            <article
              key={item.id}
              className="eq-panel group relative h-[72vh] min-h-[520px] w-[88vw] max-w-[860px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a120e] p-8 transition duration-500"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.2),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(6,182,212,0.2),transparent_52%)]" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between gap-8">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Machine {String(i + 1).padStart(2, '0')}</p>
                    <h3 className="mt-3 text-[clamp(2.2rem,4vw,3.8rem)] font-semibold tracking-[-0.02em] text-white">
                      {item.name}
                    </h3>
                    <p className="mt-3 text-zinc-300">{item.category || 'Farm Equipment'} · {item.location}</p>
                  </div>
                  <p className="rounded-full border border-emerald-300/35 px-4 py-2 text-sm text-emerald-100">
                    Rs {item.price}/day
                  </p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/10">
                  <Image
                    src={item.image || '/equipment-placeholder.svg'}
                    alt={item.name}
                    width={1200}
                    height={700}
                    unoptimized
                    className="h-[44vh] min-h-[260px] w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <style jsx>{`
        :global(.eq-focus) {
          transform: scale(1.02);
          border-color: rgba(52, 211, 153, 0.5);
          box-shadow: 0 0 80px rgba(16, 185, 129, 0.22);
        }
      `}</style>
    </section>
  );
}
