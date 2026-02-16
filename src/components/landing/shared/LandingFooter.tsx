import Link from 'next/link';

export function LandingFooter() {
  return (
    <footer className="relative border-t border-white/10 bg-[#020503] px-[var(--landing-padding-x)] py-12 md:py-14">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(34,197,94,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,197,94,0.12)_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20" />

      <div className="relative mx-auto w-full max-w-[var(--landing-max-width)]">
        <div className="grid gap-8 pb-8 md:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-emerald-200/75">AgriServe</p>
            <h3 className="mt-3 text-2xl font-semibold text-white">Agriculture. Reimagined.</h3>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/66">
              A premium marketplace for equipment, labour, and verified providers across India.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">Explore</p>
            <div className="mt-3 grid gap-2 text-sm text-zinc-300">
              <Link className="landing-touch inline-flex items-center hover:text-white" href="/equipment">
                Equipment
              </Link>
              <Link className="landing-touch inline-flex items-center hover:text-white" href="/labour">
                Labour
              </Link>
              <Link className="landing-touch inline-flex items-center hover:text-white" href="/about">
                About
              </Link>
              <Link className="landing-touch inline-flex items-center hover:text-white" href="/#pricing">
                Pricing
              </Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">Support</p>
            <div className="mt-3 grid gap-2 text-sm text-zinc-300">
              <Link className="landing-touch inline-flex items-center hover:text-white" href="/help">
                Help Center
              </Link>
              <Link className="landing-touch inline-flex items-center hover:text-white" href="/contact">
                Contact
              </Link>
              <a className="landing-touch inline-flex items-center hover:text-white" href="tel:+911234567890">
                +91 12345 67890
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-zinc-500 min-[414px]:text-sm md:flex-row md:items-center md:justify-between">
          <p className="tracking-[0.08em]">AGRICULTURE. REIMAGINED.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/terms" className="hover:text-zinc-200">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-zinc-200">
              Privacy
            </Link>
            <span>© {new Date().getFullYear()} AgriServe</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
