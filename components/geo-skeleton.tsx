import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';


const countries = [
  { name: 'India', percentage: 45, visitors: 4021 },
  { name: 'United States', percentage: 23, visitors: 2057 },
  { name: 'Germany', percentage: 12, visitors: 1073 },
  { name: 'United Kingdom', percentage: 8, visitors: 715 },
  { name: 'France', percentage: 5, visitors: 447 },
  { name: 'Canada', percentage: 4, visitors: 358 },
  { name: 'Other', percentage: 3, visitors: 268 },
];

export default function GeoDashboard({ siteId }: { siteId: string }) {
  // const { siteId } = useParams();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6 flex items-center gap-6">
          <Link href="/" className="font-serif text-2xl italic tracking-tight hover:opacity-70 transition-opacity">Pulse</Link>
          <span className="w-px h-6 bg-border" />
          <Link href="/dashboard" className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
          <span className="text-muted-foreground">/</span>
          <Link href={`/dashboard/${siteId}`} className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors">{siteId}</Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-mono">Geo</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 lg:px-12 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="label mb-4">Geography</p>
          <h1 className="display-lg mb-16">
            Where are your <span className="font-serif italic">users?</span>
          </h1>

          {/* World Map Placeholder */}
          <div className="editorial-card p-8 mb-16">
            <div className="aspect-[2/1] bg-secondary/50 border border-border flex items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground text-sm mb-2">World Map Visualization</p>
                <p className="text-xs text-muted-foreground font-mono">Interactive map with visitor density</p>
              </div>
            </div>
          </div>

          {/* Country Breakdown */}
          <section>
            <p className="label mb-8">By Country</p>
            <div className="space-y-5">
              {countries.map((country, i) => (
                <motion.div
                  key={country.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="flex items-baseline justify-between mb-2">
                    <div className="flex items-baseline gap-4">
                      <span className="font-mono text-xs text-muted-foreground w-6">{String(i + 1).padStart(2, '0')}</span>
                      <span className="text-sm">{country.name}</span>
                    </div>
                    <div className="flex items-baseline gap-4">
                      <span className="font-mono text-sm tabular-nums">{country.visitors.toLocaleString()}</span>
                      <span className="font-mono text-xs text-muted-foreground w-8 text-right">{country.percentage}%</span>
                    </div>
                  </div>
                  <div className="ml-10 h-2 bg-secondary rounded-sm overflow-hidden">
                    <motion.div
                      className="h-full bg-foreground rounded-sm"
                      initial={{ width: 0 }}
                      animate={{ width: `${country.percentage}%` }}
                      transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Pro teaser */}
          <div className="mt-16 editorial-card p-8 flex items-center gap-6">
            <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-sm font-medium mb-1">City-Level Data & Real-time Locations</p>
              <p className="text-xs text-muted-foreground">Available on Pro plan</p>
            </div>
            <Link href="/billing" className="ml-auto px-4 py-2 bg-foreground text-background text-xs font-mono hover:opacity-90 transition-opacity">
              Upgrade →
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
