'use client';

import { motion } from 'framer-motion';
import MetricsGrid from '../MetricsGrid';
import LiveUsersTable from '../LiveUsersTable';
import FunnelChart from '../FunnelChart';

const quickStats = [
  { label: 'Page Views', value: '847.2K', change: '+12.4%', positive: true },
  { label: 'Unique Visitors', value: '124.8K', change: '+8.2%', positive: true },
  { label: 'Avg. Duration', value: '4:32', change: '-0.8%', positive: false },
  { label: 'Pages/Session', value: '3.8', change: '+5.1%', positive: true },
];

export default function OverviewTab() {
  return (
    <div className="space-y-24">
      {/* Quick Stats Grid */}
      <section>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {quickStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="editorial-card p-6"
            >
              <p className="label mb-4">{stat.label}</p>
              <p className="text-3xl font-light tracking-tight tabular-nums font-mono">
                {stat.value}
              </p>
              <p className={`text-xs font-mono mt-2 ${stat.positive ? 'text-success' : 'text-destructive'}`}>
                {stat.change} vs last period
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <MetricsGrid />
      
      <div className="grid lg:grid-cols-2 gap-12">
        <LiveUsersTable />
        <FunnelChart />
      </div>
    </div>
  );
}
