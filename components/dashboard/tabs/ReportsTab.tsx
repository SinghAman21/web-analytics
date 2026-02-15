'use client';

import { motion } from 'framer-motion';
import { Download, Calendar, FileText, BarChart3, Users, TrendingUp } from 'lucide-react';

const savedReports = [
  { 
    name: 'Weekly Performance Summary', 
    type: 'Automated', 
    lastRun: '2 hours ago',
    frequency: 'Weekly',
    icon: BarChart3
  },
  { 
    name: 'Monthly Traffic Analysis', 
    type: 'Automated', 
    lastRun: '3 days ago',
    frequency: 'Monthly',
    icon: TrendingUp
  },
  { 
    name: 'User Behavior Report', 
    type: 'Manual', 
    lastRun: '1 week ago',
    frequency: 'On demand',
    icon: Users
  },
  { 
    name: 'Conversion Funnel Deep Dive', 
    type: 'Manual', 
    lastRun: '2 weeks ago',
    frequency: 'On demand',
    icon: FileText
  },
];

const exportFormats = [
  { format: 'CSV', description: 'Spreadsheet compatible data export' },
  { format: 'PDF', description: 'Formatted report with charts' },
  { format: 'JSON', description: 'Raw data for API integration' },
  { format: 'PNG', description: 'Chart images for presentations' },
];

const scheduledReports = [
  { name: 'Executive Summary', recipients: 3, nextRun: 'Mon, 9:00 AM', status: 'active' },
  { name: 'Marketing Metrics', recipients: 5, nextRun: 'Fri, 6:00 PM', status: 'active' },
  { name: 'Product Analytics', recipients: 2, nextRun: 'Daily, 8:00 AM', status: 'paused' },
];

const dateRanges = ['Today', 'Yesterday', 'Last 7 days', 'Last 30 days', 'Last 90 days', 'Custom'];

export default function ReportsTab() {
  return (
    <div className="space-y-24">
      {/* Quick Export */}
      <section>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <p className="label mb-2">Export</p>
            <h2 className="display-lg">
              <span className="font-serif italic">Quick</span> reports
            </h2>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Date Range Selector */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="editorial-card p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <p className="label">Date Range</p>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {dateRanges.map((range, i) => (
                <button
                  key={range}
                  className={`px-4 py-3 text-sm font-mono transition-colors border ${
                    i === 2 
                      ? 'bg-foreground text-background border-foreground' 
                      : 'border-border hover:border-muted-foreground text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            <div className="divider my-8" />

            <p className="text-sm text-muted-foreground mb-4">Selected: Jan 20 – Jan 26, 2026</p>
            <p className="font-mono text-2xl tabular-nums">847,234 events</p>
          </motion.div>

          {/* Export Formats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="editorial-card p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Download className="w-4 h-4 text-muted-foreground" />
              <p className="label">Export Format</p>
            </div>
            
            <div className="space-y-3">
              {exportFormats.map((format, i) => (
                <button
                  key={format.format}
                  className={`w-full flex items-center justify-between px-4 py-4 transition-colors border ${
                    i === 0 
                      ? 'bg-secondary border-border' 
                      : 'border-border hover:bg-secondary/50'
                  }`}
                >
                  <div className="text-left">
                    <p className="text-sm font-mono">{format.format}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{format.description}</p>
                  </div>
                  <Download className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Saved Reports */}
      {/* <section>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <p className="label mb-2">Library</p>
          <h3 className="text-2xl font-serif italic">Saved reports</h3>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {savedReports.map((report, i) => (
            <motion.div
              key={report.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="editorial-card-hover p-6 cursor-pointer group"
            >
              <report.icon className="w-5 h-5 text-muted-foreground mb-4 group-hover:text-foreground transition-colors" />
              <h4 className="text-sm font-medium mb-2">{report.name}</h4>
              <p className="text-xs text-muted-foreground mb-4">{report.frequency}</p>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className={`text-xs px-2 py-1 ${
                  report.type === 'Automated' ? 'bg-success/20 text-success' : 'bg-secondary text-muted-foreground'
                }`}>
                  {report.type}
                </span>
                <span className="text-xs text-muted-foreground">{report.lastRun}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section> */}

      {/* Scheduled Reports */}
      {/* <section>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <p className="label mb-2">Automation</p>
          <h3 className="text-2xl font-serif italic">Scheduled delivery</h3>
        </motion.div>

        <div className="space-y-0">
          <div className="grid grid-cols-12 gap-4 pb-4 border-b border-border">
            <span className="col-span-4 text-xs text-muted-foreground">Report Name</span>
            <span className="col-span-2 text-xs text-muted-foreground text-center">Recipients</span>
            <span className="col-span-3 text-xs text-muted-foreground">Next Run</span>
            <span className="col-span-2 text-xs text-muted-foreground text-center">Status</span>
            <span className="col-span-1 text-xs text-muted-foreground text-right">Action</span>
          </div>

          {scheduledReports.map((report, i) => (
            <motion.div
              key={report.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="grid grid-cols-12 gap-4 py-5 border-b border-border hover:bg-secondary/30 transition-colors -mx-4 px-4 items-center"
            >
              <span className="col-span-4 text-sm">{report.name}</span>
              <span className="col-span-2 font-mono text-sm text-center tabular-nums">
                {report.recipients}
              </span>
              <span className="col-span-3 font-mono text-xs text-muted-foreground">
                {report.nextRun}
              </span>
              <span className="col-span-2 text-center">
                <span className={`text-xs px-2 py-1 ${
                  report.status === 'active' 
                    ? 'bg-success/20 text-success' 
                    : 'bg-warning/20 text-warning'
                }`}>
                  {report.status}
                </span>
              </span>
              <span className="col-span-1 text-right">
                <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Edit
                </button>
              </span>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <button className="px-6 py-3 text-sm font-mono border border-border hover:bg-secondary transition-colors">
            + Create new scheduled report
          </button>
        </motion.div>
      </section> */}
    </div>
  );
}
