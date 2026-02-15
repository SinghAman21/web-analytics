'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

const funnelData = {
  '7d': [
    { stage: 'Visitors', count: 24847 },
    { stage: 'Signups', count: 8234 },
    { stage: 'Activated', count: 4521 },
    { stage: 'Subscribed', count: 1892 },
  ],
  '30d': [
    { stage: 'Visitors', count: 98234 },
    { stage: 'Signups', count: 31247 },
    { stage: 'Activated', count: 18921 },
    { stage: 'Subscribed', count: 8456 },
  ],
};

type Period = '7d' | '30d';

export default function FunnelChart() {
  const [period, setPeriod] = useState<Period>('7d');
  const data = funnelData[period];
  const maxCount = data[0].count;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <p className="label mb-2">Conversion</p>
          <h3 className="text-2xl font-serif italic">Funnel</h3>
        </div>
        <div className="flex gap-1">
          {(['7d', '30d'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-mono transition-colors ${
                period === p
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {data.map((step, i) => {
          const percentage = (step.count / maxCount) * 100;
          const conversionRate = ((step.count / maxCount) * 100).toFixed(1);

          return (
            <motion.div
              key={`${period}-${step.stage}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm">{step.stage}</span>
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-sm tabular-nums">
                    {step.count.toLocaleString()}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground tabular-nums w-12 text-right">
                    {conversionRate}%
                  </span>
                </div>
              </div>
              <div className="h-2 bg-secondary rounded-sm overflow-hidden">
                <motion.div
                  className="h-full bg-foreground rounded-sm"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="divider my-8" />

      <div className="flex items-baseline justify-between">
        <span className="text-sm text-muted-foreground">Overall conversion</span>
        <motion.span
          key={period}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-mono text-3xl font-light tabular-nums"
        >
          {((data[data.length - 1].count / data[0].count) * 100).toFixed(1)}%
        </motion.span>
      </div>
    </motion.section>
  );
}
