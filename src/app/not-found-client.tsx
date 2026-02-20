'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search, Store, Headset, Mail, ShieldCheck, Tractor } from 'lucide-react';

function LostFieldIllustration() {
  return (
    <svg
      viewBox="0 0 300 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      role="img"
      aria-label="Lost field illustration with spinning compass and floating wheat"
    >
      <defs>
        <radialGradient id="nf-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22C55E" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="nf-orb" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4ade80" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background glow */}
      <circle cx="150" cy="150" r="140" fill="url(#nf-glow)" />

      {/* Outer compass ring */}
      <circle
        cx="150"
        cy="150"
        r="110"
        fill="none"
        stroke="#22C55E"
        strokeWidth="1.5"
        strokeDasharray="6 4"
        opacity="0.3"
        className="nf-spin-slow"
        style={{ transformOrigin: '150px 150px' }}
      />

      {/* Middle ring */}
      <circle cx="150" cy="150" r="90" fill="none" stroke="#22C55E" strokeWidth="1" opacity="0.2" />

      {/* Tractor wheel (outer) */}
      <circle
        cx="150"
        cy="150"
        r="70"
        fill="#0d200f"
        stroke="#22C55E"
        strokeWidth="2"
        opacity="0.8"
      />

      {/* Tractor wheel tread marks */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
        <line
          key={angle}
          x1="150"
          y1="80"
          x2="150"
          y2="88"
          stroke="#22C55E"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
          transform={`rotate(${angle} 150 150)`}
        />
      ))}

      {/* Inner wheel hub */}
      <circle cx="150" cy="150" r="30" fill="#071a07" stroke="#22C55E" strokeWidth="1.5" />
      <circle cx="150" cy="150" r="5" fill="#22C55E" opacity="0.8" />

      {/* Spinning compass needle */}
      <g className="nf-spin-slow" style={{ transformOrigin: '150px 150px' }}>
        <line
          x1="150"
          y1="125"
          x2="150"
          y2="95"
          stroke="#22C55E"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <polygon points="150,88 146,100 154,100" fill="#22C55E" />
        <line
          x1="150"
          y1="175"
          x2="150"
          y2="205"
          stroke="#4ade80"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.4"
        />
      </g>

      {/* Compass cardinal markers */}
      {['N', 'E', 'S', 'W'].map((dir, i) => (
        <text
          key={dir}
          x={150 + [0, 80, 0, -80][i]}
          y={150 + [-82, 4, 88, 4][i]}
          fill="#4ade80"
          fontSize="10"
          fontFamily="monospace"
          textAnchor="middle"
          opacity="0.5"
        >
          {dir}
        </text>
      ))}

      {/* Winding path disappearing into darkness */}
      <path
        d="M60 260 Q90 240 110 250 Q130 260 150 245 Q170 230 200 240 Q230 250 260 230"
        fill="none"
        stroke="#22C55E"
        strokeWidth="1.5"
        strokeDasharray="200"
        strokeDashoffset="200"
        opacity="0.4"
        className="nf-dash"
      />
      <path
        d="M70 270 Q100 250 120 260 Q140 270 160 255 Q180 240 210 250 Q240 260 270 240"
        fill="none"
        stroke="#22C55E"
        strokeWidth="1"
        strokeDasharray="200"
        strokeDashoffset="200"
        opacity="0.2"
        className="nf-dash"
      />

      {/* Floating wheat stalks */}
      <g className="nf-float-1" style={{ transformOrigin: '50px 180px' }}>
        <line
          x1="50"
          y1="210"
          x2="50"
          y2="170"
          stroke="#4ade80"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.5"
        />
        <ellipse cx="50" cy="165" rx="4" ry="8" fill="#4ade80" opacity="0.4" />
        <ellipse
          cx="46"
          cy="172"
          rx="3"
          ry="6"
          fill="#4ade80"
          opacity="0.3"
          transform="rotate(-15 46 172)"
        />
        <ellipse
          cx="54"
          cy="172"
          rx="3"
          ry="6"
          fill="#4ade80"
          opacity="0.3"
          transform="rotate(15 54 172)"
        />
      </g>

      <g className="nf-float-2" style={{ transformOrigin: '250px 170px' }}>
        <line
          x1="250"
          y1="200"
          x2="250"
          y2="160"
          stroke="#4ade80"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.5"
        />
        <ellipse cx="250" cy="155" rx="4" ry="8" fill="#4ade80" opacity="0.4" />
        <ellipse
          cx="246"
          cy="162"
          rx="3"
          ry="6"
          fill="#4ade80"
          opacity="0.3"
          transform="rotate(-15 246 162)"
        />
        <ellipse
          cx="254"
          cy="162"
          rx="3"
          ry="6"
          fill="#4ade80"
          opacity="0.3"
          transform="rotate(15 254 162)"
        />
      </g>

      <g className="nf-float-3" style={{ transformOrigin: '35px 130px' }}>
        <line
          x1="35"
          y1="155"
          x2="35"
          y2="125"
          stroke="#4ade80"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.35"
        />
        <ellipse cx="35" cy="120" rx="3" ry="6" fill="#4ade80" opacity="0.3" />
      </g>

      <g className="nf-float-4" style={{ transformOrigin: '270px 120px' }}>
        <line
          x1="270"
          y1="145"
          x2="270"
          y2="115"
          stroke="#4ade80"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.35"
        />
        <ellipse cx="270" cy="110" rx="3" ry="6" fill="#4ade80" opacity="0.3" />
      </g>

      {/* Small glow orbs */}
      <circle cx="80" cy="90" r="6" fill="url(#nf-orb)" className="nf-glow-pulse" />
      <circle
        cx="230"
        cy="100"
        r="4"
        fill="url(#nf-orb)"
        className="nf-glow-pulse"
        style={{ animationDelay: '1s' }}
      />
      <circle
        cx="190"
        cy="60"
        r="3"
        fill="url(#nf-orb)"
        className="nf-glow-pulse"
        style={{ animationDelay: '2s' }}
      />
    </svg>
  );
}

export default function NotFoundClient() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#071a07] text-white">
      <style>{`
        @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glowPulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
        @keyframes spinSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes dash { to{stroke-dashoffset:0} }
        @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        .nf-spin-slow { animation: spinSlow 20s linear infinite; }
        .nf-float-1 { animation: floatY 4s ease-in-out infinite; }
        .nf-float-2 { animation: floatY 5s ease-in-out 0.5s infinite; }
        .nf-float-3 { animation: floatY 3.5s ease-in-out 1s infinite; }
        .nf-float-4 { animation: floatY 4.5s ease-in-out 1.5s infinite; }
        .nf-glow-pulse { animation: glowPulse 3s ease-in-out infinite; }
        .nf-dash { animation: dash 3s ease-out 0.5s forwards; }
        .nf-fade-1 { animation: fadeUp 0.6s ease-out 0.1s both; }
        .nf-fade-2 { animation: fadeUp 0.6s ease-out 0.2s both; }
        .nf-fade-3 { animation: fadeUp 0.6s ease-out 0.3s both; }
        .nf-fade-4 { animation: fadeUp 0.6s ease-out 0.4s both; }
        .nf-fade-5 { animation: fadeUp 0.6s ease-out 0.5s both; }
        @media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
      `}</style>

      {/* Dot grid background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(34,197,94,0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Scanline */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[2px] bg-gradient-to-r from-transparent via-[#22C55E]/30 to-transparent"
        style={{ animation: 'scanline 10s linear infinite' }}
      />

      {/* Ambient glow orbs */}
      <div className="pointer-events-none absolute left-[10%] top-[20%] h-64 w-64 rounded-full bg-[#22C55E]/5 blur-[100px]" />
      <div className="pointer-events-none absolute right-[15%] top-[60%] h-48 w-48 rounded-full bg-[#22C55E]/5 blur-[80px]" />
      <div className="pointer-events-none absolute bottom-[10%] left-[40%] h-32 w-32 rounded-full bg-[#4ade80]/5 blur-[60px]" />

      {/* Header */}
      <header className="relative z-20 mx-auto flex w-full max-w-[1400px] flex-none items-center px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0d200f]">
            <Tractor className="h-4 w-4 text-[#22C55E]" />
          </div>
          <span className="text-lg font-semibold tracking-wide">AgriRental</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-20 mx-auto flex min-h-0 w-full max-w-[1400px] flex-1 flex-col items-center justify-center gap-8 px-6 lg:flex-row lg:gap-16 lg:px-12">
        {/* Left column: Animated SVG */}
        <div className="nf-fade-1 relative flex h-56 w-full max-w-md flex-shrink-0 items-center justify-center lg:h-[380px] lg:max-w-lg">
          {/* HUD labels */}
          <div className="absolute left-2 top-2 z-10 rounded bg-[#071a07]/70 px-2 py-1 font-mono text-[10px] font-semibold tracking-wider text-[#4ade80] backdrop-blur-sm">
            ERR_404_FIELD_MISSING
          </div>
          <div className="absolute right-2 top-2 z-10 rounded bg-[#071a07]/70 px-2 py-1 font-mono text-[10px] font-semibold tracking-wider text-[#4ade80] backdrop-blur-sm">
            SYS_RECOVERY_MODE
          </div>
          <LostFieldIllustration />
        </div>

        {/* Right column: Text and Actions */}
        <div className="flex w-full max-w-md flex-shrink-0 flex-col text-left">
          <h1 className="nf-fade-2 mb-2 bg-gradient-to-b from-[#4ade80] to-[#166534] bg-clip-text text-7xl font-black leading-none text-transparent lg:text-[6.5rem]">
            404
          </h1>
          <h2 className="nf-fade-3 text-2xl font-bold tracking-tight text-white lg:text-3xl">
            Page Not Found
          </h2>

          <div className="nf-fade-3 my-4 h-px bg-white/[0.08]" />

          <p className="nf-fade-4 text-base leading-relaxed text-[#94a3b8]">
            Looks like this field doesn&apos;t exist anymore. Let&apos;s get you back on track to
            finding the right equipment.
          </p>

          <div className="nf-fade-4 my-4 h-px bg-white/[0.08]" />

          {/* Action Buttons */}
          <div className="nf-fade-5 flex flex-col gap-3">
            <Button
              onClick={() => router.push('/')}
              className="w-full rounded-xl bg-[#22C55E] py-5 text-base font-bold text-[#071a07] shadow-[0_0_24px_rgba(34,197,94,0.2)] transition-all hover:bg-[#16a34a] hover:shadow-[0_0_36px_rgba(34,197,94,0.35)]"
            >
              Go Home
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => router.push('/equipment')}
                className="rounded-xl border border-white/[0.15] bg-white/5 py-5 text-sm font-semibold text-white transition-all hover:bg-white/10"
              >
                <Store className="mr-2 h-4 w-4 text-[#94a3b8]" />
                Equipment
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/labour')}
                className="rounded-xl border border-white/[0.15] bg-white/5 py-5 text-sm font-semibold text-white transition-all hover:bg-white/10"
              >
                <Tractor className="mr-2 h-4 w-4 text-[#94a3b8]" />
                Labour
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 mx-auto w-full max-w-[1400px] flex-none px-6 py-3">
        <div className="flex flex-col items-center justify-between border-t border-white/[0.08] pt-3 text-xs text-[#94a3b8] sm:flex-row">
          <p>&copy; 2024 AgriRental Inc. All rights reserved.</p>
          <div className="mt-2 flex items-center gap-5 sm:mt-0">
            <Link
              href="/support"
              className="flex items-center gap-1.5 transition-colors hover:text-[#22C55E]"
            >
              <Headset className="h-3.5 w-3.5" />
              Support
            </Link>
            <Link
              href="/contact"
              className="flex items-center gap-1.5 transition-colors hover:text-[#22C55E]"
            >
              <Mail className="h-3.5 w-3.5" />
              Contact Us
            </Link>
            <Link
              href="/privacy"
              className="flex items-center gap-1.5 transition-colors hover:text-[#22C55E]"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
