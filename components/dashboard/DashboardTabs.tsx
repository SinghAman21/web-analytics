'use client';

import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import OverviewTab from './tabs/OverviewTab';
import TrafficTab from './tabs/TrafficTab';
import FunnelsTab from './tabs/FunnelsTab';
import ReportsTab from './tabs/ReportsTab';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'traffic', label: 'Traffic' },
  { id: 'funnels', label: 'Funnels' },
  { id: 'reports', label: 'Reports' },
];

export default function DashboardTabs() {
  return (
    <Tabs defaultValue="overview" className="w-full">
      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-border mb-12"
      >
        <TabsList className="h-auto p-0 bg-transparent rounded-none gap-0">
          {tabs.map((tab, i) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="relative px-6 py-4 text-sm font-mono rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground transition-colors after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-foreground after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-300"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </motion.div>

      {/* Tab Content */}
      <TabsContent value="overview" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
        <OverviewTab />
      </TabsContent>
      
      <TabsContent value="traffic" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
        <TrafficTab />
      </TabsContent>
      
      <TabsContent value="funnels" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
        <FunnelsTab />
      </TabsContent>
      
      <TabsContent value="reports" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
        <ReportsTab />
      </TabsContent>
    </Tabs>
  );
}
