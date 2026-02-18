import { notFound } from 'next/navigation';
import { getBlogPostBySlug, getBlogPostsByCategory } from '@/lib/seo/blog-content';
import {
  createBlogPostingSchema,
  createBlogBreadcrumbSchema,
  createAuthorSchema,
  type BlogPost as SchemaBlogPost,
} from '@/lib/seo/blog-schemas';
import type { Metadata } from 'next';
import BlogPostContent from './BlogPostContent';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://agriserve.in';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = getBlogPostBySlug(id);
  if (!post) return { title: 'Article not found' };

  const title = post.title.en;
  const description = post.metaDescription || post.excerpt;
  const ogImage = `${siteUrl}/blog/${id}/opengraph-image`;

  // Build schema objects for JSON-LD
  const schemaPost: SchemaBlogPost = {
    title: post.title.en,
    description: post.metaDescription || post.excerpt,
    image: post.image,
    datePublished: post.date,
    dateModified: post.date,
    author: { name: post.author.name, url: post.author.url, image: post.author.avatar },
    url: `${siteUrl}/blog/${post.id}`,
    articleBody: post.content.replace(/<[^>]+>/g, ' ').slice(0, 3000),
    articleSection: post.category,
    keywords: post.keywords,
    inLanguage: 'en-IN' as const,
  };

  const authorSchema = createAuthorSchema({
    name: post.author.name,
    image: post.author.avatar,
    url: post.author.url,
  });

  const blogPostingJson = createBlogPostingSchema(schemaPost);
  const breadcrumbJson = createBlogBreadcrumbSchema(schemaPost);

  const jsonLd = [blogPostingJson, breadcrumbJson, authorSchema];

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    keywords: post.keywords,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/blog/${id}`,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    alternates: {
      canonical: `${siteUrl}/blog/${id}`,
    },
    other: {
      'script:ld+json': JSON.stringify(jsonLd),
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = getBlogPostBySlug(id);

  if (!post) {
    return notFound();
  }

  // Get related posts
  const relatedPosts = getBlogPostsByCategory(post.category)
    .filter((p) => p.id !== post.id)
    .slice(0, 2);

  return (
    <BlogPostContent post={post} relatedPosts={relatedPosts} prevPost={null} nextPost={null} />
  );
}
