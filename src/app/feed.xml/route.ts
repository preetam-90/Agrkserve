import { getAllBlogPosts, type BlogPost } from '@/lib/seo/blog-content';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://agriserve.in';

function formatRfc2822(date: Date) {
  return date.toUTCString();
}

function escapeXml(s: string) {
  return s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export async function GET() {
  const posts = getAllBlogPosts()
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 50) as BlogPost[];

  const lastBuildDate =
    posts.length > 0 ? formatRfc2822(new Date(posts[0].date)) : formatRfc2822(new Date());

  const itemsXml = posts
    .map((post) => {
      const postUrl = `${siteUrl}/blog/${post.id}`;
      const pubDate = formatRfc2822(new Date(post.date));
      const title = escapeXml(post.title.en);
      const description = `<![CDATA[${post.excerpt}]]>`;
      const author = escapeXml(post.author.name || '');
      const categories = (post.tags || [])
        .map((t) => `<category>${escapeXml(t)}</category>`)
        .join('');
      const content = `<![CDATA[${post.content}]]>`;

      return `
        <item>
          <title>${title}</title>
          <link>${postUrl}</link>
          <guid isPermaLink="true">${postUrl}</guid>
          <pubDate>${pubDate}</pubDate>
          <description>${description}</description>
          <author>${author}</author>
          ${categories}
          <content:encoded>${content}</content:encoded>
        </item>`;
    })
    .join('\n');

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
    <channel>
      <title>AgriServe Blog</title>
      <link>${siteUrl}/blog</link>
      <description>Insights, guides and practical tips for Indian farmers — equipment, crops, soil and policy updates.</description>
      <language>en-IN</language>
      <lastBuildDate>${lastBuildDate}</lastBuildDate>
      ${itemsXml}
    </channel>
  </rss>`;

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}
