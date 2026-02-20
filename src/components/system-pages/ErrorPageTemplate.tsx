'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Home, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logError } from '@/lib/system-pages/error-logger';

export interface ErrorPageAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface ErrorPageTemplateProps {
  errorCode: string;
  title: string;
  description: string;
  illustration: ReactNode;
  primaryAction: ErrorPageAction;
  secondaryAction?: ErrorPageAction;
  showSearchBar?: boolean;
  showPopularCategories?: boolean;
  countdown?: number;
  className?: string;
}

const popularCategories = [
  { name: 'Tractors', href: '/equipment?category=tractors' },
  { name: 'Harvesters', href: '/equipment?category=harvesters' },
  { name: 'Ploughs', href: '/equipment?category=ploughs' },
  { name: 'Seeders', href: '/equipment?category=seeders' },
];

export function ErrorPageTemplate({
  errorCode,
  title,
  description,
  illustration,
  primaryAction,
  secondaryAction,
  showSearchBar = false,
  showPopularCategories = false,
  countdown,
  className,
}: ErrorPageTemplateProps) {
  const router = useRouter();
  const [remainingTime, setRemainingTime] = useState(countdown || 0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (countdown && countdown > 0) {
      setRemainingTime(countdown);
      const timer = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (errorCode !== '404') {
      logError(errorCode, title, {
        description,
        timestamp: new Date().toISOString(),
      });
    }
  }, [errorCode, title, description]);

  const handlePrimaryAction = () => {
    if (primaryAction.onClick) {
      primaryAction.onClick();
    } else if (primaryAction.href) {
      router.push(primaryAction.href);
    }
  };

  const handleSecondaryAction = () => {
    if (secondaryAction?.onClick) {
      secondaryAction.onClick();
    } else if (secondaryAction?.href) {
      router.push(secondaryAction.href);
    }
  };

  return (
    <div
      className={cn(
        'relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-4 py-8 text-center md:py-12',
        className
      )}
      style={{ background: '#071a07' }}
    >
      <style>{`
        @keyframes errGlitch {
          0%, 100% { transform: translate(0); text-shadow: 2px 0 #22C55E, -2px 0 #EF4444; }
          20% { transform: translate(-3px, 3px); text-shadow: 3px 0 #22C55E, -3px 0 #EF4444; }
          40% { transform: translate(3px, -2px); text-shadow: -2px 0 #22C55E, 2px 0 #EF4444; }
          60% { transform: translate(-1px, 1px); text-shadow: 1px 0 #22C55E, -1px 0 #EF4444; }
          80% { transform: translate(2px, -1px); text-shadow: -3px 0 #22C55E, 3px 0 #EF4444; }
        }
        @keyframes errScanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes errFloat {
          0%, 100% { transform: translateY(0); opacity: 0.15; }
          50% { transform: translateY(-15px); opacity: 0.35; }
        }
        @keyframes errFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes errGlowPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.2), inset 0 0 20px rgba(34, 197, 94, 0.05); }
          50% { box-shadow: 0 0 40px rgba(34, 197, 94, 0.4), inset 0 0 40px rgba(34, 197, 94, 0.1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .err-glitch, .err-scanline, .err-float-particle, .err-fade-up, .err-glow-card {
            animation: none !important;
          }
        }
      `}</style>

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(34,197,94,0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div
        className="err-scanline pointer-events-none absolute inset-x-0 top-0 z-10 h-[2px] bg-gradient-to-r from-transparent via-green-500/20 to-transparent"
        style={{ animation: 'errScanline 10s linear infinite' }}
      />

      <div className="pointer-events-none absolute left-[5%] top-[15%] h-48 w-48 rounded-full bg-[#22C55E]/5 blur-[80px]" />
      <div className="pointer-events-none absolute bottom-[20%] right-[10%] h-40 w-40 rounded-full bg-[#22C55E]/5 blur-[60px]" />
      <div className="pointer-events-none absolute left-[50%] top-[50%] h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#4ade80]/5 blur-[50px]" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {mounted &&
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="err-float-particle absolute rounded-full"
              style={{
                width: `${8 + i * 4}px`,
                height: `${8 + i * 4}px`,
                left: `${10 + i * 16}%`,
                top: `${15 + (i % 3) * 25}%`,
                background:
                  i % 2 === 0
                    ? 'radial-gradient(circle, rgba(34,197,94,0.3) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)',
                animation: `errFloat ${3 + i * 0.5}s ease-in-out ${i * 0.4}s infinite`,
              }}
            />
          ))}
      </div>

      <div className="relative z-20 w-full max-w-2xl">
        <div
          className="err-glitch mb-2 bg-gradient-to-r from-green-400 via-green-500 to-emerald-400 bg-clip-text text-8xl font-black leading-none text-transparent md:text-[10rem]"
          style={{ animation: 'errGlitch 4s ease-in-out infinite' }}
        >
          {errorCode}
        </div>

        <div
          className="err-fade-up mx-auto mb-6 h-48 w-48 md:h-64 md:w-64"
          style={{ animation: 'errFadeUp 0.6s ease-out 0.2s both' }}
        >
          {illustration}
        </div>

        <h1
          className="err-fade-up mb-4 max-w-2xl text-2xl font-bold text-slate-50 md:text-3xl lg:text-4xl"
          style={{ animation: 'errFadeUp 0.6s ease-out 0.3s both' }}
        >
          {title}
        </h1>

        <p
          className="err-fade-up mb-8 max-w-xl text-base text-[#94a3b8] md:text-lg"
          style={{ animation: 'errFadeUp 0.6s ease-out 0.4s both' }}
        >
          {description}
        </p>

        {remainingTime > 0 && (
          <div className="mb-6 text-center">
            <p className="text-lg font-medium text-amber-400">
              Please wait {remainingTime} second{remainingTime !== 1 ? 's' : ''} before trying again
            </p>
          </div>
        )}

        {showSearchBar && (
          <div
            className="err-fade-up mx-auto mb-8 w-full max-w-md"
            style={{ animation: 'errFadeUp 0.6s ease-out 0.5s both' }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const query = formData.get('search') as string;
                if (query) {
                  router.push(`/equipment?search=${encodeURIComponent(query)}`);
                }
              }}
              className="relative"
            >
              <Input
                type="search"
                name="search"
                id="error-search-input"
                placeholder="Search for equipment..."
                className="h-12 border-white/[0.08] bg-[#0d200f] pl-10 text-base text-slate-50 placeholder:text-[#94a3b8] focus-visible:ring-green-500/50"
              />
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#94a3b8]" />
            </form>
          </div>
        )}

        <div
          className="err-fade-up mb-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
          style={{ animation: 'errFadeUp 0.6s ease-out 0.6s both' }}
        >
          <Button
            onClick={handlePrimaryAction}
            size="lg"
            className="min-h-[44px] min-w-[140px] cursor-pointer rounded-xl bg-[#22C55E] font-bold text-[#071a07] shadow-lg shadow-green-500/25 transition-all duration-200 hover:bg-[#16a34a] hover:shadow-xl hover:shadow-green-500/30"
          >
            {primaryAction.label}
          </Button>

          {secondaryAction && (
            <Button
              onClick={handleSecondaryAction}
              variant="outline"
              size="lg"
              className="min-h-[44px] min-w-[140px] cursor-pointer rounded-xl border border-white/[0.15] bg-white/5 text-white transition-all duration-200 hover:bg-white/10"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>

        {showPopularCategories && (
          <div
            className="err-fade-up w-full max-w-2xl"
            style={{ animation: 'errFadeUp 0.6s ease-out 0.7s both' }}
          >
            <p className="mb-4 text-sm text-[#94a3b8]">Popular Categories:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {popularCategories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="cursor-pointer rounded-lg border border-white/[0.08] bg-[#0d200f] px-4 py-2 text-sm font-medium text-[#4ade80] transition-all duration-200 hover:border-[#22C55E]/30 hover:bg-[#0d200f]/80 hover:text-[#22C55E]"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div
          className="err-fade-up mt-8 flex items-center justify-center gap-4 text-sm text-[#94a3b8]"
          style={{ animation: 'errFadeUp 0.6s ease-out 0.8s both' }}
        >
          <Link
            href="/"
            className="flex cursor-pointer items-center gap-1 transition-colors hover:text-[#22C55E]"
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
          <button
            onClick={() => router.back()}
            className="flex cursor-pointer items-center gap-1 transition-colors hover:text-[#22C55E]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}
