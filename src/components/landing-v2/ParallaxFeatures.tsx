'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useGSAPAnimation } from '@/lib/animations/gsap-context';
import { Tractor, Users, Zap, Shield } from 'lucide-react';

export function ParallaxFeatures() {
  const sectionRef = useRef<HTMLDivElement>(null);

  // GSAP: Layered parallax storytelling
  useGSAPAnimation((gsap) => {
    if (!sectionRef.current) return;

    const features = gsap.utils.toArray('.feature-panel');

    features.forEach((feature) => {
      gsap.from(feature as HTMLElement, {
        opacity: 0,
        scale: 0.8,
        y: 100,
        scrollTrigger: {
          trigger: feature as HTMLElement,
          start: 'top 80%',
          end: 'top 30%',
          scrub: 1.5,
          toggleActions: 'play none none reverse',
        },
      });

      // Parallax layers within each feature
      const layers = (feature as HTMLElement).querySelectorAll('.parallax-layer');
      layers.forEach((layer, j) => {
        gsap.to(layer, {
          y: (j + 1) * -50,
          scrollTrigger: {
            trigger: feature as HTMLElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 2,
          },
        });
      });
    });
  }, []);

  const features = [
    {
      icon: Tractor,
      title: 'Premium Equipment',
      description:
        'Access the latest tractors, harvesters, and agricultural machinery from verified providers across India.',
      color: 'emerald',
    },
    {
      icon: Users,
      title: 'Skilled Labour',
      description:
        'Connect with certified farm workers, operators, and agricultural specialists ready to power your harvest.',
      color: 'cyan',
    },
    {
      icon: Zap,
      title: 'Instant Booking',
      description:
        'Book equipment or hire workers in seconds with our revolutionary real-time availability system.',
      color: 'amber',
    },
    {
      icon: Shield,
      title: 'Verified & Trusted',
      description:
        'Every provider and worker is verified with insurance coverage and quality guarantees.',
      color: 'purple',
    },
  ];

  return (
    <section ref={sectionRef} className="relative bg-black py-40">
      {/* Background texture */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#10b98110_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-32 text-center"
        >
          <h2 className="mb-6 text-6xl font-black uppercase tracking-tighter text-white lg:text-8xl">
            Why{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Choose Us
            </span>
          </h2>
          <p className="mx-auto max-w-3xl text-2xl text-gray-400 lg:text-3xl">
            Revolutionary features that transform how you farm
          </p>
        </motion.div>

        {/* Feature panels */}
        <div className="space-y-40">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`feature-panel grid grid-cols-1 gap-12 lg:grid-cols-2 ${
                index % 2 === 1 ? 'lg:grid-flow-dense' : ''
              }`}
            >
              {/* Icon side */}
              <div
                className={`relative flex items-center justify-center ${
                  index % 2 === 1 ? 'lg:col-start-2' : ''
                }`}
              >
                <div className="parallax-layer relative">
                  {/* Glow effect */}
                  <div
                    className={`absolute inset-0 -z-10 rounded-full bg-${feature.color}-500/20 blur-[100px]`}
                  />
                  {/* Icon container */}
                  <div
                    className={`relative h-80 w-80 rounded-full border-4 border-${feature.color}-500/30 bg-gradient-to-br from-${feature.color}-500/10 to-transparent p-20 backdrop-blur-xl`}
                  >
                    <feature.icon className={`h-full w-full text-${feature.color}-400`} />
                  </div>
                </div>
              </div>

              {/* Content side */}
              <div className="parallax-layer flex flex-col justify-center">
                <div
                  className={`mb-6 inline-flex w-fit items-center gap-3 rounded-full border border-${feature.color}-500/30 bg-${feature.color}-500/10 px-6 py-3 text-sm font-bold uppercase tracking-wider text-${feature.color}-400`}
                >
                  <div className={`h-2 w-2 animate-pulse rounded-full bg-${feature.color}-500`} />
                  Feature {index + 1}
                </div>
                <h3
                  className={`mb-6 text-5xl font-black uppercase tracking-tight text-${feature.color}-400 lg:text-7xl`}
                >
                  {feature.title}
                </h3>
                <p className="text-2xl leading-relaxed text-gray-300">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
