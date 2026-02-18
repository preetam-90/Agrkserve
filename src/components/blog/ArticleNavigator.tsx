'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ArticleNavigatorProps {
  prev: {
    slug: string;
    title: string;
  } | null;
  next: {
    slug: string;
    title: string;
  } | null;
}

export function ArticleNavigator({ prev, next }: ArticleNavigatorProps) {
  return (
    <nav className="border-t border-white/10 pb-8 pt-16">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {prev ? (
          <Link
            href={`/blog/${prev.slug}`}
            className="group flex transform flex-col items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:-translate-y-1 hover:border-emerald-500/30 hover:bg-white/10"
          >
            <div className="flex items-center gap-2 text-sm text-white/50 group-hover:text-emerald-400">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span>Previous Article</span>
            </div>
            <h4 className="line-clamp-2 text-xl font-semibold text-white transition-colors group-hover:text-emerald-100">
              {prev.title}
            </h4>
          </Link>
        ) : (
          <div />
        )}

        {next ? (
          <Link
            href={`/blog/${next.slug}`}
            className="group flex transform flex-col items-end gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-right transition-all hover:-translate-y-1 hover:border-emerald-500/30 hover:bg-white/10"
          >
            <div className="flex items-center gap-2 text-sm text-white/50 group-hover:text-emerald-400">
              <span>Next Article</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
            <h4 className="line-clamp-2 text-xl font-semibold text-white transition-colors group-hover:text-emerald-100">
              {next.title}
            </h4>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </nav>
  );
}
