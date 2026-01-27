'use client';

import { motion } from 'framer-motion';
import { Search, Calendar, Tractor } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Search',
    description: 'Find the perfect equipment or skilled labor for your specific agricultural needs.',
    icon: Search,
  },
  {
    id: 2,
    title: 'Book',
    description: 'Select your dates and book instantly with our secure platform.',
    icon: Calendar,
  },
  {
    id: 3,
    title: 'Farm',
    description: 'Get to work with high-quality machinery and experienced personnel.',
    icon: Tractor,
  }
];

export function HowItWorksSection() {
  return (
    <section className="py-32 bg-white dark:from-zinc-800 dark:to-zinc-900 dark:bg-gradient-to-b relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-primary-green/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container-custom relative z-10">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 mb-6 text-xs font-black tracking-[0.3em] text-primary-green dark:text-emerald-400 uppercase bg-primary-green/10 dark:bg-emerald-500/20 rounded-full"
          >
            The Protocol
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-gray-900 dark:text-white"
          >
            Streamlined <span className="text-primary-green dark:text-emerald-400">Logistics</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-stone-600 dark:text-zinc-300 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            A high-efficiency workflow designed for the modern industrial farmer.
            From deployment to harvest in record time.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-16 relative">
          {/* Connecting Path with Gradient Animation */}
          <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-[2px] bg-stone-200 dark:bg-zinc-700 z-0 overflow-hidden">
            <motion.div
              initial={{ x: "-100%" }}
              whileInView={{ x: "0%" }}
              viewport={{ once: true }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="w-full h-full bg-gradient-to-r from-primary-green to-golden-accent"
            />
          </div>

          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <div className="group relative">
                <div className="w-[120px] h-[120px] bg-white dark:bg-zinc-800/50 dark:backdrop-blur-xl rounded-[40px] flex items-center justify-center mb-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-stone-200 dark:border-zinc-700/50 transition-all duration-500 group-hover:scale-110 group-hover:dark:border-emerald-500/50 group-hover:shadow-primary-green/10">
                  <step.icon className="w-12 h-12 text-primary-green" />
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-gray-900 dark:bg-zinc-700 text-white rounded-2xl flex items-center justify-center font-black text-lg border-4 border-white dark:border-zinc-800">
                    {step.id}
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-black mb-4 tracking-tight text-gray-900 dark:text-white">{step.title}</h3>
              <p className="text-stone-600 dark:text-zinc-300 font-medium leading-relaxed max-w-[250px]">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
