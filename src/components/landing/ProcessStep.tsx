'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface ProcessStepProps {
  step: number;
  icon: LucideIcon;
  title: string;
  description: string;
  delay: number;
}

export function ProcessStep({ step, icon: Icon, title, description, delay }: ProcessStepProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className="flex flex-col items-center text-center space-y-4"
    >
      <motion.div
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-lg">
          <Icon className="w-10 h-10 text-white" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-lime-400 flex items-center justify-center text-sm font-bold text-green-900">
          {step}
        </div>
      </motion.div>
      
      <h3 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h3>
      <p className="text-gray-600 max-w-xs">{description}</p>
    </motion.article>
  );
}
