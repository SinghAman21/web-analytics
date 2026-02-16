'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

const funnels = [
  {
    id: 'signup',
    name: 'Signup Flow',
    steps: [
      { name: 'Landing Page', users: 24847, dropoff: 0 },
      { name: 'View Pricing', users: 18234, dropoff: 26.6 },
      { name: 'Start Signup', users: 8521, dropoff: 53.3 },
      { name: 'Complete Signup', users: 4892, dropoff: 42.6 },
      { name: 'Verified Email', users: 3156, dropoff: 35.5 },
    ],
  },
  {
    id: 'purchase',
    name: 'Purchase Flow',
    steps: [
      { name: 'View Product', users: 18234, dropoff: 0 },
      { name: 'Add to Cart', users: 8521, dropoff: 53.3 },
      { name: 'Begin Checkout', users: 4892, dropoff: 42.6 },
      { name: 'Payment Info', users: 2847, dropoff: 41.8 },
      { name: 'Complete Purchase', users: 1892, dropoff: 33.5 },
    ],
  },
  {
    id: 'onboarding',
    name: 'Onboarding',
    steps: [
      { name: 'Account Created', users: 4892, dropoff: 0 },
      { name: 'Profile Setup', users: 3847, dropoff: 21.4 },
      { name: 'First Action', users: 2521, dropoff: 34.5 },
      { name: 'Completed Tutorial', users: 1892, dropoff: 25.0 },
    ],
  },
];

const userJourneys = [
  { path: 'Home → Pricing → Features → Signup', users: 2847, conversion: '42%' },
  { path: 'Blog → Pricing → Signup', users: 1892, conversion: '38%' },
  { path: 'Home → Features → Demo → Signup', users: 1456, conversion: '55%' },
  { path: 'Direct → Pricing → Signup', users: 1123, conversion: '31%' },
  { path: 'Referral → Home → Signup', users: 892, conversion: '48%' },
];

export default function FunnelsTab() {
  const [selectedFunnel, setSelectedFunnel] = useState('signup');
  const activeFunnel = funnels.find(f => f.id === selectedFunnel) || funnels[0];
  const maxUsers = activeFunnel.steps[0].users;

  return (
    <div className="space-y-24">
      {/* Funnel Analysis */}
      <section>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <p className="label mb-2">Analysis</p>
            <h2 className="display-lg">
              <span className="font-serif italic">Funnel</span> breakdown
            </h2>
          </div>
          
          {/* Funnel selector */}
          <div className="flex gap-1">
            {funnels.map((funnel) => (
              <button
                key={funnel.id}
                onClick={() => setSelectedFunnel(funnel.id)}
                className={`px-4 py-2 text-xs font-mono transition-colors ${
                  selectedFunnel === funnel.id
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground border border-border'
                }`}
              >
                {funnel.name}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Funnel visualization */}
          <div className="lg:col-span-2">
            <motion.div
              key={selectedFunnel}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {activeFunnel.steps.map((step, i) => {
                const percentage = (step.users / maxUsers) * 100;
                const isLast = i === activeFunnel.steps.length - 1;

                return (
                  <div key={step.name}>
                    <div className="flex items-center gap-4 mb-2">
                      <span className="font-mono text-xs text-muted-foreground w-6">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-sm flex-1">{step.name}</span>
                      <span className="font-mono text-sm tabular-nums">
                        {step.users.toLocaleString()}
                      </span>
                      {step.dropoff > 0 && (
                        <span className="font-mono text-xs text-destructive tabular-nums w-16 text-right">
                          -{step.dropoff}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="w-6" />
                      <div className="flex-1 h-10 bg-secondary rounded-sm overflow-hidden">
                        <motion.div
                          className={`h-full rounded-sm ${isLast ? 'bg-success' : 'bg-foreground'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: 0.2 + i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>
                      <span className="font-mono text-xs text-muted-foreground tabular-nums w-16 text-right">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </motion.div>

            {/* Funnel summary */}
            <motion.div
              key={`${selectedFunnel}-summary`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 pt-8 border-t border-border flex items-baseline justify-between"
            >
              <span className="text-sm text-muted-foreground">Overall conversion rate</span>
              <span className="font-mono text-4xl font-light tabular-nums">
                {((activeFunnel.steps[activeFunnel.steps.length - 1].users / maxUsers) * 100).toFixed(1)}%
              </span>
            </motion.div>
          </div>

          {/* Funnel metrics */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="editorial-card p-8"
          >
            <p className="label mb-8">Funnel Metrics</p>
            
            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total entries</p>
                <p className="font-mono text-2xl tabular-nums">{maxUsers.toLocaleString()}</p>
              </div>
              <div className="divider" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Completions</p>
                <p className="font-mono text-2xl tabular-nums">
                  {activeFunnel.steps[activeFunnel.steps.length - 1].users.toLocaleString()}
                </p>
              </div>
              <div className="divider" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg. time to complete</p>
                <p className="font-mono text-2xl tabular-nums">4:32</p>
              </div>
              <div className="divider" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Biggest dropoff</p>
                <p className="text-sm">{activeFunnel.steps.reduce((max, step) => step.dropoff > max.dropoff ? step : max, activeFunnel.steps[0]).name}</p>
                <p className="font-mono text-lg text-destructive tabular-nums">
                  -{activeFunnel.steps.reduce((max, step) => step.dropoff > max.dropoff ? step : max, activeFunnel.steps[0]).dropoff}%
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* User Journeys */}
      <section>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <p className="label mb-2">Paths</p>
          <h3 className="text-2xl font-serif italic">Top user journeys</h3>
        </motion.div>

        <div className="space-y-0">
          <div className="grid grid-cols-12 gap-4 pb-4 border-b border-border">
            <span className="col-span-1 text-xs text-muted-foreground">#</span>
            <span className="col-span-7 text-xs text-muted-foreground">Journey Path</span>
            <span className="col-span-2 text-xs text-muted-foreground text-right">Users</span>
            <span className="col-span-2 text-xs text-muted-foreground text-right">Conv.</span>
          </div>

          {userJourneys.map((journey, i) => (
            <motion.div
              key={journey.path}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="grid grid-cols-12 gap-4 py-5 border-b border-border hover:bg-secondary/30 transition-colors -mx-4 px-4"
            >
              <span className="col-span-1 font-mono text-sm text-muted-foreground">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="col-span-7 font-mono text-sm">
                {journey.path}
              </span>
              <span className="col-span-2 font-mono text-sm text-right tabular-nums">
                {journey.users.toLocaleString()}
              </span>
              <span className="col-span-2 font-mono text-sm text-right tabular-nums text-success">
                {journey.conversion}
              </span>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
