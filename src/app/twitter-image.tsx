import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'AgriServe - Farm Equipment Rental Platform India';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Image generation - Same as OG image for consistency
export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 48,
        background: 'linear-gradient(135deg, #0A0F0C 0%, #1a2f1a 100%)',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px',
        position: 'relative',
      }}
    >
      {/* Decorative Pattern */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.05,
          background: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 20px,
              #D4A853 20px,
              #D4A853 21px
            )`,
        }}
      />

      {/* Logo/Icon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 40,
          background: '#D4A853',
          width: 120,
          height: 120,
          borderRadius: 24,
        }}
      >
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L4 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-8-4z"
            fill="#0A0F0C"
          />
        </svg>
      </div>

      {/* Main Title */}
      <div
        style={{
          fontSize: 72,
          fontWeight: 700,
          color: '#FFFFFF',
          textAlign: 'center',
          marginBottom: 20,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
        }}
      >
        AgriServe
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontSize: 36,
          color: '#D4A853',
          textAlign: 'center',
          marginBottom: 30,
          fontWeight: 500,
        }}
      >
        Farm Equipment Rental Platform
      </div>

      {/* Description */}
      <div
        style={{
          fontSize: 24,
          color: '#E8F5E9',
          textAlign: 'center',
          maxWidth: 900,
          lineHeight: 1.4,
        }}
      >
        Rent tractors, harvesters & agricultural equipment from verified providers across India
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'flex',
          gap: 60,
          marginTop: 50,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontSize: 42,
              fontWeight: 700,
              color: '#D4A853',
            }}
          >
            50,000+
          </div>
          <div
            style={{
              fontSize: 18,
              color: '#B0BEB6',
            }}
          >
            Farmers
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontSize: 42,
              fontWeight: 700,
              color: '#D4A853',
            }}
          >
            10+ States
          </div>
          <div
            style={{
              fontSize: 18,
              color: '#B0BEB6',
            }}
          >
            Coverage
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontSize: 42,
              fontWeight: 700,
              color: '#D4A853',
            }}
          >
            100%
          </div>
          <div
            style={{
              fontSize: 18,
              color: '#B0BEB6',
            }}
          >
            Verified
          </div>
        </div>
      </div>
    </div>,
    {
      ...size,
    }
  );
}
