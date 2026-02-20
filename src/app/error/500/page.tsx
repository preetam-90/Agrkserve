import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Headset, Mail, ShieldCheck, Tractor } from 'lucide-react';
import { generateSystemPageMetadata, metadataConfigs } from '@/lib/system-pages/page-metadata';

export const metadata: Metadata = generateSystemPageMetadata(metadataConfigs.error500);

function EngineFaultIllustration() {
  return (
    <svg
      viewBox="0 0 300 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      role="img"
      aria-label="Engine fault illustration with broken gears and sparks"
    >
      <defs>
        <radialGradient id="e5-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="e5-spark" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="150" cy="150" r="140" fill="url(#e5-glow)" />

      {/* Left gear (working, spinning slowly) */}
      <g className="e5-spin" style={{ transformOrigin: '110px 140px' }}>
        <circle cx="110" cy="140" r="45" fill="#0d200f" stroke="#22C55E" strokeWidth="2" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <rect
            key={angle}
            x="106"
            y="93"
            width="8"
            height="14"
            rx="2"
            fill="#22C55E"
            opacity="0.7"
            transform={`rotate(${angle} 110 140)`}
          />
        ))}
        <circle cx="110" cy="140" r="15" fill="#071a07" stroke="#22C55E" strokeWidth="1.5" />
        <circle cx="110" cy="140" r="4" fill="#22C55E" opacity="0.6" />
      </g>

      {/* Right gear (broken, static) */}
      <g>
        <circle
          cx="195"
          cy="140"
          r="38"
          fill="#0d200f"
          stroke="#f59e0b"
          strokeWidth="2"
          opacity="0.6"
        />
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <rect
            key={angle}
            x="192"
            y="100"
            width="7"
            height="12"
            rx="2"
            fill="#f59e0b"
            opacity={i === 2 ? 0.2 : 0.5}
            transform={`rotate(${angle} 195 140)`}
          />
        ))}
        <circle
          cx="195"
          cy="140"
          r="12"
          fill="#071a07"
          stroke="#f59e0b"
          strokeWidth="1.5"
          opacity="0.5"
        />
        <circle cx="195" cy="140" r="3" fill="#ef4444" opacity="0.8" />

        {/* Crack lines on broken gear */}
        <line
          x1="195"
          y1="105"
          x2="205"
          y2="120"
          stroke="#ef4444"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.7"
        />
        <line
          x1="205"
          y1="120"
          x2="200"
          y2="135"
          stroke="#ef4444"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.5"
        />
        <line
          x1="195"
          y1="108"
          x2="188"
          y2="118"
          stroke="#ef4444"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.4"
        />
      </g>

      {/* Spark particles */}
      <circle cx="160" cy="125" r="4" fill="url(#e5-spark)" className="e5-glow-pulse" />
      <circle
        cx="170"
        cy="115"
        r="3"
        fill="url(#e5-spark)"
        className="e5-glow-pulse"
        style={{ animationDelay: '0.5s' }}
      />
      <circle
        cx="155"
        cy="135"
        r="2.5"
        fill="url(#e5-spark)"
        className="e5-glow-pulse"
        style={{ animationDelay: '1s' }}
      />
      <circle
        cx="175"
        cy="130"
        r="2"
        fill="url(#e5-spark)"
        className="e5-glow-pulse"
        style={{ animationDelay: '1.5s' }}
      />
      <circle
        cx="165"
        cy="145"
        r="3"
        fill="url(#e5-spark)"
        className="e5-glow-pulse"
        style={{ animationDelay: '0.7s' }}
      />

      {/* Warning triangle */}
      <g className="e5-float" style={{ transformOrigin: '150px 220px' }}>
        <path
          d="M150 195 L175 240 L125 240 Z"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeDasharray="140"
          strokeDashoffset="140"
          className="e5-dash"
        />
        <line
          x1="150"
          y1="210"
          x2="150"
          y2="225"
          stroke="#f59e0b"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="150" cy="232" r="2" fill="#f59e0b" />
      </g>

      {/* Small flying debris from broken gear */}
      <rect
        x="215"
        y="115"
        width="5"
        height="3"
        rx="1"
        fill="#f59e0b"
        opacity="0.4"
        transform="rotate(25 215 115)"
        className="e5-float"
      />
      <rect
        x="220"
        y="130"
        width="4"
        height="2"
        rx="1"
        fill="#ef4444"
        opacity="0.3"
        transform="rotate(-15 220 130)"
        className="e5-float"
        style={{ animationDelay: '0.8s' }}
      />
      <rect
        x="210"
        y="108"
        width="3"
        height="3"
        rx="1"
        fill="#f59e0b"
        opacity="0.35"
        transform="rotate(45 210 108)"
        className="e5-float"
        style={{ animationDelay: '1.2s' }}
      />

      {/* Ambient dots */}
      <circle cx="60" cy="80" r="1.5" fill="#22C55E" opacity="0.3" />
      <circle cx="240" cy="70" r="1" fill="#f59e0b" opacity="0.4" />
      <circle cx="50" cy="200" r="1" fill="#22C55E" opacity="0.2" />
      <circle cx="250" cy="220" r="1.5" fill="#ef4444" opacity="0.3" />
    </svg>
  );
}

export default function InternalServerError500Page() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#071a07] text-white">
      <style>{`
        @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glowPulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
        @keyframes spinSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes dash { to{stroke-dashoffset:0} }
        @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        .e5-spin { animation: spinSlow 8s linear infinite; }
        .e5-glow-pulse { animation: glowPulse 2s ease-in-out infinite; }
        .e5-float { animation: floatY 4s ease-in-out infinite; }
        .e5-dash { animation: dash 2s ease-out 0.5s forwards; }
        .e5-fade-1 { animation: fadeUp 0.6s ease-out 0.1s both; }
        .e5-fade-2 { animation: fadeUp 0.6s ease-out 0.2s both; }
        .e5-fade-3 { animation: fadeUp 0.6s ease-out 0.3s both; }
        .e5-fade-4 { animation: fadeUp 0.6s ease-out 0.4s both; }
        .e5-fade-5 { animation: fadeUp 0.6s ease-out 0.5s both; }
        @media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
      `}</style>

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(34,197,94,0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[2px] bg-gradient-to-r from-transparent via-[#f59e0b]/30 to-transparent"
        style={{ animation: 'scanline 10s linear infinite' }}
      />

      <div className="pointer-events-none absolute left-[10%] top-[20%] h-64 w-64 rounded-full bg-[#f59e0b]/5 blur-[100px]" />
      <div className="pointer-events-none absolute right-[15%] top-[60%] h-48 w-48 rounded-full bg-[#ef4444]/5 blur-[80px]" />
      <div className="pointer-events-none absolute bottom-[10%] left-[40%] h-32 w-32 rounded-full bg-[#22C55E]/5 blur-[60px]" />

      <header className="relative z-20 mx-auto flex w-full max-w-[1400px] flex-none items-center px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0d200f]">
            <Tractor className="h-4 w-4 text-[#22C55E]" />
          </div>
          <span className="text-lg font-semibold tracking-wide">AgriRental</span>
        </div>
      </header>

      <main className="relative z-20 mx-auto flex min-h-0 w-full max-w-[1400px] flex-1 flex-col items-center justify-center gap-8 px-6 lg:flex-row lg:gap-16 lg:px-12">
        <div className="e5-fade-1 relative flex h-56 w-full max-w-md flex-shrink-0 items-center justify-center lg:h-[380px] lg:max-w-lg">
          <div className="absolute left-2 top-2 z-10 rounded bg-[#071a07]/70 px-2 py-1 font-mono text-[10px] font-semibold tracking-wider text-[#4ade80] backdrop-blur-sm">
            ERR_500_SYSTEM_FAULT
          </div>
          <div className="absolute right-2 top-2 z-10 rounded bg-[#071a07]/70 px-2 py-1 font-mono text-[10px] font-semibold tracking-wider text-[#f59e0b] backdrop-blur-sm">
            SYS_CRITICAL_MODE
          </div>
          <EngineFaultIllustration />
        </div>

        <div className="flex w-full max-w-md flex-shrink-0 flex-col text-left">
          <h1 className="e5-fade-2 mb-2 bg-gradient-to-b from-[#4ade80] to-[#166534] bg-clip-text text-7xl font-black leading-none text-transparent lg:text-[6.5rem]">
            500
          </h1>
          <h2 className="e5-fade-3 text-2xl font-bold tracking-tight text-white lg:text-3xl">
            Server Fault
          </h2>

          <div className="e5-fade-3 my-4 h-px bg-white/[0.08]" />

          <p className="e5-fade-4 text-base leading-relaxed text-[#94a3b8]">
            Our systems encountered an unexpected engine failure. Our team of mechanics has been
            notified and is working on a fix.
          </p>

          <div className="e5-fade-4 my-4 h-px bg-white/[0.08]" />

          <div className="e5-fade-5 flex flex-col gap-3">
            <Link href="/" className="w-full">
              <Button className="w-full rounded-xl bg-[#22C55E] py-5 text-base font-bold text-[#071a07] shadow-[0_0_24px_rgba(34,197,94,0.2)] transition-all hover:bg-[#16a34a] hover:shadow-[0_0_36px_rgba(34,197,94,0.35)]">
                Go Home
                <Home className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            <Link href="/support" className="w-full">
              <Button
                variant="outline"
                className="w-full rounded-xl border border-white/[0.15] bg-white/5 py-5 text-sm font-semibold text-white transition-all hover:bg-white/10"
              >
                <Headset className="mr-2 h-4 w-4 text-[#94a3b8]" />
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </main>

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
