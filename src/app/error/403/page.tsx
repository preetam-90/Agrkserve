import { Metadata } from 'next';
import { SystemPageLayout } from '@/components/system-pages/SystemPageLayout';
import { ErrorPageTemplate } from '@/components/system-pages/ErrorPageTemplate';
import { generateSystemPageMetadata, metadataConfigs } from '@/lib/system-pages/page-metadata';

export const metadata: Metadata = generateSystemPageMetadata(metadataConfigs.error403);

function AccessDeniedIllustration() {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      role="img"
      aria-label="Shield with pulsing lock icon for access denied"
    >
      <style>{`
        @keyframes s403Dash { to { stroke-dashoffset: 0; } }
        @keyframes s403Pulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes s403RedGlow { 0%,100% { opacity: 0.15; } 50% { opacity: 0.4; } }
        @keyframes s403Float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes s403Ripple { 0% { r: 8; opacity: 0.6; } 100% { r: 28; opacity: 0; } }
        .s403-dash { animation: s403Dash 2.5s ease-out 0.3s forwards; }
        .s403-pulse { animation: s403Pulse 2s ease-in-out infinite; }
        .s403-red-glow { animation: s403RedGlow 3s ease-in-out infinite; }
        .s403-float { animation: s403Float 5s ease-in-out infinite; }
        .s403-ripple1 { animation: s403Ripple 2s ease-out infinite; }
        .s403-ripple2 { animation: s403Ripple 2s ease-out 0.7s infinite; }
        @media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
      `}</style>

      <defs>
        <radialGradient id="s403-redGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="s403-greenGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22C55E" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="100" cy="100" r="95" fill="url(#s403-greenGlow)" />
      <circle
        cx="100"
        cy="100"
        r="90"
        fill="none"
        stroke="#ef4444"
        strokeWidth="0.5"
        opacity="0.2"
        className="s403-red-glow"
      />

      <g className="s403-float" style={{ transformOrigin: '100px 100px' }}>
        <ellipse
          cx="100"
          cy="100"
          rx="70"
          ry="70"
          fill="url(#s403-redGlow)"
          className="s403-red-glow"
        />

        <path
          d="M100 20 L160 52 L160 110 C160 148 132 172 100 182 C68 172 40 148 40 110 L40 52 Z"
          fill="#0d200f"
          stroke="#22C55E"
          strokeWidth="2"
        />

        <path
          d="M100 20 L160 52 L160 110 C160 148 132 172 100 182 C68 172 40 148 40 110 L40 52 Z"
          fill="none"
          stroke="#ef4444"
          strokeWidth="2"
          strokeDasharray="500"
          strokeDashoffset="500"
          className="s403-dash"
        />

        <path
          d="M100 28 L154 56 L154 110 C154 144 129 166 100 176 C71 166 46 144 46 110 L46 56 Z"
          fill="none"
          stroke="#ef4444"
          strokeWidth="0.5"
          opacity="0.3"
        />

        <rect
          x="82"
          y="88"
          width="36"
          height="32"
          rx="4"
          fill="#071a07"
          stroke="#94a3b8"
          strokeWidth="1.5"
        />

        <path
          d="M90 88 L90 76 C90 69 94 64 100 64 C106 64 110 69 110 76 L110 88"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        <circle cx="100" cy="100" r="4" fill="#ef4444" className="s403-pulse" />
        <circle
          cx="100"
          cy="100"
          r="8"
          fill="none"
          stroke="#ef4444"
          strokeWidth="1"
          className="s403-ripple1"
          opacity="0"
        />
        <circle
          cx="100"
          cy="100"
          r="8"
          fill="none"
          stroke="#ef4444"
          strokeWidth="0.5"
          className="s403-ripple2"
          opacity="0"
        />

        <rect x="99" y="104" width="2" height="8" rx="1" fill="#ef4444" opacity="0.8" />

        <path
          d="M70 140 L78 148 M78 140 L70 148"
          stroke="#ef4444"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.4"
        />
        <path
          d="M122 140 L130 148 M130 140 L122 148"
          stroke="#ef4444"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.4"
        />
      </g>

      <circle cx="30" cy="40" r="1.5" fill="#22C55E" opacity="0.3" />
      <circle cx="170" cy="35" r="1" fill="#ef4444" opacity="0.4" />
      <circle cx="165" cy="170" r="1.5" fill="#22C55E" opacity="0.2" />
      <circle cx="35" cy="160" r="1" fill="#ef4444" opacity="0.3" />
    </svg>
  );
}

export default function Forbidden403Page() {
  return (
    <SystemPageLayout>
      <ErrorPageTemplate
        errorCode="403"
        title="Access Denied"
        description="You do not have permission to view this page. Please contact support if you think this is a mistake."
        illustration={<AccessDeniedIllustration />}
        primaryAction={{
          label: 'Go Home',
          href: '/',
        }}
        secondaryAction={{
          label: 'Contact Support',
          href: '/help',
        }}
      />
    </SystemPageLayout>
  );
}
