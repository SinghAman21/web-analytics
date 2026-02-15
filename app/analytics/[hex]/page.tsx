'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Share2, ExternalLink, Lock } from 'lucide-react';

const mockData = {
  site: 'mysite.com',
  // Pageviews = sum of all route views (e.g. / = 523, /pricing = 312, /blog = 198, /about = 112, /contact = 89)
  pageviews: 1234,
  uniqueVisitors: 567,
  bounce: 43,
  mobile: 62,
  desktop: 38,
  dataRetention: '30 days',
  rateLimit: '100 req/min',
  sparkline: [45, 52, 38, 64, 71, 59, 82, 76, 68, 91, 85, 73, 88, 94, 79, 63, 72, 86, 91, 78, 85, 93, 88, 72, 81, 95, 89, 76, 83, 91],
};

const lockedFeatures = [
  { label: 'Page Performance', tier: 'Signed-In' },
  { label: 'Referrers & UTM', tier: 'Signed-In' },
  { label: 'Browsers & OS', tier: 'Signed-In' },
  { label: 'Geography', tier: 'Signed-In' },
  { label: 'Live Sessions', tier: 'Signed-In' },
  { label: 'Heatmaps & Funnels', tier: 'Pro' },
  { label: 'Trends & Velocity', tier: 'Pro' },
];

export default function PublicDashboard() {
  const { hex } = useParams();
  const maxSparkline = Math.max(...mockData.sparkline);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-serif text-2xl italic tracking-tight hover:opacity-70 transition-opacity">Pulse</Link>
            <span className="w-px h-6 bg-border" />
            <span className="text-sm font-mono text-muted-foreground">Public Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono px-2 py-1 border border-border text-muted-foreground">FREE</span>
            <button className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">
              <Share2 className="w-3 h-3" />
              Share
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Site header */}
          <div className="mb-16">
            <p className="label mb-4">Analytics for</p>
            <h1 className="display-lg mb-2">
              <span className="font-serif italic">{mockData.site}</span>
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground text-sm">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-3 h-3" />
                <span className="font-mono">pulse.app/analytics/{hex}</span>
              </div>
              <span className="w-px h-4 bg-border" />
              <span className="font-mono text-xs">{mockData.dataRetention} retention</span>
              <span className="font-mono text-xs">{mockData.rateLimit}</span>
            </div>
          </div>

          {/* Key metrics — Free tier: Pageviews (aggregate), Unique Visitors (aggregate), Bounce Rate (aggregate) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-border divide-x divide-border mb-16">
            <div className="p-6">
              <p className="label mb-3">Pageviews</p>
              <p className="text-4xl font-mono font-light tabular-nums">{mockData.pageviews.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground mt-2 font-mono">Sum of all routes</p>
            </div>
            <div className="p-6">
              <p className="label mb-3">Unique Visitors</p>
              <p className="text-4xl font-mono font-light tabular-nums">{mockData.uniqueVisitors.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground mt-2 font-mono">Aggregate only</p>
            </div>
            <div className="p-6">
              <p className="label mb-3">Bounce Rate</p>
              <p className="text-4xl font-mono font-light tabular-nums">{mockData.bounce}%</p>
              <p className="text-[10px] text-muted-foreground mt-2 font-mono">Aggregate only</p>
            </div>
            <div className="p-6">
              <p className="label mb-3">Session Tracking</p>
              <p className="text-sm text-muted-foreground mt-2">No refresh counting</p>
              <p className="text-[10px] text-muted-foreground mt-1 font-mono">via session ID</p>
            </div>
          </div>

          {/* Sparkline chart */}
          <section className="mb-16">
            <p className="label mb-6">Last 30 Days</p>
            <div className="editorial-card p-8">
              <div className="flex items-end gap-1 h-32">
                {mockData.sparkline.map((val, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${(val / maxSparkline) * 100}%` }}
                    transition={{ delay: i * 0.02, duration: 0.4 }}
                    className="flex-1 bg-foreground/60 hover:bg-foreground transition-colors rounded-sm"
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Device split — Free tier: pie-style breakdown, no screen resolution */}
          <section className="mb-16">
            <div className="mb-8">
              <p className="label mb-2">Devices</p>
              <h3 className="text-2xl font-serif italic">Device breakdown</h3>
            </div>
            <div className="editorial-card p-8">
              <div className="flex items-center gap-12">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-mono font-light tabular-nums">{mockData.mobile}%</span>
                  <span className="text-sm text-muted-foreground">Mobile</span>
                </div>
                <span className="text-muted-foreground text-2xl font-light">/</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-mono font-light tabular-nums">{mockData.desktop}%</span>
                  <span className="text-sm text-muted-foreground">Desktop</span>
                </div>
              </div>
              <div className="h-3 bg-secondary rounded-sm overflow-hidden mt-6 flex">
                <motion.div
                  className="h-full bg-foreground"
                  initial={{ width: 0 }}
                  animate={{ width: `${mockData.mobile}%` }}
                  transition={{ duration: 0.6 }}
                />
                <motion.div
                  className="h-full bg-foreground/30"
                  initial={{ width: 0 }}
                  animate={{ width: `${mockData.desktop}%` }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                />
              </div>
              <div className="flex justify-between mt-3 text-xs text-muted-foreground font-mono">
                <span>Mobile</span>
                <span>Desktop</span>
              </div>
            </div>
          </section>

          {/* Locked features — upgrade CTA */}
          <section className="mb-16">
            <div className="mb-8">
              <p className="label mb-2">Unavailable on Free</p>
              <h3 className="text-2xl font-serif italic">Unlock more insights</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {lockedFeatures.map((f) => (
                <div key={f.label} className="editorial-card p-5 flex items-center gap-4 opacity-60">
                  <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-sm">{f.label}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 border border-border text-muted-foreground">
                    {f.tier}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-8 flex gap-4">
              <Link href="/register" className="bg-foreground text-background px-6 py-3 text-sm font-mono hover:opacity-90 transition-opacity">
                Sign Up Free →
              </Link>
              <Link href="/billing" className="px-6 py-3 text-sm font-mono text-accent border border-accent/30 hover:bg-accent/10 transition-colors">
                View Pro Plan
              </Link>
            </div>
          </section>
        </motion.div>
      </main>

      <footer className="border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 flex items-center justify-between">
          <span className="font-serif text-lg italic">Pulse</span>
          <span className="text-xs text-muted-foreground font-mono">Powered by Pulse Analytics</span>
        </div>
      </footer>
    </div>
  );
}
