'use client';

import { motion, useScroll, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  Facebook,
  Heart,
  Linkedin,
  Link as LinkIcon,
  MessageCircle,
  Share2,
  Twitter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

interface ArticleSidebarProps {
  title: string;
  url: string;
  headings: TocHeading[];
}

export function ArticleSidebar({ title, url, headings }: ArticleSidebarProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });

  const [activeSection, setActiveSection] = useState<string>('');
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!headings.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry?.target.id) {
          setActiveSection(visibleEntry.target.id);
        }
      },
      { rootMargin: '-22% 0px -60% 0px', threshold: [0.2, 0.5, 1] }
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
      color: 'hover:text-green-400',
    },
    {
      name: 'Twitter/X',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      color: 'hover:text-sky-400',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      color: 'hover:text-blue-400',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: 'hover:text-indigo-300',
    },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <motion.div
        className="fixed left-0 right-0 top-0 z-50 h-1 origin-left bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"
        style={{ scaleX }}
      />

      <aside className="hidden max-h-[calc(100vh-6.5rem)] flex-col gap-6 overflow-hidden lg:sticky lg:top-24 lg:flex">
        <div className="border-white/12 rounded-2xl border bg-black/25 p-4 backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
              Engage
            </p>
            <button
              type="button"
              onClick={() => setLiked((prev) => !prev)}
              className={cn(
                'inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all',
                liked
                  ? 'border-emerald-400/40 bg-emerald-400/15 text-emerald-300'
                  : 'border-white/12 bg-white/5 text-white/70 hover:border-white/25 hover:text-white'
              )}
              aria-label={liked ? 'Unlike this article' : 'Like this article'}
            >
              <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {shareLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white/70 transition-all hover:border-white/20 hover:bg-white/10',
                  link.color
                )}
                aria-label={`Share on ${link.name}`}
              >
                <link.icon className="h-4 w-4" />
                <span className="text-xs">{link.name.split('/')[0]}</span>
              </a>
            ))}
          </div>

          <button
            type="button"
            onClick={copyToClipboard}
            className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-500/10 text-sm text-emerald-200 transition-all hover:bg-emerald-500/20"
          >
            <LinkIcon className="h-4 w-4" />
            {copied ? 'Link Copied' : 'Copy Link'}
          </button>
        </div>

        <div className="border-white/12 min-h-0 flex-1 overflow-hidden rounded-2xl border bg-black/25 p-5 backdrop-blur-xl">
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
            On This Page
          </h4>

          {headings.length ? (
            <nav className="h-full space-y-1 overflow-y-auto overscroll-contain pr-1">
              {headings.map((heading) => {
                const isActive = heading.id === activeSection;
                return (
                  <a
                    key={heading.id}
                    href={`#${heading.id}`}
                    className={cn(
                      'block rounded-lg px-3 py-2 text-sm transition-colors',
                      heading.level === 3 ? 'ml-3 text-white/60' : 'text-white/70',
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-200'
                        : 'hover:bg-white/[0.07] hover:text-white'
                    )}
                  >
                    {heading.text}
                  </a>
                );
              })}
            </nav>
          ) : (
            <p className="text-sm leading-relaxed text-white/55">
              No sections detected in this article.
            </p>
          )}
        </div>
      </aside>

      <div className="fixed bottom-6 right-6 z-40 lg:hidden">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-600"
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title, url });
              return;
            }
            copyToClipboard();
          }}
          aria-label="Share this article"
        >
          <Share2 className="h-6 w-6" />
        </Button>
      </div>
    </>
  );
}
