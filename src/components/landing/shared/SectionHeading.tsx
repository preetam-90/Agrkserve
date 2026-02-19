import { motion } from 'framer-motion';

interface SectionHeadingProps {
  kicker: string;
  title: string;
  subtitle: string;
  align?: 'left' | 'center';
}

function SectionHeading({ kicker, title, subtitle, align = 'center' }: SectionHeadingProps) {
  const isCenter = align === 'center';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-15% 0px -10% 0px' }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className={`mb-16 ${isCenter ? 'mx-auto max-w-4xl text-center' : 'max-w-3xl text-left'}`}
    >
      <p className="mb-4 text-[11px] uppercase tracking-[0.28em] text-cyan-300/90">{kicker}</p>
      <h2 className="text-[clamp(2.8rem,6.5vw,5.2rem)] font-semibold leading-[0.92] tracking-[-0.02em] text-white">
        {title}
      </h2>
      <p
        className={`mt-5 text-base text-zinc-300 md:text-xl ${isCenter ? 'mx-auto max-w-2xl' : 'max-w-2xl'}`}
      >
        {subtitle}
      </p>
    </motion.div>
  );
}
