'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createPublicSite } from '@/lib/apis/publicSites';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { ModeToggle } from '@/components/toggle';

export default function PublicNew() {
  const router = useRouter();
  const [siteName, setSiteName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [generatedHex, setGeneratedHex] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'confirm'>('form');

  const handleGenerate = () => {
    if (!siteName.trim() || !siteUrl.trim()) return;
    const hex = Array.from(crypto.getRandomValues(new Uint8Array(6)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    setGeneratedHex(hex);
    setStep('confirm');
  };

  const ensureHttpsUrl = (url: string): string => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  const handleSubmit = () => {
    if (!generatedHex) return;
    const fullUrl = ensureHttpsUrl(siteUrl.trim());
    createPublicSite(siteName.trim(), fullUrl);
    router.push('/public');
  };

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
            <h1 className="text-sm font-mono text-muted-foreground">Create Dashboard</h1>
          </div>
          <ModeToggle />
        </div>
      </motion.header>

      <main className="max-w-2xl mx-auto px-6 lg:px-12 pt-32 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link
            href="/public"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to public dashboards
          </Link>

          <p className="label mb-4">Free Tier</p>
          <h1 className="display-lg mb-4">
            Create <span className="font-serif italic">Dashboard</span>
          </h1>
          <p className="text-muted-foreground mb-12">
            Set up a free public analytics dashboard — no account required.
          </p>

          {step === 'form' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div>
                <label className="label mb-2 block">Site Name</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full bg-secondary border border-border px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="My Blog"
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
                    // placeholder="useraman.me"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!siteName.trim() || !siteUrl.trim()}
                className="w-full bg-foreground text-background px-6 py-3 text-sm font-mono hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate Hex Code
              </button>
            </motion.div>
          )}

          {step === 'confirm' && generatedHex && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="border border-border bg-card p-8 text-center">
                <p className="label mb-4">Your Hex Code</p>
                <code className="text-3xl md:text-4xl font-mono tracking-wider">
                  {generatedHex}
                </code>
                <p className="text-sm text-muted-foreground mt-4">
                  Your public dashboard will be available at
                </p>
                <p className="text-sm font-mono text-foreground mt-1">
                  /analytics/{generatedHex}
                </p>
              </div>

              <div className="border border-border bg-card p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{siteName}</p>
                    <p className="text-xs text-muted-foreground mt-1">{ensureHttpsUrl(siteUrl)}</p>
                  </div>
                  <span className="label bg-secondary px-3 py-1">Free</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep('form')}
                  className="flex-1 border border-border px-6 py-3 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-foreground text-background px-6 py-3 text-sm font-mono hover:opacity-90 transition-opacity"
                >
                  Create Dashboard →
                </button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Free tier includes 30-day retention, aggregate metrics, and device breakdown.
              </p>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}