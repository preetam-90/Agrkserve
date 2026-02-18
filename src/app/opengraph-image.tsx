import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'AgriServe - Rent Farm Equipment | Hire Agricultural Labour';
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

export default async function Image() {
  const regular =
    (await tryFetch(`${siteOrigin}/fonts/Inter-Regular.ttf`)) ||
    (await tryFetch(
      'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-UE.woff2'
    ));
  const bold = (await tryFetch(`${siteOrigin}/fonts/Inter-Bold.ttf`)) || regular;

  // check logo presence
  let hasLogo = false;
  try {
    const r = await fetch(`${siteOrigin}/logo.png`);
    hasLogo = r.ok;
  } catch {
    hasLogo = false;
  }

  return new ImageResponse(
    <div
      style={{
        fontSize: 48,
        background: 'linear-gradient(135deg, #0A0F0C 0%, #064E3B 50%, #0A0F0C 100%)',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px',
        position: 'relative',
        fontFamily: regular ? 'Inter, system-ui' : 'system-ui',
      }}
    >
      {hasLogo && (
        <div style={{ position: 'absolute', top: 40, left: 60 }}>
          <img src="/logo.png" alt="AgriServe" width={96} height={96} />
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.03,
          background:
            'repeating-linear-gradient(45deg, transparent, transparent 30px, #10B981 30px, #10B981 31px)',
        }}
      />

      <div
        style={{
          fontSize: 80,
          fontWeight: 700,
          color: '#FFFFFF',
          textAlign: 'center',
          marginBottom: 16,
        }}
      >
        AgriServe
      </div>

      <div
        style={{
          fontSize: 32,
          fontWeight: 700,
          background: 'linear-gradient(90deg, #10B981, #06B6D4)',
          backgroundClip: 'text',
          color: 'transparent',
          textAlign: 'center',
          marginBottom: 12,
        }}
      >
        Rent Farm Equipment | Hire Agricultural Labour
      </div>

      <div
        style={{
          fontSize: 26,
          color: '#F59E0B',
          textAlign: 'center',
          marginBottom: 40,
          fontWeight: 500,
        }}
      >
        किराये पर कृषि उपकरण
      </div>

      <div
        style={{
          fontSize: 20,
          color: 'rgba(255,255,255,0.75)',
          textAlign: 'center',
          maxWidth: 900,
        }}
      >
        Tractors, Harvesters & Equipment on Rent — Verified providers across India. Best prices और
        भरोसेमंद सेवा।
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 30,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>agriserve.in</div>
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
