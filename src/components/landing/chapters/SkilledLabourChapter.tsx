'use client';

import Image from 'next/image';
import { useLayoutEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { safeGsapRevert } from '../shared/safeGsapRevert';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface SkilledLabourChapterProps {
  reducedMotion?: boolean;
}

interface LabourProfile {
  name: string;
  role: string;
  availability: string;
  location: string;
  image: string;
  skills: string[];
}

const labourProfiles: LabourProfile[] = [
  {
    name: 'Anita Mehta',
    role: 'Harvest Specialist',
    availability: 'Available Today',
    location: 'Ludhiana, Punjab',
    image: '/images/avatar-anita.avif',
    skills: ['Combine Ops', 'Crop Sorting', 'Field Safety'],
  },
  {
    name: 'Rajesh Yadav',
    role: 'Equipment Technician',
    availability: 'Available in 2 Hrs',
    location: 'Jaipur, Rajasthan',
    image: '/images/avatar-rajesh.avif',
    skills: ['Tractor Setup', 'Sensor Calibration', 'Repair Ops'],
  },
  {
    name: 'Vikram Singh',
    role: 'Seeding Crew Lead',
    availability: 'Available Tomorrow',
    location: 'Karnal, Haryana',
    image: '/images/avatar-vikram.avif',
    skills: ['Soil Prep', 'Seed Drill', 'Team Dispatch'],
  },
];

function HoloProfileCard({
  profile,
  reducedMotion,
}: {
  profile: LabourProfile;
  reducedMotion: boolean;
}) {
  return (
    <motion.article
      data-labour-parallax
      whileHover={reducedMotion ? {} : { y: -10, rotateX: 4, rotateY: -4 }}
      className="group relative overflow-hidden rounded-[1.8rem] border border-white/20 bg-black/45 p-5 backdrop-blur-xl"
      style={{ transformPerspective: 1200 }}
    >
      <div className="from-cyan-200/18 absolute inset-0 bg-gradient-to-br via-transparent to-emerald-200/20 opacity-85" />
      <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(34,211,238,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.12)_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative z-10 flex items-start gap-4">
        <div className="relative">
          <Image
            src={profile.image}
            alt={profile.name}
            width={74}
            height={74}
            loading="lazy"
            className="rounded-2xl border border-white/25 object-cover"
          />
          <span className="absolute -bottom-1 -right-1 rounded-full border border-emerald-100/40 bg-emerald-400/20 px-2 py-1 text-[9px] uppercase tracking-[0.16em] text-emerald-100">
            Live
          </span>
        </div>

        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-100/75">{profile.role}</p>
          <h3 className="mt-2 text-2xl font-semibold uppercase leading-none text-white">
            {profile.name}
          </h3>
          <p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/60">
            {profile.location}
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-5 flex items-center justify-between">
        <span className="rounded-full border border-emerald-100/35 bg-emerald-300/20 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-emerald-100">
          {profile.availability}
        </span>

        <div className="relative h-12 w-12">
          {profile.skills.slice(0, 3).map((skill, index) => (
            <motion.span
              key={skill}
              className="absolute rounded-full border border-cyan-100/25 bg-cyan-300/20 px-2 py-1 text-[8px] uppercase tracking-[0.12em] text-cyan-100"
              style={{ top: '50%', left: '50%' }}
              animate={
                reducedMotion
                  ? { x: 0, y: 0 }
                  : {
                      x: Math.cos((index * 2 * Math.PI) / 3) * 18,
                      y: Math.sin((index * 2 * Math.PI) / 3) * 18,
                    }
              }
              transition={{
                duration: 4 + index,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }}
            >
              {skill.split(' ')[0]}
            </motion.span>
          ))}
        </div>
      </div>

      <div className="relative z-10 mt-4 space-y-2 opacity-0 transition duration-300 group-hover:opacity-100">
        {profile.skills.map((skill) => (
          <p key={skill} className="text-xs uppercase tracking-[0.16em] text-cyan-50/85">
            {skill}
          </p>
        ))}
      </div>
    </motion.article>
  );
}

export function SkilledLabourChapter({ reducedMotion = false }: SkilledLabourChapterProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (!sectionRef.current || reducedMotion) return;

    const context = gsap.context(() => {
      // Heading + description \u2014 smooth scroll reveal
      gsap.fromTo(
        '[data-labour-heading]',
        { y: 40, opacity: 0, filter: 'blur(4px)' },
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

      // Profile cards \u2014 3D perspective fan-out cascade
      gsap.fromTo(
        '[data-labour-parallax]',
        { y: 80, opacity: 0, rotateX: -15, rotateY: 4, scale: 0.88 - 0 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          stagger: 0.18,
          duration: 1.1,
          ease: 'power3.out',
          clearProps: 'rotateX,rotateY',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            end: 'center 55%',
            scrub: 0.9,
          },
        }
      );

      // Availability pulse badges \u2014 smoother phase-offset breathing
      gsap.utils.toArray<HTMLElement>('[data-availability-pulse]').forEach((element, index) => {
        gsap.to(element, {
          scale: 1.08,
          opacity: 1,
          boxShadow: '0 0 16px rgba(34,211,238,0.35)',
          duration: 1.4 + index * 0.3,
          delay: index * 0.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });

      // Background parallax depth
      gsap.to('[data-labour-bg]', {
        yPercent: -6,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        },
      });
    }, sectionRef);

    return () => safeGsapRevert(context);
  }, [reducedMotion]);

  return (
    <section
      id="labour-network"
      ref={sectionRef}
      className="relative overflow-hidden bg-[linear-gradient(180deg,#020707_0%,#020405_50%,#010102_100%)] px-6 py-24 md:px-10 md:py-36"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '800px' }}
    >
      <div
        data-labour-bg
        className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(34,211,238,0.2),transparent_34%),radial-gradient(circle_at_78%_72%,rgba(16,185,129,0.22),transparent_40%)]"
      />
      <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle,rgba(255,255,255,0.35)_0.7px,transparent_1px)] [background-size:3px_3px]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <p className="text-[11px] uppercase tracking-[0.34em] text-cyan-100/70">
          Chapter 04 // Skilled Labour Network
        </p>
        <h2
          data-labour-heading
          className="mt-4 max-w-5xl text-[clamp(2.2rem,6vw,5.3rem)] font-semibold uppercase leading-[0.9] text-white"
        >
          Skilled Crews Become Instantly Discoverable and Deployable.
        </h2>
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-white/75 md:text-lg">
          Profile cards pulse with real-time availability, roles, and location intelligence so you
          can route the right teams to the right fields before conditions shift.
        </p>

        <div className="mt-12 grid gap-5 md:mt-14 md:grid-cols-3">
          {labourProfiles.map((profile) => (
            <HoloProfileCard key={profile.name} profile={profile} reducedMotion={reducedMotion} />
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          {['Harvest Crew', 'Machine Operator', 'Crop Scout', 'Soil Specialist'].map((label) => (
            <span
              key={label}
              data-availability-pulse
              className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-white/75"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
