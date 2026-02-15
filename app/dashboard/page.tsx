'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight, Plus } from 'lucide-react';
import AppHeader from '@/components/shared/AppHeader';
import AppFooter from '@/components/shared/AppFooter';

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
  const totalPageviews = sites.reduce((sum, s) => sum + s.routeViews.reduce((a, b) => a + b, 0), 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader title="Dashboard" />

      {/* Dashboard Controls */}
      <div className="border-b border-border bg-background/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex items-center justify-end gap-4">
          <span className="text-[10px] font-mono px-2 py-1 border border-border text-muted-foreground">{currentTier.name.toUpperCase()}</span>
          <Link href="/account" className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">Account</Link>
          <Link href="/billing" className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">Billing</Link>
        </div>
      </div>

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
                    className="editorial-card-hover p-6 flex items-center justify-between group block"
                  >
                    <div className="flex items-center gap-6">
                      <span className="w-2 h-2 rounded-full bg-success" />
                      <div>
                        <p className="font-mono text-sm group-hover:text-accent transition-colors">{site.domain}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {siteTotal.toLocaleString()} pageviews • {site.routes.length} routes
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`font-mono text-xs tabular-nums ${site.change.startsWith('+') ? 'text-success' : 'text-destructive'}`}>
                        {site.change}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
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
              className="px-6 py-3 text-sm font-mono text-accent border border-accent/30 hover:bg-accent/10 transition-colors"
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