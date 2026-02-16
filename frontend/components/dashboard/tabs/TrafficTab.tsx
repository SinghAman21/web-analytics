'use client';

import { motion } from 'framer-motion';

const trafficSources = [
  { source: 'Organic Search', visitors: 48234, percentage: 42, trend: '+15.2%' },
  { source: 'Direct', visitors: 28156, percentage: 24, trend: '+8.4%' },
  { source: 'Social Media', visitors: 18947, percentage: 16, trend: '+22.1%' },
  { source: 'Referral', visitors: 12834, percentage: 11, trend: '-2.3%' },
  { source: 'Email', visitors: 8123, percentage: 7, trend: '+5.7%' },
];

const topReferrers = [
  { domain: 'twitter.com', visits: 8234, bounce: 28 },
  { domain: 'linkedin.com', visits: 6521, bounce: 32 },
  { domain: 'producthunt.com', visits: 4892, bounce: 22 },
  { domain: 'reddit.com', visits: 3156, bounce: 45 },
  { domain: 'hackernews.com', visits: 2847, bounce: 18 },
];

const geographicData = [
  { country: 'United States', visitors: 42847, percentage: 38 },
  { country: 'United Kingdom', visitors: 18234, percentage: 16 },
  { country: 'Germany', visitors: 12521, percentage: 11 },
  { country: 'France', visitors: 8892, percentage: 8 },
  { country: 'Canada', visitors: 7156, percentage: 6 },
  { country: 'Other', visitors: 23584, percentage: 21 },
];

const searchTerms = [
  { term: 'web analytics dashboard', clicks: 2847, position: 3.2 },
  { term: 'real-time analytics', clicks: 1892, position: 5.1 },
  { term: 'conversion tracking tool', clicks: 1456, position: 4.8 },
  { term: 'user behavior analytics', clicks: 1123, position: 7.2 },
  { term: 'funnel analysis software', clicks: 892, position: 6.4 },
];

export default function TrafficTab() {
  return (
    <div className="space-y-24">
      {/* Traffic Sources */}
      <section>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <p className="label mb-2">Acquisition</p>
            <h2 className="display-lg">
              <span className="font-serif italic">Traffic</span> sources
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">Last 30 days</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Source breakdown */}
          <div className="space-y-6">
            {trafficSources.map((source, i) => (
              <motion.div
                key={source.source}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-sm">{source.source}</span>
                  <div className="flex items-baseline gap-4">
                    <span className="font-mono text-sm tabular-nums">
                      {source.visitors.toLocaleString()}
                    </span>
                    <span className={`font-mono text-xs tabular-nums w-16 text-right ${
                      source.trend.startsWith('+') ? 'text-success' : 'text-destructive'
                    }`}>
                      {source.trend}
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-secondary rounded-sm overflow-hidden">
                  <motion.div
                    className="h-full bg-foreground rounded-sm"
                    initial={{ width: 0 }}
                    animate={{ width: `${source.percentage}%` }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Geographic Distribution */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="editorial-card p-8"
          >
            <p className="label mb-8">By Country</p>
            
            <div className="space-y-4">
              {geographicData.map((country, i) => (
                <div key={country.country} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs text-muted-foreground w-6">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm">{country.country}</span>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <span className="font-mono text-sm tabular-nums">
                      {country.visitors.toLocaleString()}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground w-8 text-right">
                      {country.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Referrers & Search */}
      <section className="grid lg:grid-cols-2 gap-12">
        {/* Top Referrers */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="mb-8">
            <p className="label mb-2">Inbound</p>
            <h3 className="text-2xl font-serif italic">Top referrers</h3>
          </div>

          <div className="space-y-0">
            <div className="grid grid-cols-12 gap-4 pb-4 border-b border-border">
              <span className="col-span-1 text-xs text-muted-foreground">#</span>
              <span className="col-span-5 text-xs text-muted-foreground">Domain</span>
              <span className="col-span-3 text-xs text-muted-foreground text-right">Visits</span>
              <span className="col-span-3 text-xs text-muted-foreground text-right">Bounce</span>
            </div>

            {topReferrers.map((referrer, i) => (
              <motion.div
                key={referrer.domain}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="grid grid-cols-12 gap-4 py-4 border-b border-border hover:bg-secondary/30 transition-colors -mx-4 px-4"
              >
                <span className="col-span-1 font-mono text-sm text-muted-foreground">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="col-span-5 font-mono text-sm">
                  {referrer.domain}
                </span>
                <span className="col-span-3 font-mono text-sm text-right tabular-nums">
                  {referrer.visits.toLocaleString()}
                </span>
                <span className={`col-span-3 font-mono text-sm text-right tabular-nums ${
                  referrer.bounce < 30 ? 'text-success' : 
                  referrer.bounce < 40 ? 'text-muted-foreground' : 
                  'text-destructive'
                }`}>
                  {referrer.bounce}%
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Search Terms */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mb-8">
            <p className="label mb-2">Organic</p>
            <h3 className="text-2xl font-serif italic">Search terms</h3>
          </div>

          <div className="space-y-0">
            <div className="grid grid-cols-12 gap-4 pb-4 border-b border-border">
              <span className="col-span-6 text-xs text-muted-foreground">Keyword</span>
              <span className="col-span-3 text-xs text-muted-foreground text-right">Clicks</span>
              <span className="col-span-3 text-xs text-muted-foreground text-right">Avg. Pos</span>
            </div>

            {searchTerms.map((term, i) => (
              <motion.div
                key={term.term}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="grid grid-cols-12 gap-4 py-4 border-b border-border hover:bg-secondary/30 transition-colors -mx-4 px-4"
              >
                <span className="col-span-6 text-sm truncate">
                  {term.term}
                </span>
                <span className="col-span-3 font-mono text-sm text-right tabular-nums">
                  {term.clicks.toLocaleString()}
                </span>
                <span className={`col-span-3 font-mono text-sm text-right tabular-nums ${
                  term.position < 5 ? 'text-success' : 'text-muted-foreground'
                }`}>
                  #{term.position.toFixed(1)}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
