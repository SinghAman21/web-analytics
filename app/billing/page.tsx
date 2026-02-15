'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Public dashboards for small projects',
    features: ['Public analytics dashboard', '1 site', '30-day data retention', 'Basic metrics', 'Embed widget'],
    current: true,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/mo',
    description: 'Full analytics suite for growing teams',
    features: ['Private dashboards', 'Unlimited sites', '2-year data retention', 'Live user tracking', 'Heatmaps & funnels', 'Geo maps & city-level data', 'Full UTM breakdown', 'Priority support'],
    current: false,
    highlight: true,
  },
];

export default function Billing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6 flex items-center gap-6">
          <Link href="/" className="font-serif text-2xl italic tracking-tight hover:opacity-70 transition-opacity">Pulse</Link>
          <span className="w-px h-6 bg-border" />
          <h1 className="text-sm font-mono text-muted-foreground">Billing</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 lg:px-12 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="label mb-4">Plans</p>
          <h2 className="display-lg mb-4">
            Choose your <span className="font-serif italic">plan</span>
          </h2>
          <p className="text-muted-foreground mb-16 text-lg">Privacy-first analytics at every scale</p>

          <div className="grid md:grid-cols-2 gap-8">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className={`editorial-card p-8 flex flex-col ${plan.highlight ? 'border-accent/50 ring-1 ring-accent/20' : ''}`}
              >
                <div className="mb-8">
                  <p className="label mb-2">{plan.current ? 'Current Plan' : 'Recommended'}</p>
                  <h3 className="text-3xl font-serif italic mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <span className="text-5xl font-mono font-light tabular-nums">{plan.price}</span>
                  <span className="text-muted-foreground text-sm ml-1">{plan.period}</span>
                </div>

                <div className="space-y-3 flex-1 mb-8">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-success flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  className={`w-full py-3 text-sm font-mono transition-opacity ${
                    plan.current
                      ? 'border border-border text-muted-foreground cursor-default'
                      : 'bg-foreground text-background hover:opacity-90'
                  }`}
                  disabled={plan.current}
                >
                  {plan.current ? 'Current Plan' : 'Upgrade Instantly'}
                </button>
              </motion.div>
            ))}
          </div>

          {/* Current billing info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-16 pt-8 border-t border-border"
          >
            <p className="label mb-4">Billing Details</p>
            <div className="grid grid-cols-3 gap-8">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Current plan</p>
                <p className="font-mono text-sm">Free</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Sites tracked</p>
                <p className="font-mono text-sm">1 / 1</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Data retention</p>
                <p className="font-mono text-sm">30 days</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}