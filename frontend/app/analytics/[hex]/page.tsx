'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Share2, ExternalLink, Lock, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { 
  getAnalytics, 
  getSiteInfo, 
  type AnalyticsData, 
  type SiteInfo 
} from '@/lib/apis/ultrafreeanalytics';
import { SpinnerCustom } from '@/components/ui/spinner';

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
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!hex || typeof hex !== 'string') return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [analyticsData, siteData] = await Promise.all([
        getAnalytics(hex),
        getSiteInfo(hex)
      ]);
      setAnalytics(analyticsData);
      setSiteInfo(siteData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [hex]);

  // Process daily data for chart
  const processDailyData = () => {
    if (!analytics?.daily_data || analytics.daily_data.length === 0) {
      return [];
    }

    return analytics.daily_data.map(item => {
      const date = new Date(item.date);
      return {
        date: item.date,
        views: item.views,
        day: date.getDate(),
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        monthName: date.toLocaleDateString('en-US', { month: 'long' }),
        year: date.getFullYear()
      };
    });
  };

  const dailyData = processDailyData();
  const maxViews = Math.max(...dailyData.map(d => d.views), 1);
  const currentMonth = dailyData.length > 0 ? dailyData[dailyData.length - 1].monthName : '';
  const currentYear = dailyData.length > 0 ? dailyData[dailyData.length - 1].year : new Date().getFullYear();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          {/* <RefreshCw className="w-5 h-5 animate-spin" /> */}
          <SpinnerCustom/>
          <span className="font-mono text-sm">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error || !analytics || !siteInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{error || 'No data found'}</p>
          <button 
            onClick={fetchData}
            className="bg-foreground text-background px-6 py-3 text-sm font-mono hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
            <button 
              onClick={fetchData}
              className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
            >
              {/* <RefreshCw className="w-3 h-3" /> */}
              <SpinnerCustom/>

              Refresh
            </button>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard');
              }}
              className="flex cursor-pointer items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
            >
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
              <span className="font-serif italic">{siteInfo.name}</span>
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground text-sm">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-3 h-3" />
                <a 
                  href={siteInfo.site_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-mono hover:text-foreground transition-colors"
                >
                  {siteInfo.site_url}
                </a>
              </div>
              <span className="w-px h-4 bg-border" />
              <span className="font-mono text-xs">30 days retention</span>
              <span className="font-mono text-xs">ID: {hex}</span>
            </div>
          </div>

          {/* Key metrics — Free tier: Pageviews (aggregate), Unique Visitors (aggregate), Bounce Rate (aggregate) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-border divide-x divide-border mb-16">
            <div className="p-6">
              <p className="label mb-3">Pageviews</p>
              <p className="text-4xl font-mono font-light tabular-nums">
                {analytics.total_pageviews.toLocaleString()}
              </p>
              <p className="text-[10px] text-muted-foreground mt-2 font-mono">Sum of all routes</p>
            </div>
            <div className="p-6">
              <p className="label mb-3">Unique Visitors</p>
              <p className="text-4xl font-mono font-light tabular-nums">
                {analytics.unique_visitors.toLocaleString()}
              </p>
              <p className="text-[10px] text-muted-foreground mt-2 font-mono">Unique cookies</p>
            </div>
            <div className="p-6">
              <p className="label mb-3">Bounce Rate</p>
              <p className="text-4xl font-mono font-light tabular-nums">
                {analytics.bounce_rate}%
              </p>
              <p className="text-[10px] text-muted-foreground mt-2 font-mono">Single-page sessions</p>
            </div>
            <div className="p-6">
              <p className="label mb-3">Sessions</p>
              <p className="text-4xl font-mono font-light tabular-nums">
                {analytics.sessions.toLocaleString()}
              </p>
              <p className="text-[10px] text-muted-foreground mt-2 font-mono">Avg {analytics.avg_pages_per_session} pages/session</p>
            </div>
          </div>

          {/* Daily chart */}
          <section className="mb-16">
            <p className="label mb-6">{currentMonth} {currentYear}</p>
            <div className="editorial-card p-8">
              {dailyData.length > 0 ? (
                <>
                  <div className="flex items-end gap-1 min-h-[200px] mb-4">
                    {dailyData.map((item, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                        {item.views > 0 && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${item.views}px` }}
                            transition={{ delay: i * 0.01, duration: 0.4 }}
                            className="w-full bg-foreground/60 hover:bg-foreground transition-colors rounded-sm cursor-pointer"
                            title={`${item.date}: ${item.views} views`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    {dailyData.map((item, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center text-center min-w-0">
                        <span className="text-[10px] font-mono text-foreground">{item.day}</span>
                        <span className="text-[8px] font-mono text-muted-foreground">{item.dayName}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="min-h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                  No data available
                </div>
              )}
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
                  <span className="text-4xl font-mono font-light tabular-nums">{analytics.mobile_percentage}%</span>
                  <span className="text-sm text-muted-foreground">Mobile</span>
                </div>
                <span className="text-muted-foreground text-2xl font-light">/</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-mono font-light tabular-nums">{analytics.desktop_percentage}%</span>
                  <span className="text-sm text-muted-foreground">Desktop</span>
                </div>
              </div>
              <div className="h-3 bg-secondary rounded-sm overflow-hidden mt-6 flex">
                <motion.div
                  className="h-full bg-foreground"
                  initial={{ width: 0 }}
                  animate={{ width: `${analytics.mobile_percentage}%` }}
                  transition={{ duration: 0.6 }}
                />
                <motion.div
                  className="h-full bg-foreground/30"
                  initial={{ width: 0 }}
                  animate={{ width: `${analytics.desktop_percentage}%` }}
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
              <Link href="/login" className="bg-foreground text-background px-6 py-3 text-sm font-mono hover:opacity-90 transition-opacity">
                Sign Up Free →
              </Link>
              <Link href="/billing" className="px-6 py-3 text-sm font-mono border hover:bg-accent/50 transition-colors">
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
