'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getPublicSites, type PublicSite } from '@/lib/apis/publicSites';
import { ArrowRight, Plus, BarChart3 } from 'lucide-react';
import { ModeToggle } from '@/components/toggle';
import { SpinnerCustom } from "@/components/ui/spinner"

export default function PublicList() {
  const [sites, setSites] = useState<PublicSite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        setLoading(true);
        const data = await getPublicSites();
        setSites(data);
      } catch (error) {
        console.error('Failed to fetch sites:', error);
        setSites([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSites();
  }, []);

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
            <h1 className="text-sm font-mono text-muted-foreground">Public Dashboards</h1>
          </div>
          <ModeToggle />
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-6 lg:px-12 pt-32 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="label mb-4">Free Tier</p>
              <h1 className="display-lg">
                Public <span className="font-serif italic">Dashboards</span>
              </h1>
              <p className="text-muted-foreground mt-4 max-w-lg">
                No sign-up required. Create a free public dashboard for any site and share it with anyone.
              </p>
            </div>
            <Link
              href="/public/new"
              className="hidden md:inline-flex items-center gap-2 bg-foreground text-background px-5 py-3 text-sm font-mono hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              New Dashboard
            </Link>
          </div>

          {/* Mobile CTA */}
          <Link
            href="/public/new"
            className="md:hidden flex items-center justify-center gap-2 bg-foreground text-background px-5 py-3 text-sm font-mono hover:opacity-90 transition-opacity mb-8 w-full"
          >
            <Plus className="w-4 h-4" />
            New Dashboard
          </Link>
          { loading ? (
            <div className="border border-border bg-card p-12 flex items-center justify-center">
              <SpinnerCustom />
            </div>
          ) :
          sites.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="border border-border bg-card p-12 text-center"
            >
              <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
              <h3 className="heading mb-2">No dashboards yet</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Create your first free public analytics dashboard in seconds.
              </p>
              <Link
                href="/public/new"
                className="inline-flex items-center gap-2 text-sm font-mono hover:opacity-80 transition-opacity"
              >
                Get started <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs uppercase tracking-[0.15em] text-muted-foreground border-b border-border">
                <span className="col-span-4">Site Name</span>
                <span className="col-span-4">Hex Code</span>
                <span className="col-span-3">Created</span>
                <span className="col-span-1" />
              </div>

              {sites.map((site, i) => (
                <motion.div
                  key={site.hex_share_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <Link
                    href={`/analytics/${site.hex_share_id}`}
                    className="grid grid-cols-12 gap-4 px-4 py-4 border border-border bg-card hover:border-blue-600 dark:hover:border-blue-400 hover:bg-accent/5 transition-all group items-center"
                  >
                    <div className="col-span-4">
                      <p className="font-medium text-sm">{site.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{site.site_url}</p>
                    </div>
                    <div className="col-span-4">
                      <code className="text-xs font-mono">{site.hex_share_id}</code>
                    </div>
                    <div className="col-span-3">
                      <span className="text-xs">
                        {new Date(site.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {/* Upgrade CTA */}
          <div className="mt-16 border border-border bg-card p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="label mb-2">Want more?</p>
              <h3 className="heading">Unlock live users, referrers & geo data</h3>
              <p className="text-sm text-muted-foreground mt-1">Sign up for free to access private dashboards with 90-day retention.</p>
            </div>
            <Link
              href="/login"
              className="bg-foreground text-background px-5 py-3 text-sm font-mono hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Create Account →
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}