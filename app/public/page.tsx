'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getPublicSites, type PublicSite } from '@/lib/publicSites';
import { ArrowRight, Plus, BarChart3 } from 'lucide-react';
import Header from '@/components/dashboard/Header';

export default function PublicList() {
  const [sites, setSites] = useState<PublicSite[]>([]);

  useEffect(() => {
    setSites(getPublicSites());
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

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

          {sites.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="editorial-card p-12 text-center"
            >
              <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
              <h3 className="heading mb-2">No dashboards yet</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Create your first free public analytics dashboard in seconds.
              </p>
              <Link
                href="/public/new"
                className="inline-flex items-center gap-2 text-sm font-mono text-accent hover:opacity-80 transition-opacity"
              >
                Get started <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-px">
              <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs uppercase tracking-[0.15em] text-muted-foreground border-b border-border">
                <span className="col-span-4">Site Name</span>
                <span className="col-span-4">Hex Code</span>
                <span className="col-span-3">Created</span>
                <span className="col-span-1" />
              </div>

              {sites.map((site, i) => (
                <motion.div
                  key={site.hex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <Link
                    href={`/analytics/${site.hex}`}
                    className="grid grid-cols-12 gap-4 px-4 py-4 editorial-card-hover group items-center"
                  >
                    <div className="col-span-4">
                      <p className="font-medium text-sm">{site.siteName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{site.siteUrl}</p>
                    </div>
                    <div className="col-span-4">
                      <code className="text-xs font-mono">{site.hex}</code>
                    </div>
                    <div className="col-span-3">
                      <span className="text-xs">
                        {new Date(site.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {/* Upgrade CTA */}
          <div className="mt-16 editorial-card p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="label mb-2">Want more?</p>
              <h3 className="heading">Unlock live users, referrers & geo data</h3>
              <p className="text-sm text-muted-foreground mt-1">Sign up for free to access private dashboards with 90-day retention.</p>
            </div>
            <Link
              href="/register"
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