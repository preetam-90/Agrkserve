'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, Headset, Mail, ShieldCheck, Tractor, RefreshCcw } from 'lucide-react';
import Image from 'next/image';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('Unhandled Application Error:', error);
  }, [error]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0A1C12] text-white overflow-y-auto">
      {/* Header */}
      <header className="flex items-center justify-between p-6 w-full max-w-[1400px] mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#143B22] border border-[#1b4d2d]">
            <Tractor className="h-5 w-5 text-[#22C55E]" />
          </div>
          <span className="text-xl font-semibold tracking-wide">AgriRental</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-8 gap-12 lg:gap-24">

        {/* Left column: Image with Overlay */}
        <div className="relative w-full max-w-lg lg:max-w-2xl aspect-square xl:aspect-[4/3] rounded-3xl overflow-hidden border border-[#1b4d2d] shadow-2xl shadow-green-900/20 group">
          <Image
            src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&q=80"
            alt="Tractor in field"
            fill
            className="object-cover transition-transform duration-700 hover:scale-105"
            unoptimized
          />

          {/* Overlay Grid / Scanlines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

          {/* Top Overlays */}
          <div className="absolute top-6 left-6 font-mono text-xs font-semibold text-[#22C55E] tracking-wider z-10 bg-[#0A1C12]/40 backdrop-blur-sm px-2 py-1 rounded">
            ERR_500_SYSTEM_FAULT
          </div>
          <div className="absolute top-6 right-6 font-mono text-xs font-semibold text-[#f59e0b] tracking-wider z-10 bg-[#0A1C12]/40 backdrop-blur-sm px-2 py-1 rounded">
            SYS_CRITICAL_MODE
          </div>

          {/* Center Card */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-4 bg-[#0A1C12]/60 backdrop-blur-md border border-[#22C55E]/30 rounded-2xl p-6 shadow-2xl min-w-[180px] z-10 transition-transform hover:scale-105">
            <AlertTriangle className="h-10 w-10 text-[#22C55E]" strokeWidth={2.5} />
            <div className="bg-[#143B22]/80 border border-[#22C55E]/20 px-4 py-1.5 rounded text-xs font-mono font-bold text-[#22C55E] tracking-widest shadow-[0_0_15px_rgba(34,197,94,0.3)]">
              ENGINE FAULT
            </div>
          </div>

          {/* Bottom green accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#22C55E] to-transparent opacity-50" />
        </div>

        {/* Right column: Text and Actions */}
        <div className="flex flex-col w-full max-w-lg text-left">
          <h1 className="text-8xl md:text-[8rem] font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#4ade80] to-[#166534] leading-none mb-4 filter drop-shadow-lg">
            500
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white tracking-tight">
            Server Fault
          </h2>
          <p className="text-[#9ca3af] text-lg mb-10 leading-relaxed">
            Our systems encountered an unexpected engine failure. Our team of mechanics has been notified and is working on a fix.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4">
            <Button
              onClick={() => reset()}
              className="w-full bg-[#22C55E] hover:bg-[#16a34a] text-[#0A1C12] font-bold text-lg py-6 rounded-xl shadow-[0_0_30px_rgba(34,197,94,0.2)] transition-all hover:shadow-[0_0_40px_rgba(34,197,94,0.4)]"
            >
              Try Again
              <RefreshCcw className="ml-2 h-5 w-5" />
            </Button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="bg-transparent border-[#2b4c37] text-white hover:bg-[#143B22] hover:text-white py-6 rounded-xl transition-all font-semibold"
              >
                <Home className="mr-2 h-4 w-4 text-gray-400" />
                Go Home
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/support')}
                className="bg-transparent border-[#2b4c37] text-white hover:bg-[#143B22] hover:text-white py-6 rounded-xl transition-all font-semibold"
              >
                <Headset className="mr-2 h-4 w-4 text-gray-400" />
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-[1400px] mx-auto p-6 mt-auto">
        <div className="flex flex-col md:flex-row items-center justify-between border-t border-[#1b4d2d] pt-6 text-sm text-[#6b7280]">
          <p>© 2024 AgriRental Inc. All rights reserved.</p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <Link href="/support" className="flex items-center gap-2 hover:text-[#22C55E] transition-colors">
              <Headset className="h-4 w-4" />
              Support
            </Link>
            <Link href="/contact" className="flex items-center gap-2 hover:text-[#22C55E] transition-colors">
              <Mail className="h-4 w-4" />
              Contact Us
            </Link>
            <Link href="/privacy" className="flex items-center gap-2 hover:text-[#22C55E] transition-colors">
              <ShieldCheck className="h-4 w-4" />
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
