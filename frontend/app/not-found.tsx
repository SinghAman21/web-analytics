'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, LayoutGrid, Search, ShieldCheck, Zap, BarChart2, HelpCircle, ArrowRight } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0b0b0b] text-white">
      {/* Background glow */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.08),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.06),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />
      </div>

      {/* Dotted wave field */}
      <div className="absolute inset-x-0 bottom-28 top-44 opacity-70">
        <svg className="h-full w-full" viewBox="0 0 1200 500" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="waveFade" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="40%" stopColor="rgba(255,255,255,0.5)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>
          <path
            d="M0 260 C 150 210, 300 210, 450 260 C 600 310, 750 310, 900 260 C 1050 210, 1200 210, 1200 210"
            fill="none"
            stroke="url(#waveFade)"
            strokeWidth="1"
            strokeDasharray="1 6"
          />
          <path
            d="M0 300 C 150 250, 300 250, 450 300 C 600 350, 750 350, 900 300 C 1050 250, 1200 250, 1200 250"
            fill="none"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1"
            strokeDasharray="1 7"
          />
          <path
            d="M0 340 C 150 290, 300 290, 450 340 C 600 390, 750 390, 900 340 C 1050 290, 1200 290, 1200 290"
            fill="none"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="1"
            strokeDasharray="1 8"
          />
        </svg>
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mx-auto w-full max-w-3xl text-center"
        >
          <div className="text-6xl sm:text-7xl md:text-8xl font-semibold tracking-tight text-white/90">
            404
          </div>
          <p className="mt-4 text-lg text-white/80">This route produced no events.</p>
          <p className="mt-2 text-sm text-white/45">
            The page you are looking for does not exist or has moved to another location.
          </p>

          <div className="mt-10 grid gap-4 text-left sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                <BarChart2 className="h-4 w-4 text-white/70" />
              </div>
              <div className="text-sm font-medium text-white/80">Real-time insights</div>
              <div className="mt-1 text-xs text-white/45">
                Monitor your data and make smarter decisions.
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                <ShieldCheck className="h-4 w-4 text-white/70" />
              </div>
              <div className="text-sm font-medium text-white/80">Reliable analytics</div>
              <div className="mt-1 text-xs text-white/45">
                Track everything that matters in one place.
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                <Zap className="h-4 w-4 text-white/70" />
              </div>
              <div className="text-sm font-medium text-white/80">Built for speed</div>
              <div className="mt-1 text-xs text-white/45">
                Lightning-fast performance when it matters most.
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left">
              <Search className="h-4 w-4 text-white/50" />
              <span className="text-xs text-white/40">Search docs or guides...</span>
              <span className="ml-auto rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/50">
                K
              </span>
            </div>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-white/90"
            >
              <Home className="h-4 w-4" />
              Go home
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white/80 transition hover:bg-white/[0.06]"
            >
              <LayoutGrid className="h-4 w-4" />
              View dashboard
            </Link>
          </div>

          <div className="mt-10 flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-5 py-4 text-left text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                <HelpCircle className="h-4 w-4 text-white/60" />
              </span>
              <div>
                <div className="text-white/80">Need help?</div>
                <div className="text-xs text-white/45">Our team is here for you.</div>
              </div>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-xs font-medium text-white/70 transition hover:text-white"
            >
              Contact support
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
