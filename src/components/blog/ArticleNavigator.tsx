'use client';

import { motion } from 'framer-motion';
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
        <nav className="border-t border-white/10 pt-16 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {prev ? (
                    <Link
                        href={`/blog/${prev.slug}`}
                        className="group flex flex-col items-start gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 transition-all transform hover:-translate-y-1"
                    >
                        <div className="flex items-center gap-2 text-sm text-white/50 group-hover:text-emerald-400">
                            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            <span>Previous Article</span>
                        </div>
                        <h4 className="text-xl font-semibold text-white group-hover:text-emerald-100 transition-colors line-clamp-2">
                            {prev.title}
                        </h4>
                    </Link>
                ) : (
                    <div />
                )}

                {next ? (
                    <Link
                        href={`/blog/${next.slug}`}
                        className="group flex flex-col items-end gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 transition-all transform hover:-translate-y-1 text-right"
                    >
                        <div className="flex items-center gap-2 text-sm text-white/50 group-hover:text-emerald-400">
                            <span>Next Article</span>
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </div>
                        <h4 className="text-xl font-semibold text-white group-hover:text-emerald-100 transition-colors line-clamp-2">
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
