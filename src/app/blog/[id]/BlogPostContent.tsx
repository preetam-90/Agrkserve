'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ZoomIn } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Dialog, DialogContent } from '@/components/ui/dialog';

import { ArticleHero } from '@/components/blog/ArticleHero';
import { ArticleSidebar, type TocHeading } from '@/components/blog/ArticleSidebar';
import { ArticleNavigator } from '@/components/blog/ArticleNavigator';
import { ArticleLayout } from '@/components/blog/ArticleLayout';

import { type BlogPost } from '@/lib/seo/blog-content';

interface BlogPostPageProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
  prevPost: { slug: string; title: string } | null;
  nextPost: { slug: string; title: string } | null;
}

interface ProcessedContent {
  html: string;
  headings: TocHeading[];
}

function stripHtml(input: string) {
  return input
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function createProcessedContent(rawHtml: string): ProcessedContent {
  const headings: TocHeading[] = [];
  const usedIds = new Set<string>();

  const html = rawHtml.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (match, levelStr, attrs, content) => {
      const level = Number(levelStr) as 2 | 3;
      const existingId = attrs.match(/\sid=["']([^"']+)["']/i)?.[1];

      const headingText = stripHtml(content);
      if (!headingText) {
        return match;
      }

      let finalId = existingId || slugify(headingText) || `section-${headings.length + 1}`;
      let suffix = 1;

      while (usedIds.has(finalId)) {
        suffix += 1;
        finalId = `${finalId}-${suffix}`;
      }

      usedIds.add(finalId);

      headings.push({
        id: finalId,
        text: headingText,
        level,
      });

      const attrsWithoutId = attrs.replace(/\sid=["'][^"']+["']/i, '');
      return `<h${level}${attrsWithoutId} id="${finalId}">${content}</h${level}>`;
    }
  );

  return { html, headings };
}

export default function BlogPostContent({
  post,
  relatedPosts,
  prevPost,
  nextPost,
}: BlogPostPageProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://agriserve.in';
  const postUrl = `${siteUrl}/blog/${post.id}`;

  const processedContent = useMemo(() => createProcessedContent(post.content), [post.content]);

  const [zoomedImage, setZoomedImage] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    const article = document.querySelector('[data-article-body]');
    if (!article) {
      return;
    }

    const cleanups: Array<() => void> = [];

    const codeBlocks = article.querySelectorAll('pre > code');
    codeBlocks.forEach((codeEl) => {
      const preEl = codeEl.parentElement as HTMLElement | null;
      if (!preEl || preEl.dataset.copyEnhanced === 'true') {
        return;
      }

      preEl.dataset.copyEnhanced = 'true';
      preEl.classList.add('group', 'relative');

      const button = document.createElement('button');
      button.type = 'button';
      button.className =
        'absolute right-3 top-3 inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-white/15 bg-black/55 px-3 text-xs font-semibold text-white/85 transition hover:border-emerald-300/40 hover:text-emerald-100';
      button.setAttribute('aria-label', 'Copy code block');
      const setCopyLabel = (label: 'copy' | 'copied') => {
        button.replaceChildren();

        const span = document.createElement('span');
        if (label === 'copy') {
          span.className = 'copy-label';
          span.textContent = 'Copy';
          button.appendChild(span);
          return;
        }

        span.className = 'inline-flex items-center gap-1';

        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        icon.setAttribute('viewBox', '0 0 24 24');
        icon.setAttribute('width', '14');
        icon.setAttribute('height', '14');
        icon.setAttribute('fill', 'none');
        icon.setAttribute('stroke', 'currentColor');
        icon.setAttribute('stroke-width', '2');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M20 6 9 17l-5-5');
        icon.appendChild(path);

        span.append(icon, document.createTextNode('Copied'));
        button.appendChild(span);
      };

      setCopyLabel('copy');

      const onClick = async () => {
        const text = codeEl.textContent || '';
        await navigator.clipboard.writeText(text);
        setCopyLabel('copied');
        window.setTimeout(() => {
          setCopyLabel('copy');
        }, 1500);
      };

      button.addEventListener('click', onClick);
      preEl.appendChild(button);

      cleanups.push(() => {
        button.removeEventListener('click', onClick);
        button.remove();
      });
    });

    const images = article.querySelectorAll('img');
    images.forEach((img) => {
      const element = img as HTMLImageElement;
      if (!element.src) {
        return;
      }

      element.loading = 'lazy';
      element.decoding = 'async';
      element.classList.add('cursor-zoom-in');

      const onClick = () => {
        setZoomedImage({ src: element.src, alt: element.alt || post.title.en });
      };

      element.addEventListener('click', onClick);
      cleanups.push(() => element.removeEventListener('click', onClick));
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [post.title.en, processedContent.html]);

  return (
    <div className="min-h-screen bg-[var(--editorial-bg)] text-[var(--editorial-fg)] selection:bg-emerald-500/30">
      <ArticleHero
        title={post.title.en}
        excerpt={post.excerpt}
        image={post.image}
        category={post.category}
        author={{
          name: post.author.name,
          image: post.author.avatar,
          role: post.author.role,
        }}
        date={post.date}
        readTime={post.readTime}
      />

      <main className="relative z-20 mx-auto -mt-16 max-w-[var(--landing-max-width)] px-[var(--landing-padding-x)] pb-24 md:-mt-20">
        <ArticleLayout
          content={
            <>
              <div
                data-article-body
                className="editorial-prose prose prose-invert prose-lg md:prose-xl max-w-none"
                dangerouslySetInnerHTML={{ __html: processedContent.html }}
              />

              {processedContent.headings.length > 0 && (
                <details className="border-white/12 mt-8 rounded-2xl border bg-black/20 p-5 lg:hidden">
                  <summary className="cursor-pointer list-none text-sm font-semibold uppercase tracking-[0.13em] text-emerald-200">
                    On This Page
                  </summary>
                  <nav className="mt-4 space-y-1">
                    {processedContent.headings.map((heading) => (
                      <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        className={`block rounded-lg px-3 py-2 text-sm text-white/75 transition hover:bg-white/10 hover:text-white ${
                          heading.level === 3 ? 'ml-3' : ''
                        }`}
                      >
                        {heading.text}
                      </a>
                    ))}
                  </nav>
                </details>
              )}

              {post.tags.length > 0 && (
                <div className="mt-16 border-t border-white/10 pt-8">
                  <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.13em] text-white/45">
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/blog?tag=${encodeURIComponent(tag)}`}
                        className="border-white/12 hover:bg-emerald-500/12 rounded-full border bg-white/[0.06] px-4 py-1.5 text-sm text-white/75 transition-all hover:border-emerald-400/35 hover:text-emerald-200"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-16">
                <ArticleNavigator prev={prevPost} next={nextPost} />
              </div>

              {relatedPosts.length > 0 && (
                <div className="mt-24 border-t border-white/10 pt-12">
                  <div className="mb-8 flex items-center justify-between gap-4">
                    <h3 className="text-2xl font-bold text-white">Read Next</h3>
                    <Link
                      href="/blog"
                      className="group inline-flex items-center gap-1 text-sm font-medium text-emerald-300 hover:text-emerald-200"
                    >
                      View all articles
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {relatedPosts.map((relatedPost) => (
                      <Link
                        key={relatedPost.id}
                        href={`/blog/${relatedPost.id}`}
                        className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all hover:border-emerald-400/30 hover:bg-white/10"
                      >
                        <div className="relative aspect-[16/9] overflow-hidden">
                          <Image
                            src={relatedPost.image}
                            alt={relatedPost.title.en}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/15" />
                        </div>

                        <div className="p-6">
                          <p className="mb-3 text-xs font-bold uppercase tracking-[0.13em] text-emerald-300">
                            {relatedPost.category}
                          </p>
                          <h4 className="mb-3 line-clamp-2 text-xl font-bold text-white transition-colors group-hover:text-emerald-100">
                            {relatedPost.title.en}
                          </h4>
                          <p className="line-clamp-2 text-sm leading-relaxed text-white/60">
                            {relatedPost.excerpt}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          }
          sidebar={
            <ArticleSidebar
              title={post.title.en}
              url={postUrl}
              headings={processedContent.headings}
            />
          }
        />
      </main>

      <Dialog open={!!zoomedImage} onOpenChange={(open) => !open && setZoomedImage(null)}>
        <DialogContent className="max-h-[92vh] max-w-6xl overflow-hidden border-white/15 bg-[#070b08] p-2 sm:p-3">
          {zoomedImage && (
            <div className="relative max-h-[85vh] overflow-hidden rounded-xl">
              <Image
                src={zoomedImage.src}
                alt={zoomedImage.alt}
                width={1800}
                height={1200}
                unoptimized
                className="max-h-[85vh] w-full object-contain"
              />
              <p className="absolute bottom-3 left-3 rounded-md bg-black/55 px-3 py-1 text-xs text-white/85">
                <span className="inline-flex items-center gap-1">
                  <ZoomIn className="h-3.5 w-3.5" />
                  {zoomedImage.alt}
                </span>
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
