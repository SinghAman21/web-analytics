'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { ModeToggle } from '@/components/toggle';
import { SpinnerCustom } from '@/components/ui/spinner';
import { createFreeSite } from '@/lib/apis/freeSites';
import { useAuth } from '@/lib/auth-context';

function ensureHttpsUrl(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}

export default function SitesNewPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [siteName, setSiteName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, user, router]);

  const handleSubmit = async () => {
    if (!siteName.trim() || !siteUrl.trim()) return;

    try {
      setIsSubmitting(true);
      setError('');
      await createFreeSite(siteName.trim(), ensureHttpsUrl(siteUrl.trim()));
      router.push('/dashboard');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to create site');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
            <h1 className="text-sm font-mono text-muted-foreground">Create Site</h1>
          </div>
          <ModeToggle />
        </div>
      </motion.header>

      <main className="max-w-2xl mx-auto px-6 lg:px-12 pt-24 pb-24 w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </Link>

          <p className="label mb-4">Signed-In</p>
          <h1 className="display-lg mb-4">
            Create <span className="font-serif italic">Site</span>
          </h1>
          <p className="text-muted-foreground mb-10">
            Add a site to your account. Only your own sites will appear on your dashboard.
          </p>

          <div className="space-y-6">
            <div>
              <label className="label mb-2 block">Site Name</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full bg-secondary border border-border px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="My Blog"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="label mb-2 block">Site URL</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-sm font-mono text-muted-foreground">https://</span>
                <input
                  type="text"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  className="w-full bg-secondary border border-border pl-[85px] pr-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="example.com"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {error ? (
              <div className="rounded border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !siteName.trim() || !siteUrl.trim() || authLoading || !user}
              className="w-full bg-foreground text-background px-6 py-3 text-sm font-mono hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? <SpinnerCustom /> : <Plus className="w-4 h-4" />}
              {isSubmitting ? 'Creating Site...' : 'Create Site'}
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}