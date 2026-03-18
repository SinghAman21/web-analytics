'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight, Plus } from 'lucide-react';
import { useClerk } from '@clerk/nextjs';
import AppFooter from '@/components/shared/AppFooter';
import { ModeToggle } from '@/components/toggle';

const sites = [
  { id: 'mysite-com', domain: 'mysite.com', routes: ['/', '/pricing', '/blog'], routeViews: [523, 312, 198], change: '+12%', status: 'active' },
  { id: 'blog-com', domain: 'blog.com', routes: ['/', '/posts', '/about'], routeViews: [234, 156, 66], change: '+5%', status: 'active' },
  { id: 'store-mysite', domain: 'store.mysite.com', routes: ['/', '/products'], routeViews: [56, 33], change: '-3%', status: 'active' },
];

const currentTier = {
  name: 'Signed-In',
  retention: '90 days',
  rateLimit: '1K req/min',
  sitesUsed: 3,
};

export default function DashboardOverview() {
  const { signOut } = useClerk();
  const totalPageviews = sites.reduce((sum, s) => sum + s.routeViews.reduce((a, b) => a + b, 0), 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="border-b border-border bg-background/50 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-serif text-2xl italic tracking-tight hover:opacity-70 transition-opacity">
              Pulse
            </Link>
            <span className="w-px h-6 bg-border" />
            <h1 className="text-sm font-mono text-muted-foreground">Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono px-2 py-1 border border-border text-muted-foreground">{currentTier.name.toUpperCase()}</span>
            <Link href="/account" className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">Account</Link>
            <Link href="/billing" className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">Billing</Link>
            <button
              type="button"
              onClick={async () => {
                await signOut({ redirectUrl: '/' });
              }}
              // className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
              className="text-[10px] font-mono px-2 py-1 border border-border text-muted-foreground hover:border-destructive hover:text-destructive transition-colors cursor-pointer"
            >
              Logout
            </button>
            <ModeToggle />
          </div>
        </div>
      </motion.header>

      {/* Tier summary bar */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
          <div className="py-5 px-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Total Pageviews</p>
            <p className="font-mono text-xl tabular-nums">{totalPageviews.toLocaleString()}</p>
          </div>
          <div className="py-5 px-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Sites Tracked</p>
            <p className="font-mono text-xl tabular-nums">{currentTier.sitesUsed}</p>
          </div>
          <div className="py-5 px-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Data Retention</p>
            <p className="font-mono text-xl">{currentTier.retention}</p>
          </div>
          <div className="py-5 px-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Rate Limit</p>
            <p className="font-mono text-xl">{currentTier.rateLimit}</p>
          </div>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-6 lg:px-12 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="label mb-4">Your Sites</p>
          <h2 className="display-lg mb-16">
            Analytics <span className="font-serif italic">dashboards</span>
          </h2>

          <div className="space-y-4">
            {sites.map((site, i) => {
              const siteTotal = site.routeViews.reduce((a, b) => a + b, 0);
              return (
                <motion.div
                  key={site.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={`/dashboard/${site.id}`}
                    className="p-6 flex items-center justify-between group block border border-border bg-card hover:border-blue-600 dark:hover:border-blue-400 hover:bg-accent/5 transition-all"
                  >
                    <div className="flex items-center gap-6">
                      <span className="w-2 h-2 rounded-full bg-success" />
                      <div>
                        <p className="font-mono text-sm text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{site.domain}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {siteTotal.toLocaleString()} pageviews • {site.routes.length} routes
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`font-mono text-xs tabular-nums ${site.change.startsWith('+') ? 'text-success' : 'text-destructive'}`}>
                        {site.change}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="mt-12 flex items-center gap-4">
            <Link
              href="/sites/new"
              className="flex items-center gap-2 bg-foreground text-background px-6 py-3 text-sm font-mono hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              New Site
            </Link>
            <Link
              href="/billing"
              className="px-6 py-3 text-sm font-mono border hover:bg-accent/90 transition-colors"
            >
              Upgrade to Pro →
            </Link>
          </div>
        </motion.div>
      </main>

      <AppFooter />
    </div>
  );
}