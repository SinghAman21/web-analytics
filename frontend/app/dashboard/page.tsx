'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import AppFooter from '@/components/shared/AppFooter';
import { ModeToggle } from '@/components/toggle';
import { SpinnerCustom } from '@/components/ui/spinner';
import { getFreeSites, type FreeSite } from '@/lib/apis/freeSites';
import { useAuth } from '@/lib/auth-context';

const currentTier = {
  name: 'Signed-In',
  retention: '90 days',
  rateLimit: '1K req/min',
};

export default function DashboardOverview() {
  const { logout, user, isLoading: authLoading } = useAuth();
  const [sites, setSites] = useState<FreeSite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        setLoading(true);
        const data = await getFreeSites();
        setSites(data);
      } catch (error) {
        console.error('Failed to fetch dashboards:', error);
        setSites([]);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchSites();
      return;
    }

    if (!authLoading && !user) {
      setLoading(false);
      setSites([]);
    }
  }, [authLoading, user]);

  const dashboardStats = useMemo(() => {
    const totalSites = sites.length;
    const uniqueDomains = new Set(sites.map((site) => {
      try {
        return new URL(site.site_url).hostname;
      } catch {
        return site.site_url.replace(/^https?:\/\//, '').split('/')[0];
      }
    })).size;
    const latestCreated = sites[0]?.created_at
      ? new Date(sites[0].created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : 'No sites yet';

    return {
      totalSites,
      uniqueDomains,
      latestCreated,
    };
  }, [sites]);

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
            <Link href="/dashboard/setup" className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">Setup Guide</Link>
            <Link href="/account" className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">Account</Link>
            <Link href="/billing" className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">Billing</Link>
            <button
              type="button"
              onClick={async () => {
                await logout();
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
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Total Dashboards</p>
            <p className="font-mono text-xl tabular-nums">{loading ? '—' : dashboardStats.totalSites.toLocaleString()}</p>
          </div>
          <div className="py-5 px-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Unique Domains</p>
            <p className="font-mono text-xl tabular-nums">{loading ? '—' : dashboardStats.uniqueDomains.toLocaleString()}</p>
          </div>
          <div className="py-5 px-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Latest Created</p>
            <p className="font-mono text-sm">{loading ? 'Loading...' : dashboardStats.latestCreated}</p>
          </div>
          <div className="py-5 px-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Data Retention</p>
            <p className="font-mono text-xl">{currentTier.retention}</p>
          </div>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-6 lg:px-12 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="label mb-4">Your Sites</p>
          <h2 className="display-lg mb-16">
            Analytics <span className="font-serif italic">dashboards</span>
          </h2>

          {loading ? (
            <div className="border border-border bg-card p-12 flex items-center justify-center">
              <SpinnerCustom />
            </div>
          ) : sites.length === 0 ? (
            <div className="border border-border bg-card p-12 text-center space-y-4">
              <div className="mx-auto w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="heading mb-2">No dashboards yet</h3>
                <p className="text-sm text-muted-foreground">Create your first site dashboard to start collecting analytics.</p>
              </div>
              <Link
                href="/sites/new"
                className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-3 text-sm font-mono hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                New Site
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {sites.map((site, i) => (
                <motion.div
                  key={site.hex_share_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={`/dashboard/${site.hex_share_id}`}
                    className="p-6 flex items-center justify-between group block border border-border bg-card hover:border-foreground/40 hover:bg-accent/5 transition-all"
                  >
                    <div className="flex items-center gap-6 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-success shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 min-w-0">
                          <p className="font-mono text-sm text-foreground group-hover:text-foreground transition-colors truncate">{site.site_name}</p>
                          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground shrink-0">Live</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate">{site.site_url}</p>
                        <p className="text-xs text-muted-foreground mt-1 font-mono">Created {new Date(site.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <code className="text-xs font-mono text-muted-foreground hidden sm:block">{site.hex_share_id}</code>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

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