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

/**
 * Calculate dynamic Y-axis scale based on max views
 * Returns { axisMax, step } where axisMax is the max value on Y-axis and step is the interval for gridlines
 */
function getYAxisScale(maxViews: number) {
  if (maxViews <= 0) return { axisMax: 10, step: 2 };
  if (maxViews <= 10) return { axisMax: 10, step: 2 };
  if (maxViews <= 50) return { axisMax: 50, step: 10 };
  if (maxViews <= 100) return { axisMax: 100, step: 25 };
  if (maxViews <= 500) return { axisMax: 500, step: 100 };
  if (maxViews <= 1000) return { axisMax: 1000, step: 250 };
  if (maxViews <= 5000) return { axisMax: 5000, step: 1000 };
  return { axisMax: 10000, step: 2500 };
}

function formatAxisLabel(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toString();
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
  const { axisMax, step } = getYAxisScale(maxViews);
  
  // Generate Y-axis labels
  const yAxisLabels = [];
  for (let i = 0; i <= axisMax; i += step) {
    yAxisLabels.push(i);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-1"
    >
      {/* Chart with Y-axis */}
      <div className="flex gap-2">
        {/* Y-axis labels */}
        <div className="flex flex-col justify-between items-end pr-2 w-10" style={{ height: `${chartHeight}px` }}>
          {yAxisLabels.reverse().map((label, i) => (
            <motion.span
              key={label}
              className="text-[10px] font-mono text-muted-foreground leading-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: (i + 1) * 0.05 }}
            >
              {formatAxisLabel(label)}
            </motion.span>
          ))}
        </div>

        {/* Chart bars container */}
        <div className="flex-1">
          <div className="flex items-end gap-1 relative group border-l border-b border-border pb-0" style={{ height: `${chartHeight}px` }}>
            {data.map((item, i) => {
              const barHeight = (item.views / axisMax) * chartHeight;
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
                  <div className="w-full flex flex-col items-center justify-end" style={{ height: `${chartHeight}px` }}>
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
                    {barHeight > 0 && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${barHeight}px` }}
                        transition={{
                          delay: i * 0.02,
                          duration: 0.5,
                          ease: 'easeOut',
                        }}
                        whileHover={{ scale: 1.02, originY: 'bottom' }}
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
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Day labels */}
          <div className="flex items-center gap-1 mt-4">
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
        </div>
      </div>
    </motion.div>
  );
}
