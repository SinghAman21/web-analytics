'use client';

import { motion } from 'framer-motion';

const stats = [
  { value: '2,847', label: 'Live Users', suffix: '' },
  { value: '12,459', label: 'Revenue Today', suffix: '$', prefix: true },
  { value: '3.82', label: 'Conversion', suffix: '%' },
  { value: '4:32', label: 'Avg. Session', suffix: '' },
];

export default function StatsRow() {
  return (
    <section className="border-y border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className={`py-12 ${i < stats.length - 1 ? 'lg:border-r border-border' : ''} ${i % 2 === 0 ? 'border-r lg:border-r border-border' : ''}`}
            >
              <div className="px-4 lg:px-8">
                <p className="stat-value">
                  {stat.prefix && stat.suffix}
                  {stat.value}
                  {!stat.prefix && stat.suffix}
                </p>
                <p className="stat-label">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
