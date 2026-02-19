'use client';

import { motion } from 'framer-motion';

const profiles = [
  {
    name: 'Ravi Kumar',
    role: 'Harvest Specialist',
    availability: 'Available Now',
    skills: ['Harvesting', 'Sorting', 'Packing'],
  },
  {
    name: 'Suman Patel',
    role: 'Irrigation Technician',
    availability: 'Available in 2h',
    skills: ['Irrigation', 'Pump Setup', 'Field Lines'],
  },
  {
    name: 'Anita Devi',
    role: 'Machine Operator',
    availability: 'Available Now',
    skills: ['Tractor', 'Seeding', 'Soil Prep'],
  },
];

function LabourMarketplace() {
  return (
    <section className="relative overflow-hidden bg-[#060c09] px-5 py-24 md:px-8 md:py-36">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(34,197,94,0.18),transparent_45%),radial-gradient(circle_at_84%_78%,rgba(6,182,212,0.2),transparent_52%)]" />

      <div className="mx-auto mb-14 max-w-7xl">
        <p className="mb-4 text-[11px] uppercase tracking-[0.3em] text-cyan-300/90">Chapter 04</p>
        <h2 className="max-w-4xl text-[clamp(2.8rem,6vw,5.2rem)] font-semibold leading-[0.9] tracking-[-0.02em] text-white">
          Skilled Labour Network
        </h2>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
        {profiles.map((profile, i) => (
          <motion.article
            key={profile.name}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
            transition={{ delay: i * 0.12, duration: 0.65 }}
            whileHover={{ y: -10, rotateX: -4, rotateY: 4 }}
            className="bg-white/8 group relative rounded-[1.8rem] border border-white/10 p-6 backdrop-blur-2xl"
            style={{ perspective: 1000 }}
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-300 to-cyan-300" />
              <div>
                <p className="text-lg font-medium tracking-[-0.02em] text-white">{profile.name}</p>
                <p className="text-sm text-zinc-300">{profile.role}</p>
              </div>
            </div>

            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-300/35 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-emerald-100">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
              {profile.availability}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <motion.span
                  key={skill}
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 2 + index * 0.24, repeat: Infinity }}
                  className="rounded-full border border-cyan-200/30 px-3 py-1 text-xs text-cyan-100"
                >
                  {skill}
                </motion.span>
              ))}
            </div>

            <div className="pointer-events-none absolute inset-0 rounded-[1.8rem] border border-transparent opacity-0 transition group-hover:opacity-100 group-hover:[border-image:linear-gradient(90deg,#22c55e,#06b6d4)_1]" />
          </motion.article>
        ))}
      </div>
    </section>
  );
}
