'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useGSAPAnimation } from '@/lib/animations/gsap-context';
import { AlertCircle, TrendingUp } from 'lucide-react';

export function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // GSAP: Sticky scroll with background transition
  useGSAPAnimation((gsap) => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.problem-container',
        start: 'top top',
        end: 'bottom center',
        scrub: 1,
        pin: '.problem-sticky',
      },
    });

    // Background transition: dusty → futuristic
    tl.to('.problem-bg-overlay', {
      opacity: 0,
      duration: 0.5,
    });

    // Text reveals
    tl.from(
      '.problem-text-1',
      {
        opacity: 0,
        y: 50,
        duration: 0.3,
      },
      0
    );

    tl.to(
      '.problem-text-1',
      {
        opacity: 0,
        y: -50,
        duration: 0.3,
      },
      0.4
    );

    tl.from(
      '.problem-text-2',
      {
        opacity: 0,
        y: 50,
        duration: 0.3,
      },
      0.5
    );

    tl.to(
      '.problem-text-2',
      {
        opacity: 0,
        y: -50,
        duration: 0.3,
      },
      0.9
    );

    tl.from(
      '.problem-text-3',
      {
        opacity: 0,
        y: 50,
        duration: 0.3,
      },
      1
    );
  }, []);

  return (
    <section
      ref={ref}
      className="problem-container relative w-full overflow-hidden"
      style={{ height: '300vh' }}
    >
      {/* Sticky container */}
      <div className="problem-sticky sticky top-0 h-screen w-full">
        {/* Background layers */}
        <div className="absolute inset-0 bg-[#0A0F0C]">
          {/* Futuristic farm (final state) */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-teal-900/10 to-cyan-900/20">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#22c55e08_1px,transparent_1px),linear-gradient(to_bottom,#22c55e08_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          </div>

          {/* Dusty field overlay (initial state, fades out) */}
          <div className="problem-bg-overlay absolute inset-0 bg-gradient-to-b from-amber-950/30 via-stone-900/40 to-[#0A0F0C]" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex h-full items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl text-center">
            {/* Problem 1 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              className="problem-text-1 absolute inset-0 flex items-center justify-center"
            >
              <div className="max-w-3xl">
                <AlertCircle className="mx-auto mb-6 h-16 w-16 text-amber-400" />
                <h2 className="mb-6 text-4xl font-bold text-white md:text-6xl lg:text-7xl">
                  Equipment is{' '}
                  <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                    Expensive
                  </span>
                </h2>
                <p className="text-xl text-gray-300 md:text-2xl">
                  Small farmers can&apos;t afford ₹10-50 lakhs for tractors and machinery
                </p>
              </div>
            </motion.div>

            {/* Problem 2 */}
            <div className="problem-text-2 absolute inset-0 flex items-center justify-center opacity-0">
              <div className="max-w-3xl">
                <AlertCircle className="mx-auto mb-6 h-16 w-16 text-red-400" />
                <h2 className="mb-6 text-4xl font-bold text-white md:text-6xl lg:text-7xl">
                  Access is{' '}
                  <span className="bg-gradient-to-r from-red-400 to-rose-500 bg-clip-text text-transparent">
                    Limited
                  </span>
                </h2>
                <p className="text-xl text-gray-300 md:text-2xl">
                  Equipment providers are scattered, unorganized, and hard to find
                </p>
              </div>
            </div>

            {/* Solution */}
            <div className="problem-text-3 absolute inset-0 flex items-center justify-center opacity-0">
              <div className="max-w-3xl">
                <TrendingUp className="mx-auto mb-6 h-16 w-16 text-emerald-400" />
                <h2 className="mb-6 text-4xl font-bold text-white md:text-6xl lg:text-7xl">
                  We&apos;re{' '}
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                    Changing That
                  </span>
                </h2>
                <p className="text-xl text-gray-300 md:text-2xl">
                  One platform. Thousands of verified providers. Equipment when you need it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
