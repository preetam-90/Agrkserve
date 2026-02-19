'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, Clock, ChevronRight, BookOpen } from 'lucide-react';
import { BlogPost } from '@/lib/seo/blog-content';
import { Badge } from '@/components/ui/badge';

interface BlogListProps {
  initialPosts: BlogPost[];
  categories: string[];
}

function BlogList({ initialPosts, categories }: BlogListProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter posts based on selected category
  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'All') return initialPosts;
    return initialPosts.filter(
      (post) => post.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [initialPosts, selectedCategory]);

  return (
    <>
      {/* Categories Scroll */}
      <section className="sticky top-20 z-40 mb-12 border-y border-white/5 bg-[#030705]/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="scrollbar-hide flex w-full overflow-x-auto pb-2">
            <div className="flex w-max space-x-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`
                    flex items-center rounded-full px-5 py-2 text-sm font-medium transition-all duration-300
                    ${
                      selectedCategory === cat
                        ? 'scale-105 bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                        : 'bg-white/5 text-white/60 hover:scale-105 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Grid Layout */}
      <div className="mx-auto max-w-7xl px-4">
        <motion.div layout className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredPosts.map((post, index) => (
              <motion.article
                layout
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0A1A16] transition-all duration-500 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-900/20"
              >
                {/* Image */}
                <Link
                  href={`/blog/${post.id}`}
                  className="relative block aspect-[16/10] overflow-hidden"
                >
                  <Image
                    src={post.image}
                    alt={post.title.en}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A1A16] via-transparent to-transparent opacity-60" />

                  <div className="absolute left-4 top-4 z-10">
                    <Badge className="border-white/10 bg-black/60 text-white backdrop-blur-md hover:bg-black/80">
                      {post.category}
                    </Badge>
                  </div>
                </Link>

                {/* Content */}
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-3 flex items-center gap-3 text-xs text-white/40">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-emerald-500/60" />
                      {format(new Date(post.date), 'MMM d, yyyy')}
                    </div>
                    <span className="h-1 w-1 rounded-full bg-white/20" />
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-emerald-500/60" />
                      {post.readTime} min
                    </div>
                  </div>

                  <Link href={`/blog/${post.id}`} className="mb-3 block">
                    <h3 className="line-clamp-2 text-xl font-bold leading-tight text-white transition-colors group-hover:text-emerald-400">
                      {post.title.en}
                    </h3>
                  </Link>

                  <p className="mb-6 line-clamp-2 flex-1 text-sm leading-relaxed text-white/50">
                    {post.excerpt}
                  </p>

                  <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
                    <div className="flex items-center gap-2">
                      {post.author.avatar && (
                        <div className="relative h-6 w-6 overflow-hidden rounded-full ring-1 ring-white/10">
                          <Image
                            src={post.author.avatar}
                            alt={post.author.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <span className="text-xs font-medium text-white/60">{post.author.name}</span>
                    </div>
                    <Link
                      href={`/blog/${post.id}`}
                      className="group/btn flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-emerald-400 transition-all hover:bg-emerald-500 hover:text-white"
                    >
                      <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-32 text-center"
          >
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
              <BookOpen className="h-10 w-10 text-white/20" />
            </div>
            <h3 className="mb-2 text-2xl font-bold text-white">No articles found</h3>
            <p className="text-white/50">Try selecting a different category.</p>
          </motion.div>
        )}
      </div>
    </>
  );
}
