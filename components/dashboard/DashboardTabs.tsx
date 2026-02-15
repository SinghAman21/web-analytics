'use client';

import { useState } from 'react';
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
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-border mb-12"
      >
        <div className="h-auto p-0 bg-transparent rounded-none gap-0 flex">
          {tabs.map((tab, i) => (
            <div key={tab.id} className="relative">
              <button
                onClick={() => setActiveTab(tab.id)}
                className="relative px-6 py-4 text-sm font-mono rounded-none bg-transparent hover:bg-transparent text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-0 border-0"
                style={{
                  color: activeTab === tab.id ? 'var(--foreground)' : 'var(--muted-foreground)',
                }}
              >
                {tab.label}
              </button>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="underline"
                  className="absolute bottom-0 left-1/2 h-px bg-foreground"
                  initial={{ width: 0, marginLeft: 0 }}
                  animate={{ width: '100%', marginLeft: '-50%' }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </div>
          ))}
        </div>
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
