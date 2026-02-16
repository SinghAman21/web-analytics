'use client';

import { motion } from 'framer-motion';

const topPages = [
  { path: '/', views: 12847, bounce: 32 },
  { path: '/pricing', views: 8234, bounce: 28 },
  { path: '/features', views: 6521, bounce: 41 },
  { path: '/blog/ai-trends', views: 4892, bounce: 22 },
  { path: '/contact', views: 3156, bounce: 55 },
];

const deviceData = [
  { name: 'Desktop', value: 58 },
  { name: 'Mobile', value: 35 },
  { name: 'Tablet', value: 7 },
];

export default function MetricsGrid() {
  return (
    <section>
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="flex items-end justify-between mb-12"
      >
        <div>
          <p className="label mb-2">Performance</p>
          <h2 className="display-lg">
            <span className="font-serif italic">Top</span> pages
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">Last 7 days</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Top Pages */}
        <div className="lg:col-span-2 space-y-0">
          {/* Header row */}
          <div className="grid grid-cols-12 gap-4 pb-4 border-b border-border">
            <span className="col-span-1 text-xs text-muted-foreground">#</span>
            <span className="col-span-5 text-xs text-muted-foreground">Page</span>
            <span className="col-span-3 text-xs text-muted-foreground text-right">Views</span>
            <span className="col-span-3 text-xs text-muted-foreground text-right">Bounce</span>
          </div>

          {topPages.map((page, i) => (
            <motion.div
              key={page.path}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="grid grid-cols-12 gap-4 py-5 border-b border-border group hover:bg-secondary/30 transition-colors -mx-4 px-4"
            >
              <span className="col-span-1 font-mono text-sm text-muted-foreground">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="col-span-5 font-mono text-sm group-hover:text-accent transition-colors">
                {page.path}
              </span>
              <span className="col-span-3 font-mono text-sm text-right tabular-nums">
                {page.views.toLocaleString()}
              </span>
              <span className={`col-span-3 font-mono text-sm text-right tabular-nums ${
                page.bounce < 35 ? 'text-success' : 
                page.bounce < 45 ? 'text-muted-foreground' : 
                'text-destructive'
              }`}>
                {page.bounce}%
              </span>
            </motion.div>
          ))}
        </div>

        {/* Device Distribution */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="editorial-card p-8"
        >
          <p className="label mb-8">By Device</p>
          
          <div className="space-y-8">
            {deviceData.map((device, i) => (
              <div key={device.name}>
                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-sm">{device.name}</span>
                  <span className="font-mono text-2xl font-light tabular-nums">
                    {device.value}%
                  </span>
                </div>
                <div className="h-1 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-foreground rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${device.value}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="divider my-8" />

          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Countries active</span>
            <span className="font-mono text-lg">45</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
