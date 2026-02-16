'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import Link from 'next/link';

interface ArticleHeroProps {
  title: string;
  excerpt: string;
  image: string;
  category: string;
  author: {
    name: string;
    image?: string;
    role?: string;
  };
  date: string;
  readTime: number;
  immersive?: boolean;
}

export function ArticleHero({
  title,
  excerpt,
  image,
  category,
  author,
  date,
  readTime,
  immersive = true,
}: ArticleHeroProps) {
  const formattedDate = new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const imageY = useTransform(scrollY, [0, 700], [0, reduceMotion ? 0 : 84]);
  const overlayOpacity = useTransform(scrollY, [0, 500], [0.5, 0.74]);

  return (
    <header
      className="relative flex w-full flex-col justify-end overflow-hidden pb-16 md:pb-24"
      style={{ minHeight: immersive ? '100svh' : '75svh' }}
    >
      <motion.div className="absolute inset-0 z-0 select-none" style={{ y: imageY }}>
        <Image
          src={image}
          alt={title}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      </motion.div>

      <motion.div className="absolute inset-0 z-[1]" style={{ opacity: overlayOpacity }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/45 to-[#020503]" />
        <div className="absolute inset-0 bg-[radial-gradient(110%_70%_at_50%_0%,rgba(16,185,129,0.2),transparent)]" />
      </motion.div>

      <div className="absolute inset-0 z-[2] bg-[url('/grid.svg')] bg-center opacity-25 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <div className="relative z-10 mx-auto w-full max-w-[var(--landing-max-width)] px-[var(--landing-padding-x)]">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="mb-6 flex flex-wrap items-center gap-3"
          >
            <Link
              href="/blog"
              className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-black/20 px-4 text-sm font-medium text-emerald-200 backdrop-blur-md transition-colors hover:text-emerald-100"
            >
              <ArrowRight className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-1" />
              Back to Blog
            </Link>
            <Badge
              variant="outline"
              className="border-emerald-400/35 bg-emerald-500/12 px-3 py-1 text-xs uppercase tracking-[0.14em] text-emerald-200"
            >
              {category}
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: 'easeOut' }}
            className="max-w-[20ch] text-balance text-4xl font-bold leading-[1.04] tracking-[-0.02em] text-white md:text-6xl lg:text-7xl"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16, ease: 'easeOut' }}
            className="mt-6 max-w-[62ch] text-lg leading-relaxed text-white/82 md:text-xl"
          >
            {excerpt}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease: 'easeOut' }}
            className="mt-8 flex flex-wrap items-center gap-4 border-t border-white/12 pt-7"
          >
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/20 px-3 py-2 backdrop-blur-md">
              <Avatar src={author.image} name={author.name} className="h-10 w-10" />
              <div>
                <p className="text-sm font-semibold text-white">{author.name}</p>
                {author.role && <p className="text-xs text-white/60">{author.role}</p>}
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/75 backdrop-blur-md">
              <Calendar className="h-4 w-4 text-emerald-300" />
              <span>{formattedDate}</span>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/75 backdrop-blur-md">
              <Clock className="h-4 w-4 text-emerald-300" />
              <span>{readTime} min read</span>
            </div>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
