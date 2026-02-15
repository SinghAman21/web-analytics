'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AnalyticsDashboard from '@/components/analytics-skeleton';
import GeoDashboard from '@/components/geo-skeleton';

// Import your existing components
// For now, creating placeholders

// function AnalyticsView({ siteId }: { siteId: string }) {
//   return (
//     <div>
//       {/* <h2 className="text-2xl font-bold mb-4">Overview for {siteId}</h2>
//       <p className="text-muted-foreground">Main dashboard metrics and stats</p> */}
//       <AnalyticsDashboard />
//     </div>
//   );
// }


// function GeoView({ siteId }: { siteId: string }) {
//   return (
//     <div>
//       {/* <h2 className="text-2xl font-bold mb-4">Geography for {siteId}</h2>
//       <p className="text-muted-foreground">Location-based analytics</p> */}
//       <GeoDashboard />
//     </div>
//   );
// }

export default function SiteDashboard() {
  const params = useParams();
  const searchParams = useSearchParams();
  const siteId = params.siteId as string;
  const view = searchParams.get('view') || 'analytics';


  return (
    <div className="min-h-screen bg-background">

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {view === 'geo' ? <GeoDashboard siteId={siteId} /> : <AnalyticsDashboard siteId={siteId} />}
        </motion.div>
      </main>
    </div>
  );
}
