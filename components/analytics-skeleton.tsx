'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { TrendingUp, Lock, Globe, Monitor, Smartphone, Tablet } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import AppFooter from '@/components/shared/AppFooter';

const overviewStats = {
  today: 89,
  change: '+12%',
  bounce: 43,
  avgSession: '2:15',
  uniqueVisitors: 567,
  dailyTrend: '+8%',
  liveUsers: 4,
};

const topPages = [
  { path: '/', views: 523, time: '1:42', bounce: 34, exitRate: 18 },
  { path: '/pricing', views: 312, time: '3:08', bounce: 28, exitRate: 22 },
  { path: '/blog', views: 198, time: '4:22', bounce: 52, exitRate: 45 },
  { path: '/features', views: 156, time: '2:45', bounce: 31, exitRate: 28 },
  { path: '/docs', views: 134, time: '6:12', bounce: 15, exitRate: 12 },
  { path: '/about', views: 89, time: '1:15', bounce: 62, exitRate: 58 },
  { path: '/contact', views: 67, time: '1:45', bounce: 45, exitRate: 65 },
];

const referrers = [
  { source: 'Google', visits: 234, percentage: 45, utm: 'organic' },
  { source: 'Direct', visits: 178, percentage: 32, utm: '-' },
  { source: 'Facebook', visits: 67, percentage: 12, utm: 'social' },
  { source: 'Twitter', visits: 34, percentage: 6, utm: 'social' },
  { source: 'LinkedIn', visits: 28, percentage: 5, utm: 'social' },
];

const liveSessions = [
  { location: 'India', page: '/pricing', browser: 'Chrome', os: 'Windows', time: '2:34' },
  { location: 'USA', page: '/docs', browser: 'Safari', os: 'macOS', time: '5:12' },
  { location: 'Germany', page: '/blog', browser: 'Firefox', os: 'Linux', time: '1:08' },
  { location: 'UK', page: '/', browser: 'Chrome', os: 'Android', time: '0:45' },
];

const browsers = [
  { name: 'Chrome', share: 45, sessions: 234 },
  { name: 'Safari', share: 23, sessions: 119 },
  { name: 'Firefox', share: 15, sessions: 78 },
  { name: 'Edge', share: 10, sessions: 52 },
  { name: 'Other', share: 7, sessions: 36 },
];

const operatingSystems = [
  { name: 'Windows', share: 32, sessions: 166 },
  { name: 'macOS', share: 28, sessions: 145 },
  { name: 'iOS', share: 18, sessions: 93 },
  { name: 'Android', share: 15, sessions: 78 },
  { name: 'Linux', share: 7, sessions: 36 },
];

const countries = [
  { name: 'India', visitors: 234, percentage: 32, sparkline: [12, 18, 15, 22, 19, 25, 21] },
  { name: 'United States', visitors: 178, percentage: 24, sparkline: [20, 22, 18, 24, 21, 23, 25] },
  { name: 'Germany', visitors: 89, percentage: 12, sparkline: [8, 10, 12, 9, 11, 13, 12] },
  { name: 'United Kingdom', visitors: 67, percentage: 9, sparkline: [5, 7, 6, 8, 7, 9, 8] },
  { name: 'France', visitors: 45, percentage: 6, sparkline: [3, 5, 4, 6, 5, 7, 6] },
  { name: 'Canada', visitors: 34, percentage: 5, sparkline: [2, 4, 3, 5, 4, 6, 5] },
  { name: 'Japan', visitors: 28, percentage: 4, sparkline: [2, 3, 2, 4, 3, 4, 3] },
  { name: 'Brazil', visitors: 23, percentage: 3, sparkline: [1, 3, 2, 3, 2, 4, 3] },
  { name: 'Australia', visitors: 19, percentage: 3, sparkline: [1, 2, 2, 3, 2, 3, 2] },
  { name: 'Netherlands', visitors: 12, percentage: 2, sparkline: [1, 1, 2, 1, 2, 2, 1] },
];

const devices = [
  { name: 'Desktop', share: 52, icon: Monitor },
  { name: 'Mobile', share: 38, icon: Smartphone },
  { name: 'Tablet', share: 10, icon: Tablet },
];

const tabList = ['Overview', 'Pages', 'Referrers', 'Browsers', 'OS', 'Geo', 'Live'];

export default function AnalyticsDashboard({ siteId }: { siteId: string }) {
  // const { siteId } = useParams();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d' | '90d'>('today');
  const [activeTab, setActiveTab] = useState('overview');
  const totalPageviews = topPages.reduce((sum, p) => sum + p.views, 0);

  const handleGeoClick = () => {
    router.push(`/dashboard/${siteId}?view=geo`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6 flex items-center gap-6">
          <Link href="/" className="font-serif text-2xl italic tracking-tight hover:opacity-70 transition-opacity">Pulse</Link>
          <span className="w-px h-6 bg-border" />
          <Link href="/dashboard" className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-mono">{siteId || 'mysite.com'}</span>
        </div>
      </header>

      {/* Header Controls */}
      <div className="border-b border-border bg-background/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex items-center justify-end gap-4">
          <span className="text-[10px] font-mono px-2 py-1 border border-border text-muted-foreground">SIGNED-IN</span>
          <span className="text-[10px] font-mono text-muted-foreground">90-day retention</span>
          <div className="flex gap-1">
            {(['today', '7d', '30d', '90d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 text-xs font-mono transition-colors ${
                  timeRange === r ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          {/* Geography Button */}
          <button
            onClick={handleGeoClick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded border text-sm font-mono transition-colors bg-background text-foreground border-border hover:bg-muted"
          >
            <Globe className="w-4 h-4" />
            Geography
          </button>
        </div>
      </div>

      {/* Quick Stats — Signed-In: Total + Live active, Unique + Daily trend, Bounce + Session duration */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-2 md:grid-cols-5 divide-x divide-border">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6 px-4">
            <p className="label mb-2">Pageviews</p>
            <p className="text-3xl font-mono font-light tabular-nums">{totalPageviews.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1 font-mono">Sum of all routes</p>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="py-6 px-4">
            <p className="label mb-2">Unique Visitors</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-mono font-light tabular-nums">{overviewStats.uniqueVisitors}</p>
              <span className="text-xs font-mono text-success">{overviewStats.dailyTrend}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono">Daily trend</p>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="py-6 px-4">
            <p className="label mb-2">Bounce Rate</p>
            <p className="text-3xl font-mono font-light tabular-nums">{overviewStats.bounce}%</p>
            <p className="text-xs text-muted-foreground mt-1 font-mono">+ session duration</p>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="py-6 px-4">
            <p className="label mb-2">Avg Session</p>
            <p className="text-3xl font-mono font-light tabular-nums">{overviewStats.avgSession}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="py-6 px-4">
            <p className="label mb-2">Live Users</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <p className="text-3xl font-mono font-light tabular-nums">{overviewStats.liveUsers}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono">Last 5 min</p>
          </motion.div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="h-auto p-0 bg-transparent rounded-none gap-0 border-b border-border mb-12 flex flex-wrap justify-start">
            {tabList.map((tab) => (
              <div key={tab} className="relative">
                <button
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className="relative px-5 py-4 text-sm font-mono rounded-none bg-transparent hover:bg-transparent text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-0 border-0"
                  style={{
                    color: activeTab === tab.toLowerCase() ? 'var(--foreground)' : 'var(--muted-foreground)',
                  }}
                >
                  {tab}
                </button>
                {activeTab === tab.toLowerCase() && (
                  <motion.div
                    layoutId="underline-analytics"
                    className="absolute bottom-0 left-1/2 h-px bg-foreground"
                    initial={{ width: 0, marginLeft: 0 }}
                    animate={{ width: '100%', marginLeft: '-50%' }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="mt-0 space-y-16">
            <div className="max-w-7xl px-6 lg:px-12 grid lg:grid-cols-2 gap-12">
              {/* Top Pages (Top 20, searchable) */}
              <section>
                <div className="mb-8">
                  <p className="label mb-2">Content</p>
                  <h3 className="text-2xl font-serif italic">Top pages</h3>
                </div>
                <div className="space-y-0">
                  <div className="grid grid-cols-12 gap-4 pb-4 border-b border-border text-xs text-muted-foreground">
                    <span className="col-span-6">Page</span>
                    <span className="col-span-3 text-right">Views</span>
                    <span className="col-span-3 text-right">Avg Time</span>
                  </div>
                  {topPages.slice(0, 5).map((page, i) => (
                    <motion.div
                      key={page.path}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="grid grid-cols-12 gap-4 py-4 border-b border-border hover:bg-secondary/30 transition-colors -mx-4 px-4"
                    >
                      <span className="col-span-6 font-mono text-sm">{page.path}</span>
                      <span className="col-span-3 font-mono text-sm text-right tabular-nums">{page.views}</span>
                      <span className="col-span-3 font-mono text-sm text-right tabular-nums">{page.time}</span>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Device Breakdown — Signed-In: Mobile/Desktop + Tablet */}
              <section>
                <div className="mb-8">
                  <p className="label mb-2">Devices</p>
                  <h3 className="text-2xl font-serif italic">Device breakdown</h3>
                </div>
                <div className="editorial-card p-8 space-y-6">
                  {devices.map((d, i) => (
                    <div key={d.name}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <d.icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{d.name}</span>
                        </div>
                        <span className="font-mono text-2xl font-light tabular-nums">{d.share}%</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-sm overflow-hidden">
                        <motion.div
                          className="h-full bg-foreground rounded-sm"
                          initial={{ width: 0 }}
                          animate={{ width: `${d.share}%` }}
                          transition={{ delay: 0.2 + i * 0.1, duration: 0.6 }}
                        />
                      </div>
                    </div>
                  ))}
                  <ProTeaser label="Screen resolution breakdown" />
                </div>
              </section>
            </div>

            {/* Referrers preview */}
            <section>
              <div className="mb-8">
                <p className="label mb-2">Acquisition</p>
                <h3 className="text-2xl font-serif italic">Top referrers</h3>
              </div>
              <div className="grid lg:grid-cols-2 gap-8">
                {referrers.slice(0, 4).map((ref, i) => (
                  <motion.div key={ref.source} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }}>
                    <div className="flex items-baseline justify-between mb-2">
                      <div className="flex items-baseline gap-3">
                        <span className="text-sm">{ref.source}</span>
                        <span className="font-mono text-xs text-muted-foreground">{ref.utm}</span>
                      </div>
                      <span className="font-mono text-sm tabular-nums">{ref.visits}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-sm overflow-hidden">
                      <motion.div className="h-full bg-foreground rounded-sm" initial={{ width: 0 }} animate={{ width: `${ref.percentage}%` }} transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            <ProTeaser label="Unlock Heatmaps, Funnels, Geo Maps & City-level data with Pro" showUpgrade />
          </TabsContent>

          {/* PAGES TAB — Signed-In: All pages, searchable, top 20 */}
          <TabsContent value="pages" className="mt-0 space-y-16">
            <section>
              <div className="mb-8">
                <p className="label mb-2">Performance</p>
                <h3 className="text-2xl font-serif italic">All pages</h3>
                <p className="text-xs text-muted-foreground mt-2">Searchable list • Top 20 pages</p>
              </div>
              <div className="space-y-0">
                <div className="grid grid-cols-12 gap-4 pb-4 border-b border-border text-xs text-muted-foreground">
                  <span className="col-span-4">Page</span>
                  <span className="col-span-2 text-right">Views</span>
                  <span className="col-span-2 text-right">Bounce</span>
                  <span className="col-span-2 text-right">Avg Time</span>
                  <span className="col-span-2 text-right">Exit Rate</span>
                </div>
                {topPages.map((page, i) => (
                  <motion.div
                    key={page.path}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="grid grid-cols-12 gap-4 py-4 border-b border-border hover:bg-secondary/30 transition-colors -mx-4 px-4"
                  >
                    <span className="col-span-4 font-mono text-sm">{page.path}</span>
                    <span className="col-span-2 font-mono text-sm text-right tabular-nums">{page.views}</span>
                    <span className={`col-span-2 font-mono text-sm text-right tabular-nums ${page.bounce > 50 ? 'text-warning' : ''}`}>{page.bounce}%</span>
                    <span className="col-span-2 font-mono text-sm text-right tabular-nums">{page.time}</span>
                    <span className={`col-span-2 font-mono text-sm text-right tabular-nums ${page.exitRate > 50 ? 'text-warning' : page.exitRate < 20 ? 'text-success' : ''}`}>{page.exitRate}%</span>
                  </motion.div>
                ))}
              </div>
            </section>
            <ProTeaser label="Heatmap & Funnel Analysis available on Pro" showUpgrade />
          </TabsContent>

          {/* REFERRERS TAB — Signed-In: Top 10, searchable, basic UTM */}
          <TabsContent value="referrers" className="mt-0 space-y-16">
            <section>
              <div className="mb-8">
                <p className="label mb-2">Acquisition</p>
                <h3 className="text-2xl font-serif italic">Where visitors come from</h3>
                <p className="text-xs text-muted-foreground mt-2">Top 10 • Basic UTM (source/medium)</p>
              </div>
              <div className="space-y-6">
                {referrers.map((s, i) => (
                  <motion.div key={s.source} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }}>
                    <div className="flex items-baseline justify-between mb-2">
                      <div className="flex items-baseline gap-4">
                        <span className="text-sm">{s.source}</span>
                        <span className="font-mono text-xs text-muted-foreground">{s.utm}</span>
                      </div>
                      <div className="flex items-baseline gap-4">
                        <span className="font-mono text-sm tabular-nums">{s.visits}</span>
                        <span className="font-mono text-xs text-muted-foreground w-8 text-right">{s.percentage}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-secondary rounded-sm overflow-hidden">
                      <motion.div className="h-full bg-foreground rounded-sm" initial={{ width: 0 }} animate={{ width: `${s.percentage}%` }} transition={{ delay: 0.2 + i * 0.08, duration: 0.5 }} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
            <ProTeaser label="Full UTM Breakdown (source / medium / campaign) available on Pro" showUpgrade />
          </TabsContent>

          {/* BROWSERS TAB — Signed-In: Top 10 */}
          <TabsContent value="browsers" className="mt-0 space-y-16">
            <section>
              <div className="mb-8">
                <p className="label mb-2">Technology</p>
                <h3 className="text-2xl font-serif italic">Browsers</h3>
                <p className="text-xs text-muted-foreground mt-2">Top 10 browsers</p>
              </div>
              <div className="grid lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  {browsers.map((b, i) => (
                    <motion.div key={b.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }}>
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-sm">{b.name}</span>
                        <div className="flex items-baseline gap-3">
                          <span className="font-mono text-xs text-muted-foreground">{b.sessions} sessions</span>
                          <span className="font-mono text-lg font-light tabular-nums">{b.share}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-sm overflow-hidden">
                        <motion.div className="h-full bg-foreground rounded-sm" initial={{ width: 0 }} animate={{ width: `${b.share}%` }} transition={{ delay: 0.2 + i * 0.1, duration: 0.6 }} />
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="editorial-card p-8 flex flex-col justify-center">
                  <p className="label mb-4">Most Popular</p>
                  <p className="text-5xl font-mono font-light tabular-nums mb-2">{browsers[0].share}%</p>
                  <p className="text-lg">{browsers[0].name}</p>
                  <div className="divider my-6" />
                  <ProTeaser label="All browsers + version breakdown" />
                </div>
              </div>
            </section>
          </TabsContent>

          {/* OS TAB — Signed-In: Top list */}
          <TabsContent value="os" className="mt-0 space-y-16">
            <section>
              <div className="mb-8">
                <p className="label mb-2">Technology</p>
                <h3 className="text-2xl font-serif italic">Operating Systems</h3>
              </div>
              <div className="grid lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  {operatingSystems.map((os, i) => (
                    <motion.div key={os.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }}>
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-sm">{os.name}</span>
                        <div className="flex items-baseline gap-3">
                          <span className="font-mono text-xs text-muted-foreground">{os.sessions} sessions</span>
                          <span className="font-mono text-lg font-light tabular-nums">{os.share}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-sm overflow-hidden">
                        <motion.div className="h-full bg-foreground rounded-sm" initial={{ width: 0 }} animate={{ width: `${os.share}%` }} transition={{ delay: 0.2 + i * 0.1, duration: 0.6 }} />
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="editorial-card p-8 flex flex-col justify-center">
                  <p className="label mb-4">Desktop vs Mobile OS</p>
                  <div className="space-y-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm">Desktop OS</span>
                      <span className="font-mono text-2xl font-light tabular-nums">60%</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm">Mobile OS</span>
                      <span className="font-mono text-2xl font-light tabular-nums">33%</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm">Other</span>
                      <span className="font-mono text-2xl font-light tabular-nums">7%</span>
                    </div>
                  </div>
                  <div className="divider my-6" />
                  <ProTeaser label="All OS + Mobile OS versions" />
                </div>
              </div>
            </section>
          </TabsContent>

          {/* GEO TAB — Signed-In: Top 10 countries + sparkline trends */}
          <TabsContent value="geo" className="mt-0 space-y-16">
            <section>
              <div className="mb-8">
                <p className="label mb-2">Geography</p>
                <h3 className="text-2xl font-serif italic">Where are your users?</h3>
                <p className="text-xs text-muted-foreground mt-2">Top 7 countries • Sparkline trends</p>
              </div>
              <div className="space-y-0">
                <div className="grid grid-cols-12 gap-4 pb-4 border-b border-border text-xs text-muted-foreground">
                  <span className="col-span-1">#</span>
                  <span className="col-span-4">Country</span>
                  <span className="col-span-3 text-right">Visitors</span>
                  <span className="col-span-2 text-right">Share</span>
                  <span className="col-span-2 text-right">7d Trend</span>
                </div>
                {countries.map((c, i) => {
                  const maxVal = Math.max(...c.sparkline);
                  return (
                    <motion.div
                      key={c.name}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="grid grid-cols-12 gap-4 py-4 border-b border-border hover:bg-secondary/30 transition-colors -mx-4 px-4 items-center"
                    >
                      <span className="col-span-1 font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
                      <span className="col-span-4 text-sm">{c.name}</span>
                      <span className="col-span-3 font-mono text-sm text-right tabular-nums">{c.visitors}</span>
                      <span className="col-span-2 font-mono text-sm text-right tabular-nums">{c.percentage}%</span>
                      <div className="col-span-2 flex items-end gap-[2px] h-4 justify-end">
                        {c.sparkline.map((v, si) => (
                          <div key={si} className="w-1 bg-foreground/40 rounded-sm" style={{ height: `${(v / maxVal) * 100}%` }} />
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
            <ProTeaser label="All countries + Cities + Interactive Map available on Pro" showUpgrade />
          </TabsContent>

          {/* LIVE TAB — Signed-In: Active users last 5min */}
          <TabsContent value="live" className="mt-0 space-y-16">
            <section>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="label mb-2">Real-time</p>
                  <h3 className="text-2xl font-serif italic">Live visitors</h3>
                  <p className="text-xs text-muted-foreground mt-2">Active users in the last 5 minutes</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="font-mono text-sm">{liveSessions.length} active</span>
                </div>
              </div>

              <div className="editorial-card overflow-hidden">
                <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border text-xs text-muted-foreground">
                  <span className="col-span-2">Location</span>
                  <span className="col-span-3">Page</span>
                  <span className="col-span-3">Browser</span>
                  <span className="col-span-2">OS</span>
                  <span className="col-span-2 text-right">Duration</span>
                </div>
                {liveSessions.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                  >
                    <span className="col-span-2 text-sm">{s.location}</span>
                    <span className="col-span-3 font-mono text-sm">{s.page}</span>
                    <span className="col-span-3 text-sm text-muted-foreground">{s.browser}</span>
                    <span className="col-span-2 text-sm text-muted-foreground">{s.os}</span>
                    <span className="col-span-2 font-mono text-sm text-right tabular-nums">{s.time}</span>
                  </motion.div>
                ))}
              </div>
            </section>
            <ProTeaser label="Real-time Geo Map + Live session locations available on Pro" showUpgrade />
          </TabsContent>
        </Tabs>
      </main>
      <AppFooter />
    </div>
  );
}

function ProTeaser({ label, showUpgrade = false }: { label: string; showUpgrade?: boolean }) {
  return (
    <div className="editorial-card p-6 flex items-center gap-4">
      <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      {showUpgrade && (
        <Link href="/billing" className="px-4 py-2 bg-foreground text-background text-xs font-mono hover:opacity-90 transition-opacity flex-shrink-0">
          Upgrade to Pro →
        </Link>
      )}
    </div>
  );
}
