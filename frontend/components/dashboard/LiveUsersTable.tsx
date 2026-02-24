'use client';

import { motion } from 'framer-motion';

type UserStatus = 'active' | 'converting' | 'exiting';

interface LiveUser {
  id: number;
  location: string;
  path: string;
  duration: string;
  status: UserStatus;
}

const liveUsers: LiveUser[] = [
  { id: 1, location: 'San Francisco', path: '/pricing → /features', duration: '3:42', status: 'active' },
  { id: 2, location: 'London', path: '/blog', duration: '1:15', status: 'active' },
  { id: 3, location: 'Tokyo', path: '/pricing → /signup', duration: '5:08', status: 'converting' },
  { id: 4, location: 'Berlin', path: '/blog/ai-trends', duration: '8:22', status: 'active' },
  { id: 5, location: 'Sydney', path: '/contact', duration: '0:45', status: 'exiting' },
];

const statusStyles: Record<UserStatus, string> = {
  active: 'text-muted-foreground',
  converting: 'text-success',
  exiting: 'text-warning',
};

export default function LiveUsersTable() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <p className="label mb-2">Now</p>
          <h3 className="text-2xl font-serif italic">Live sessions</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="font-mono text-sm">{liveUsers.length}</span>
        </div>
      </div>

      <div className="space-y-0">
        {liveUsers.map((user, i) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between py-4 border-b border-border group hover:bg-secondary/20 transition-colors -mx-4 px-4"
          >
            <div className="flex items-center gap-6">
              <span className="text-sm w-24">{user.location}</span>
              <span className="font-mono text-xs text-muted-foreground">
                {user.path}
              </span>
            </div>
            <div className="flex items-center gap-6">
              <span className="font-mono text-sm tabular-nums">{user.duration}</span>
              <span className={`text-xs uppercase tracking-wider ${statusStyles[user.status]}`}>
                {user.status}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
