'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export interface DailyDataItem {
  date: string;
  views: number;
  day: number;
  dayName: string;
  monthName: string;
  year: number;
}

interface DailyChartProps {
  data: DailyDataItem[];
  maxViews: number;
  monthYear: string;
}

export function DailyChart({ data, maxViews, monthYear }: DailyChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="min-h-[300px] flex items-center justify-center text-muted-foreground text-sm">
        No data available
      </div>
    );
  }

  const chartHeight = 240; // px
  const barMinHeight = 4; // px, minimum visible height

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-4"
    >
      {/* Chart bars */}
      <div className="flex items-end gap-1 min-h-[300px] relative group">
        {data.map((item, i) => {
          const percentage = (item.views / maxViews) * 100;
          const barHeight = Math.max(barMinHeight, (percentage / 100) * chartHeight);
          const isHovered = hoveredIndex === i;

          return (
            <motion.div
              key={i}
              className="flex-1 flex flex-col items-center relative min-w-0 group/bar"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02, duration: 0.3 }}
            >
              {/* Bar container */}
              <div className="w-full h-[300px] flex items-end justify-center relative">
                {/* Tooltip */}
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={isHovered ? { opacity: 1, y: -4 } : { opacity: 0, y: 5 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-full bg-foreground text-background px-3 py-1.5 rounded text-xs font-mono whitespace-nowrap pointer-events-none z-10"
                >
                  <div className="font-semibold">{item.views} views</div>
                  <div className="text-[10px] opacity-80">
                    {new Date(item.date).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </div>
                </motion.div>

                {/* Bar itself */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${barHeight}px` }}
                  transition={{
                    delay: i * 0.02,
                    duration: 0.5,
                    ease: 'easeOut',
                  }}
                  whileHover={{ scale: 1.05, originY: 'bottom' }}
                  className={`w-full rounded-t-sm cursor-pointer transition-all duration-200 ${
                    isHovered
                      ? 'bg-foreground shadow-lg'
                      : 'bg-foreground/60 hover:bg-foreground/75'
                  }`}
                  style={{
                    boxShadow: isHovered
                      ? '0 0 12px rgba(var(--foreground-rgb), 0.3)'
                      : 'none',
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Day labels */}
      <div className="flex items-center gap-1">
        {data.map((item, i) => (
          <motion.div
            key={i}
            className="flex-1 flex flex-col items-center text-center min-w-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.02 + 0.3, duration: 0.3 }}
          >
            <span className="text-[11px] font-mono font-semibold text-foreground">
              {item.day}
            </span>
            <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">
              {item.dayName}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
