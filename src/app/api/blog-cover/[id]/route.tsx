import { ImageResponse } from 'next/og';
import { getBlogPostBySlug } from '@/lib/seo/blog-content';

export const runtime = 'edge';
export const size = { width: 1400, height: 860 };
export const contentType = 'image/png';

function colorByCategory(category: string) {
  const key = category.toLowerCase();
  if (key.includes('technology')) {
    return ['#06201a', '#0f766e'];
  }
  if (key.includes('economics')) {
    return ['#111827', '#14532d'];
  }
  if (key.includes('policy')) {
    return ['#111827', '#1e3a8a'];
  }
  if (key.includes('crops')) {
    return ['#052e16', '#166534'];
  }
  if (key.includes('equipment')) {
    return ['#1f2937', '#065f46'];
  }
  return ['#0b1020', '#14532d'];
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const post = getBlogPostBySlug(id);

  if (!post) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0b1020',
            color: '#e5e7eb',
            fontSize: 48,
            fontWeight: 700,
          }}
        >
          Blog Cover
        </div>
      ),
      size
    );
  }

  const [start, end] = colorByCategory(post.category);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          padding: '72px',
          background: `linear-gradient(130deg, ${start}, ${end})`,
          color: '#f8fafc',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 18% 22%, rgba(52,211,153,0.35) 0, rgba(52,211,153,0) 46%), radial-gradient(circle at 84% 78%, rgba(34,211,238,0.24) 0, rgba(34,211,238,0) 42%)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            right: 48,
            top: 36,
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 999,
            padding: '10px 18px',
            fontSize: 24,
            letterSpacing: 0.6,
            opacity: 0.9,
          }}
        >
          {post.category}
        </div>

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            width: '100%',
          }}
        >
          <div
            style={{
              fontSize: 26,
              textTransform: 'uppercase',
              letterSpacing: 1.8,
              color: '#86efac',
              marginBottom: 16,
            }}
          >
            AgriServe Insights
          </div>
          <div
            style={{
              fontSize: 68,
              lineHeight: 1.08,
              fontWeight: 800,
              maxWidth: '92%',
              textWrap: 'balance',
            }}
          >
            {post.title.en}
          </div>
          <div
            style={{
              marginTop: 20,
              fontSize: 30,
              lineHeight: 1.35,
              maxWidth: '88%',
              color: 'rgba(248,250,252,0.9)',
            }}
          >
            {post.excerpt}
          </div>
        </div>
      </div>
    ),
    size
  );
}

