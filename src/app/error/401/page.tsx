import { Metadata } from 'next';
import { SystemPageLayout } from '@/components/system-pages/SystemPageLayout';
import { ErrorPageTemplate } from '@/components/system-pages/ErrorPageTemplate';
import { generateSystemPageMetadata, metadataConfigs } from '@/lib/system-pages/page-metadata';

export const metadata: Metadata = generateSystemPageMetadata(metadataConfigs.error401);

function LoginRequiredIllustration() {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      role="img"
      aria-label="Door with floating key and knock ripples for login required"
    >
      <style>{`
        @keyframes s401Float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes s401Ripple { 0% { r: 4; opacity: 0.6; } 100% { r: 20; opacity: 0; } }
        @keyframes s401KeyGlow { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes s401DoorGlow { 0%,100% { opacity: 0.1; } 50% { opacity: 0.3; } }
        .s401-float { animation: s401Float 4s ease-in-out infinite; }
        .s401-ripple1 { animation: s401Ripple 2.5s ease-out infinite; }
        .s401-ripple2 { animation: s401Ripple 2.5s ease-out 0.8s infinite; }
        .s401-ripple3 { animation: s401Ripple 2.5s ease-out 1.6s infinite; }
        .s401-key-glow { animation: s401KeyGlow 2s ease-in-out infinite; }
        .s401-door-glow { animation: s401DoorGlow 3s ease-in-out infinite; }
        @media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
      `}</style>

      <defs>
        <radialGradient id="s401-amberGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="s401-greenGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22C55E" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="s401-doorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a2e1a" />
          <stop offset="100%" stopColor="#0d200f" />
        </linearGradient>
      </defs>

      <circle cx="100" cy="100" r="95" fill="url(#s401-greenGlow)" />

      {/* Door frame */}
      <rect
        x="55"
        y="25"
        width="90"
        height="155"
        rx="4"
        fill="#0d200f"
        stroke="#22C55E"
        strokeWidth="0.5"
        opacity="0.3"
      />

      {/* Door */}
      <rect
        x="60"
        y="30"
        width="80"
        height="145"
        rx="3"
        fill="url(#s401-doorGrad)"
        stroke="#22C55E"
        strokeWidth="1.5"
        opacity="0.9"
      />

      {/* Door panel lines */}
      <rect
        x="68"
        y="40"
        width="64"
        height="50"
        rx="2"
        fill="none"
        stroke="#22C55E"
        strokeWidth="0.5"
        opacity="0.2"
      />
      <rect
        x="68"
        y="100"
        width="64"
        height="50"
        rx="2"
        fill="none"
        stroke="#22C55E"
        strokeWidth="0.5"
        opacity="0.2"
      />

      {/* Door glow effect */}
      <rect
        x="60"
        y="30"
        width="80"
        height="145"
        rx="3"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="1"
        className="s401-door-glow"
      />

      {/* Keyhole */}
      <circle cx="125" cy="100" r="6" fill="#071a07" stroke="#f59e0b" strokeWidth="1" />
      <rect
        x="123"
        y="106"
        width="4"
        height="10"
        rx="1"
        fill="#071a07"
        stroke="#f59e0b"
        strokeWidth="0.8"
      />

      {/* Keyhole amber glow */}
      <circle cx="125" cy="100" r="10" fill="#f59e0b" opacity="0.08" className="s401-key-glow" />

      {/* Door handle */}
      <circle cx="125" cy="85" r="3" fill="#22C55E" opacity="0.5" />
      <circle cx="125" cy="85" r="5" fill="#22C55E" opacity="0.1" />

      {/* Knock ripples on door */}
      <circle
        cx="90"
        cy="70"
        r="4"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="1"
        className="s401-ripple1"
        opacity="0"
      />
      <circle
        cx="90"
        cy="70"
        r="4"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="0.7"
        className="s401-ripple2"
        opacity="0"
      />
      <circle
        cx="90"
        cy="70"
        r="4"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="0.4"
        className="s401-ripple3"
        opacity="0"
      />

      {/* Floating key */}
      <g className="s401-float" style={{ transformOrigin: '35px 100px' }}>
        <ellipse cx="35" cy="100" rx="20" ry="20" fill="url(#s401-amberGlow)" />

        {/* Key bow (round part) */}
        <circle cx="25" cy="100" r="8" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
        <circle cx="25" cy="100" r="3" fill="#f59e0b" opacity="0.3" />

        {/* Key shaft */}
        <rect x="33" y="98" width="18" height="4" rx="1.5" fill="#f59e0b" opacity="0.9" />

        {/* Key teeth */}
        <rect x="46" y="95" width="3" height="4" rx="0.5" fill="#f59e0b" opacity="0.8" />
        <rect x="42" y="95" width="3" height="3" rx="0.5" fill="#f59e0b" opacity="0.7" />

        {/* Key glow */}
        <circle cx="35" cy="100" r="14" fill="#f59e0b" opacity="0.06" className="s401-key-glow" />
      </g>

      {/* Ambient sparkles */}
      <circle cx="40" cy="40" r="1" fill="#f59e0b" opacity="0.4" className="s401-key-glow" />
      <circle
        cx="160"
        cy="35"
        r="1.5"
        fill="#22C55E"
        opacity="0.3"
        className="s401-key-glow"
        style={{ animationDelay: '0.5s' }}
      />
      <circle
        cx="155"
        cy="165"
        r="1"
        fill="#f59e0b"
        opacity="0.3"
        className="s401-key-glow"
        style={{ animationDelay: '1s' }}
      />
      <circle
        cx="45"
        cy="160"
        r="1.5"
        fill="#22C55E"
        opacity="0.2"
        className="s401-key-glow"
        style={{ animationDelay: '1.5s' }}
      />
    </svg>
  );
}

export default function Unauthorized401Page() {
  return (
    <SystemPageLayout>
      <ErrorPageTemplate
        errorCode="401"
        title="Login Required"
        description="You need to login to access this page. Please login or create a new account."
        illustration={<LoginRequiredIllustration />}
        primaryAction={{
          label: 'Login',
          href: '/login',
        }}
        secondaryAction={{
          label: 'Register',
          href: '/login',
        }}
      />
    </SystemPageLayout>
  );
}
