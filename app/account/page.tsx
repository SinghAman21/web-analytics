'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Account() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6 flex items-center gap-6">
          <Link href="/" className="font-serif text-2xl italic tracking-tight hover:opacity-70 transition-opacity">Pulse</Link>
          <span className="w-px h-6 bg-border" />
          <h1 className="text-sm font-mono text-muted-foreground">Account Settings</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 lg:px-12 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="label mb-4">Profile</p>
          <h2 className="display-lg mb-16">
            Account <span className="font-serif italic">settings</span>
          </h2>

          <div className="space-y-12">
            {/* Email */}
            <div className="border-b border-border pb-8">
              <label className="label mb-2 block">Email Address</label>
              <div className="flex items-center gap-4">
                <input
                  type="email"
                  defaultValue="user@company.com"
                  className="flex-1 bg-secondary border border-border px-4 py-3 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <button className="px-4 py-3 text-xs font-mono text-muted-foreground hover:text-foreground border border-border transition-colors">
                  Update
                </button>
              </div>
            </div>

            {/* Password */}
            <div className="border-b border-border pb-8">
              <label className="label mb-2 block">Password</label>
              <div className="flex items-center gap-4">
                <input
                  type="password"
                  defaultValue="••••••••"
                  className="flex-1 bg-secondary border border-border px-4 py-3 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <button className="px-4 py-3 text-xs font-mono text-muted-foreground hover:text-foreground border border-border transition-colors">
                  Change
                </button>
              </div>
            </div>

            {/* Connected Sites */}
            <div className="border-b border-border pb-8">
              <label className="label mb-4 block">Connected Sites</label>
              <div className="space-y-3">
                {['mysite.com', 'blog.example.com', 'store.mysite.com'].map((site) => (
                  <div key={site} className="flex items-center justify-between py-3 px-4 bg-secondary/50 border border-border">
                    <span className="font-mono text-sm">{site}</span>
                    <span className="w-2 h-2 rounded-full bg-success" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3 font-mono">3 sites connected</p>
            </div>

            {/* Danger Zone */}
            <div>
              <label className="label mb-4 block text-destructive">Danger Zone</label>
              <button className="px-4 py-3 text-xs font-mono text-destructive border border-destructive/30 hover:bg-destructive/10 transition-colors">
                Delete Account
              </button>
              <p className="text-xs text-muted-foreground mt-2">This action cannot be undone. All data will be permanently deleted.</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}