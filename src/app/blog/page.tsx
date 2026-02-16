
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  ArrowRight,
  Search,
  Sparkles,
  BookOpen,
  ChevronRight,
  Star,
  Tag,
  Filter,
} from 'lucide-react';
import { getAllBlogPosts, type BlogPost as ContentBlogPost } from '@/lib/seo/blog-content';
import { createBlogListingSchema, type BlogPost as SchemaBlogPost } from '@/lib/seo/blog-schemas';
import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const PER_PAGE = 12;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://agriserve.in';

export async function generateMetadata(): Promise<Metadata> {
  const posts = getAllBlogPosts() as ContentBlogPost[];
  const title = 'AgriServe Blog | Expert Farming Tips & Tech';
  const description =
    'Your daily source for modern farming techniques, equipment rental guides, and agricultural technology trends in India.';
  const keywords = Array.from(new Set(posts.flatMap((p) => p.keywords || []))).slice(0, 20);

  // Create JSON-LD schema for the blog listing
  const schemaPosts: SchemaBlogPost[] = posts.slice(0, PER_PAGE).map((p) => ({
    title: p.title.en,
    description: p.metaDescription || p.excerpt,
    image: p.image,
    datePublished: p.date,
    dateModified: p.date,
    author: {
      name: p.author.name,
      url: p.author.url,
      image: p.author.avatar,
    },
    url: `${siteUrl}/blog/${p.id}`,
    articleBody: undefined,
    wordCount: undefined,
    articleSection: p.category,
    keywords: p.keywords,
    inLanguage: 'en-IN',
  }));

  const jsonLd = createBlogListingSchema(schemaPosts, 1);

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    keywords,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/blog`,
      siteName: 'AgriServe',
      images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${siteUrl}/og-image.png`],
    },
    alternates: {
      canonical: `${siteUrl}/blog`,
    },
    other: {
      'script:ld+json': JSON.stringify(jsonLd),
    },
  };
}

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ page?: string; category?: string } | undefined> }) {
  const resolvedSearchParams = await searchParams;
  const page = Math.max(1, parseInt(resolvedSearchParams?.page || '1', 10) || 1);
  const categoryFilter = resolvedSearchParams?.category;

  let posts = getAllBlogPosts() as ContentBlogPost[];

  // Filter by category if present
  if (categoryFilter && categoryFilter !== 'All') {
    posts = posts.filter(p => p.category.toLowerCase() === categoryFilter.toLowerCase());
  }

  const total = posts.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const start = (page - 1) * PER_PAGE;
  const pagePosts = posts.slice(start, start + PER_PAGE);

  // Featured Post is the first one if we are on page 1 and no filter is applied (or just always first of the list)
  const featuredPost = page === 1 && !categoryFilter ? pagePosts[0] : null;
  const gridPosts = featuredPost ? pagePosts.slice(1) : pagePosts;

  const categories = ['All', 'Technology', 'Equipment', 'Economics', 'Crops', 'Policy'];

  return (
    <div className="min-h-screen bg-[#030705] text-white selection:bg-emerald-500/30">

      {/* Decorative background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] animate-pulse rounded-full bg-emerald-500/10 blur-[100px]" />
        <div className="absolute right-0 bottom-0 h-[600px] w-[600px] rounded-full bg-cyan-500/5 blur-[120px]" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-12 px-4">
        <div className="mx-auto max-w-7xl text-center">
          <Badge variant="outline" className="mb-6 rounded-full border-emerald-500/30 bg-emerald-500/10 px-4 py-1 text-emerald-400 hover:bg-emerald-500/20 transition-colors">
            <Sparkles className="mr-2 h-3 w-3" />
            AgriServe Knowledge Hub
          </Badge>
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight md:text-7xl">
            Farming <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Smarter</span>, <br className="hidden md:block" /> Not Just Harder.
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/60 md:text-xl leading-relaxed">
            Expert advice on farm mechanization, crop management, and the business of agriculture. Written for the modern Indian farmer.
          </p>

          {/* Newsletter CTA Component */}
          <div className="mt-10 max-w-md mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center bg-[#0A1A16] rounded-lg p-1.5 border border-white/10">
              <Input
                type="email"
                placeholder="Enter your email for weekly tips..."
                className="bg-transparent border-none text-white focus-visible:ring-0 placeholder:text-white/40 h-10"
              />
              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-6 h-10 rounded-md">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Scroll */}
      <section className="sticky top-20 z-40 border-y border-white/5 bg-[#030705]/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-2 p-1">
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={cat === 'All' ? '/blog' : `/blog?category=${cat}`}
                  className={`
                    flex items-center rounded-full px-5 py-2 text-sm font-medium transition-all
                    ${(categoryFilter === cat || (!categoryFilter && cat === 'All'))
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'}
                  `}
                >
                  {cat}
                </Link>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>
        </div>
      </section>

      <main className="relative z-10 px-4 py-16">
        <div className="mx-auto max-w-7xl">

          {/* Featured Post */}
          {featuredPost && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" /> Featured Article
              </h2>
              <div className="group relative grid overflow-hidden rounded-3xl border border-white/10 bg-[#0A1A16] md:grid-cols-2 lg:h-[450px]">
                <div className="relative h-64 w-full md:h-full overflow-hidden">
                  <Image
                    src={featuredPost.image}
                    alt={featuredPost.title.en}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A1A16] md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-[#0A1A16]" />
                </div>
                <div className="flex flex-col justify-center p-8 md:p-12">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30">
                      {featuredPost.category}
                    </Badge>
                    <span className="text-sm text-white/40 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {featuredPost.readTime} min read
                    </span>
                  </div>
                  <Link href={`/blog/${featuredPost.id}`}>
                    <h3 className="text-3xl font-bold text-white mb-4 leading-tight group-hover:text-emerald-400 transition-colors">
                      {featuredPost.title.en}
                    </h3>
                  </Link>
                  <p className="text-white/60 text-lg mb-6 line-clamp-3">
                    {featuredPost.excerpt}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3">
                      {featuredPost.author.avatar && (
                        <Image src={featuredPost.author.avatar} width={40} height={40} alt={featuredPost.author.name} className="rounded-full ring-2 ring-emerald-500/20" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-white">{featuredPost.author.name}</p>
                        <p className="text-xs text-white/40">{featuredPost.author.role || 'Writer'}</p>
                      </div>
                    </div>
                    <Link href={`/blog/${featuredPost.id}`}>
                      <Button variant="ghost" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 group-hover:translate-x-1 transition-transform">
                        Read Full Article <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grid Layout */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {gridPosts.map((post) => (
              <article
                key={post.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0A1A16] hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-900/10 transition-all duration-300"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title.en}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-semibold text-white border border-white/10">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-3 text-xs text-white/40 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(post.date), 'MMM d, yyyy')}
                    </div>
                    <span className="h-1 w-1 rounded-full bg-white/20" />
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {post.readTime} min
                    </div>
                  </div>

                  <Link href={`/blog/${post.id}`} className="block mb-3">
                    <h3 className="text-xl font-bold text-white transition-colors group-hover:text-emerald-400 line-clamp-2">
                      {post.title.en}
                    </h3>
                  </Link>

                  <p className="text-white/50 text-sm line-clamp-2 mb-6 flex-1">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                    <span className="text-xs font-medium text-white/60">By {post.author.name}</span>
                    <Link href={`/blog/${post.id}`} className="p-2 -mr-2 rounded-full hover:bg-white/5 text-emerald-400 transition-colors">
                      <ChevronRight className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Empty State */}
          {posts.length === 0 && (
            <div className="py-20 text-center">
              <BookOpen className="h-16 w-16 text-white/10 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No articles found</h3>
              <p className="text-white/50">Try selecting a different category.</p>
            </div>
          )}

          {/* Pagination (Simple) */}
          {totalPages > 1 && (
            <div className="mt-16 flex justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Link
                  key={i + 1}
                  href={`/blog?page=${i + 1}${categoryFilter ? `&category=${categoryFilter}` : ''}`}
                  className={`h-10 w-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${(i + 1) === page ? 'bg-emerald-500 text-black' : 'bg-white/5 text-white hover:bg-white/10'
                    }`}
                >
                  {i + 1}
                </Link>
              ))}
            </div>
          )}

        </div>
      </main>

      {/* Footer / Contact CTA */}
      <section className="relative z-10 py-24 px-4 border-t border-white/5 bg-[#030705]">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Have a topic you want us to cover?</h2>
          <p className="text-white/60 mb-8 max-w-xl mx-auto">
            We write for you. Let us know what challenges you are facing on your farm today.
          </p>
          <Button variant="outline" className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10">
            Request a Topic
          </Button>
        </div>
      </section>
    </div>
  );
}
