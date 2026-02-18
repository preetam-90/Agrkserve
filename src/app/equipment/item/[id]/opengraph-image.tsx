import { ImageResponse } from 'next/og';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';
export const alt = 'Equipment - AgriServe';
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

async function getEquipment(id: string) {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('equipment')
      .select('name, daily_rate, location_name, category, images, status')
      .eq('id', id)
      .single();
    return data;
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: { id: string } }) {
  const { id } = params;
  const equipment = await getEquipment(id);

  const regular =
    (await tryFetch(`${siteOrigin}/fonts/Inter-Regular.ttf`)) ||
    (await tryFetch(
      'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-UE.woff2'
    ));
  const bold = (await tryFetch(`${siteOrigin}/fonts/Inter-Bold.ttf`)) || regular;

  if (!equipment) {
    // fallback to site OG
    return new ImageResponse(
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0A0F0C 0%, #064E3B 50%, #0A0F0C 100%)',
          fontFamily: regular ? 'Inter' : 'system-ui',
        }}
      >
        <div style={{ color: '#fff', fontSize: 48, fontWeight: 700 }}>AgriServe</div>
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

  const name = equipment.name || 'Farm Equipment';
  const price = equipment.daily_rate || 0;
  const location = equipment.location_name || 'India';
  const category = equipment.category || 'Equipment';
  const img = equipment.images?.[0] || null;

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(p);

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        background: 'linear-gradient(135deg, #0A0F0C 0%, #064E3B 50%, #0A0F0C 100%)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: regular ? 'Inter' : 'system-ui',
      }}
    >
      <div
        style={{
          width: '65%',
          padding: '50px 70px',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'auto' }}>
          <div
            style={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #10B981, #059669)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L4 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-8-4z"
                fill="white"
              />
            </svg>
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF' }}>AgriServe</span>
        </div>

        <div
          style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div
              style={{
                background: 'rgba(16,185,129,0.15)',
                border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: 6,
                padding: '6px 14px',
                fontSize: 14,
                fontWeight: 600,
                color: '#10B981',
              }}
            >
              {category}
            </div>
            <div
              style={{
                background: 'rgba(16,185,129,0.15)',
                border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: 6,
                padding: '6px 14px',
                fontSize: 14,
                fontWeight: 600,
                color: '#10B981',
              }}
            >
              Available
            </div>
          </div>

          <h1
            style={{
              fontSize: name.length > 40 ? 40 : name.length > 25 ? 48 : 56,
              fontWeight: 700,
              color: '#FFFFFF',
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            {name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)' }}>{location}</span>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 'auto',
            paddingTop: 24,
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
              Starting from
            </div>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#10B981' }}>
              {formatPrice(price)}
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 400,
                  color: 'rgba(255,255,255,0.5)',
                  marginLeft: 4,
                }}
              >
                /day
              </span>
            </div>
          </div>
          <div
            style={{
              background: 'linear-gradient(135deg, #10B981, #059669)',
              borderRadius: 12,
              padding: '14px 32px',
              fontSize: 18,
              fontWeight: 600,
              color: '#FFFFFF',
            }}
          >
            Book Now
          </div>
        </div>
      </div>

      <div
        style={{
          width: '35%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: 'rgba(0,0,0,0.3)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {img ? (
          <img src={img} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.1))',
            }}
          >
            <svg
              width="120"
              height="120"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21,15 16,10 5,21" />
            </svg>
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '20px 30px',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
          }}
        >
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
            agriserve.in/equipment
          </div>
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
