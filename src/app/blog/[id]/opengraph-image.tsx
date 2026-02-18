import { ImageResponse } from 'next/og';
import { getBlogPostBySlug } from '@/lib/seo/blog-content';

export const runtime = 'edge';
export const alt = 'Blog Post - AgriServe';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL || '';

async function tryFetch(path: string) {
  try {
    const res = await fetch(path);
    if (res.ok) return res.arrayBuffer();
  } catch {
    return null;
  }
  return null;
}

export default async function Image({ params }: { params: { id: string } }) {
  const { id } = params;
  const post = getBlogPostBySlug(id);

  const regular =
    (await tryFetch(`${siteOrigin}/fonts/Inter-Regular.ttf`)) ||
    (await tryFetch(
      'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-UE.woff2'
    ));
  const bold = (await tryFetch(`${siteOrigin}/fonts/Inter-Bold.ttf`)) || regular;

  const title = post ? post.title.en : 'Blog Post';
  const category = post ? post.category : 'Article';
  const author = post ? post.author.name : '';
  const readTime = post ? `${post.readTime} min read` : '';

  const categoryColors: Record<string, string> = {
    Technology: '#3B82F6',
    Sustainability: '#10B981',
    Analytics: '#8B5CF6',
    Equipment: '#F59E0B',
    Guides: '#EC4899',
  };

  const categoryColor = categoryColors[category] || '#10B981';

  return new ImageResponse(
    <div
      style={{
        fontSize: 48,
        background: 'linear-gradient(135deg, #0A0F0C 0%, #064E3B 50%, #0A0F0C 100%)',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '60px 80px',
        position: 'relative',
        fontFamily: regular ? 'Inter' : 'system-ui',
      }}
    >
      <div style={{ position: 'absolute', top: 20, left: 24 }}>
        <img src="/logo.png" alt="AgriServe" width={64} height={64} />
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #10B981, #059669)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L4 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-8-4z"
                fill="white"
              />
            </svg>
          </div>
          <span style={{ fontSize: 24, fontWeight: 700, color: '#FFFFFF' }}>AgriServe Blog</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: `${categoryColor}20`,
            border: `1px solid ${categoryColor}40`,
            borderRadius: 50,
            padding: '8px 20px',
          }}
        >
          <div style={{ width: 8, height: 8, background: categoryColor, borderRadius: '50%' }} />
          <span style={{ fontSize: 18, fontWeight: 600, color: categoryColor }}>{category}</span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h1
          style={{
            fontSize: title.length > 50 ? 48 : title.length > 30 ? 56 : 64,
            fontWeight: 700,
            color: '#FFFFFF',
            lineHeight: 1.2,
            margin: 0,
            maxWidth: '90%',
          }}
        >
          {title}
        </h1>
        {post?.excerpt && (
          <p
            style={{
              fontSize: 20,
              color: 'rgba(255,255,255,0.6)',
              marginTop: 24,
              maxWidth: '80%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {post.excerpt}
          </p>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'auto',
          paddingTop: 30,
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10B981, #06B6D4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF' }}>
              {author
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </span>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#FFFFFF' }}>{author}</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Author</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {readTime && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: 'rgba(255,255,255,0.6)',
                fontSize: 16,
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" />
              </svg>
              {readTime}
            </div>
          )}
          <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }}>agriserve.in/blog</div>
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts:
        bold && regular
          ? [
              { name: 'Inter', data: bold as ArrayBuffer, weight: 700 },
              { name: 'Inter', data: regular as ArrayBuffer, weight: 400 },
            ]
          : undefined,
    }
  );
}
