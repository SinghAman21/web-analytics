'use client';

import Link from 'next/link';
import { ArrowLeft, Check, Code, Zap, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import AppFooter from '@/components/shared/AppFooter';
import { ModeToggle } from '@/components/toggle';

export default function SetupGuidePage() {
  const steps = [
    {
      number: 1,
      title: 'Create Your Site & Get Hex ID',
      description: 'Go to your dashboard and create a new site. You\'ll receive a unique 12-character hex identifier.',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Example hex ID: <span className="font-mono bg-secondary px-2 py-1 rounded">a1b2c3d4e5f6</span>
          </p>
          <p className="text-sm text-muted-foreground">
            This unique identifier connects your website to your dashboard. Keep it safe and never share it publicly on the client side.
          </p>
        </div>
      ),
    },
    {
      number: 2,
      title: 'Install the Tracking Script',
      description: 'Add the Pulse analytics script to your website.',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-3">
            Add this script tag before your closing <span className="font-mono bg-secondary px-2 py-1 rounded">&lt;/body&gt;</span> tag:
          </p>
          <pre className="bg-secondary border border-border p-4 overflow-x-auto text-xs md:text-sm leading-6 font-mono rounded">
{`<script
  defer
  src="https://pulsev0.vercel.app/free.js"
  data-site-hex="YOUR_SITE_HEX"
></script>`}
          </pre>
          <p className="text-xs text-muted-foreground">
            Replace <span className="font-mono">YOUR_SITE_HEX</span> with your actual hex ID from step 1.
          </p>
        </div>
      ),
    },
    {
      number: 3,
      title: 'Set Up UTM Parameters',
      description: 'Track traffic source, medium, campaign, and more with UTM parameters.',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Add UTM parameters to your URLs to track campaign performance. The tracker automatically captures them.
          </p>
          
          <div className="border border-border rounded p-4 bg-card space-y-3">
            <div>
              <p className="font-mono text-xs font-semibold text-foreground mb-1">utm_source</p>
              <p className="text-xs text-muted-foreground">Where visitors come from (e.g., google, facebook, newsletter)</p>
            </div>
            <div>
              <p className="font-mono text-xs font-semibold text-foreground mb-1">utm_medium</p>
              <p className="text-xs text-muted-foreground">Type of link (e.g., cpc, social, email, organic)</p>
            </div>
            <div>
              <p className="font-mono text-xs font-semibold text-foreground mb-1">utm_campaign</p>
              <p className="text-xs text-muted-foreground">Name of your campaign (e.g., summer_sale, product_launch)</p>
            </div>
            <div>
              <p className="font-mono text-xs font-semibold text-foreground mb-1">utm_medium</p>
              <p className="text-xs text-muted-foreground">Additional tracking (e.g., button_color, ad_version)</p>
            </div>
            <div>
              <p className="font-mono text-xs font-semibold text-foreground mb-1">utm_term</p>
              <p className="text-xs text-muted-foreground">Search keywords (primarily for PPC campaigns)</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm font-semibold text-foreground mb-2">Example URL:</p>
            <pre className="bg-secondary border border-border p-3 overflow-x-auto text-xs leading-5 font-mono rounded">
{`https://example.com/?utm_source=google&utm_medium=cpc&utm_campaign=summer_sale&utm_content=blue_button`}
            </pre>
          </div>
        </div>
      ),
    },
    {
      number: 4,
      title: 'Verify Tracking is Working',
      description: 'Confirm that events are being captured correctly.',
      content: (
        <div className="space-y-4">
          <ol className="text-sm text-muted-foreground space-y-3 list-decimal pl-5">
            <li>Open your website in a browser</li>
            <li>Open developer tools (F12) and go to the <span className="font-mono bg-secondary px-1 rounded">Network</span> tab</li>
            <li>Filter by "api/ping" to see tracking requests</li>
            <li>Navigate to different pages and verify POST requests appear</li>
            <li>Check your dashboard — new page views should appear within 1-2 minutes</li>
          </ol>

          <div className="bg-blue-950/20 border border-blue-500/30 rounded p-3 mt-4">
            <p className="text-xs text-blue-200">
              💡 <span className="font-semibold">Pro tip:</span> If no requests appear in Network, check that your browser isn't blocking third-party requests or has tracking prevention enabled.
            </p>
          </div>
        </div>
      ),
    },
    {
      number: 5,
      title: 'Data Collection Details',
      description: 'Understand what data is automatically collected.',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-3">
            The Pulse tracker automatically captures the following:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="border border-border/50 rounded p-3 bg-card/50">
              <p className="text-xs font-semibold text-foreground mb-2">Page Data</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Page URL & path</li>
                <li>• Page title</li>
                <li>• Referrer</li>
                <li>• Scroll depth</li>
              </ul>
            </div>
            
            <div className="border border-border/50 rounded p-3 bg-card/50">
              <p className="text-xs font-semibold text-foreground mb-2">Device & Browser</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Device type (mobile, desktop, tablet)</li>
                <li>• Browser & version</li>
                <li>• Operating system</li>
                <li>• Screen resolution</li>
              </ul>
            </div>
            
            <div className="border border-border/50 rounded p-3 bg-card/50">
              <p className="text-xs font-semibold text-foreground mb-2">Performance Metrics</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Page load time</li>
                <li>• DOM interactive time</li>
                <li>• First paint & FCP</li>
                <li>• Bounce detection</li>
              </ul>
            </div>
            
            <div className="border border-border/50 rounded p-3 bg-card/50">
              <p className="text-xs font-semibold text-foreground mb-2">Geo & Network</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Country & city</li>
                <li>• Timezone</li>
                <li>• Connection type</li>
                <li>• Language</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: 6,
      title: 'Best Practices',
      description: 'Tips for getting the most from your analytics.',
      content: (
        <div className="space-y-3">
          <div className="flex gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">Use UTM parameters consistently</p>
              <p className="text-xs text-muted-foreground">Establish naming conventions so you can easily segment traffic sources</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">Track important pages</p>
              <p className="text-xs text-muted-foreground">Focus on key conversion pages (pricing, signup, checkout)</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">Monitor bounce rate</p>
              <p className="text-xs text-muted-foreground">High bounce rates may indicate content-traffic mismatch</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">Check device breakdown</p>
              <p className="text-xs text-muted-foreground">Ensure your site is optimized for your visitors' devices</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">Review geography data</p>
              <p className="text-xs text-muted-foreground">Identify where your audience is coming from</p>
            </div>
          </div>
        </div>
      ),
    },
  ];

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
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs font-mono">Back</span>
            </Link>
            <span className="w-px h-6 bg-border" />
            <h1 className="text-sm font-mono text-muted-foreground">Setup Guide</h1>
          </div>
          <ModeToggle />
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full px-6 lg:px-12 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p className="label mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Setup & Configuration
          </p>
          <h1 className="display-lg mb-4">
            Get started with <span className="font-serif italic">Pulse Analytics</span>
          </h1>
          <p className="text-muted-foreground mb-12">
            Follow this guide to install tracking on your site and start collecting analytics data with UTM campaign tracking.
          </p>

          <div className="space-y-8">
            {steps.map((step, idx) => (
              <motion.section
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="border border-border bg-card p-6 rounded"
              >
                {/* Step Header */}
                <div className="flex gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center flex-shrink-0">
                    <span className="font-semibold text-sm">{step.number}</span>
                  </div>
                  <div>
                    <h2 className="heading text-lg">{step.title}</h2>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>

                {/* Step Content */}
                <div className="ml-14">
                  {step.content}
                </div>
              </motion.section>
            ))}
          </div>

          {/* CTAs */}
          <div className="mt-16 p-8 border border-border/50 bg-secondary/30 rounded flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="heading mb-2">Ready to start tracking?</h3>
              <p className="text-sm text-muted-foreground">
                Create a new site dashboard and copy the tracking code to get started.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/sites/new"
                className="bg-foreground text-background px-5 py-3 text-sm font-mono hover:opacity-90 transition-opacity whitespace-nowrap rounded"
              >
                New Site →
              </Link>
              <Link
                href="/dashboard"
                className="border border-border px-5 py-3 text-sm font-mono text-muted-foreground hover:text-foreground hover:border-foreground transition-colors whitespace-nowrap rounded"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </motion.div>
      </main>

      <AppFooter />
    </div>
  );
}
