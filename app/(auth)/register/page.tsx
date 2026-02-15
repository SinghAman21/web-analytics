'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [siteUrl, setSiteUrl] = useState('');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 lg:px-12 py-6 border-b border-border">
        <Link href="/" className="font-serif text-2xl italic tracking-tight hover:opacity-70 transition-opacity">
          Pulse
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <p className="label mb-4">Get Started</p>
          <h1 className="display-lg mb-2">
            Start tracking <span className="font-serif italic">free</span>
          </h1>
          <p className="text-muted-foreground mb-12">Create your first dashboard instantly</p>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <div>
              <label className="label mb-2 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-secondary border border-border px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="label mb-2 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-secondary border border-border px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="label mb-2 block">Site URL</label>
              <input
                type="url"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                className="w-full bg-secondary border border-border px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="https://yoursite.com"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-foreground text-background py-3 text-sm font-mono hover:opacity-90 transition-opacity"
            >
              Create Account
            </button>
          </form>

          <p className="mt-8 pt-8 border-t border-border text-sm text-muted-foreground text-center">
            Already have an account?{' '}
            <Link href="/login" className="text-accent hover:text-accent/80 transition-colors">
              Sign in →
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}