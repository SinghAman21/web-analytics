'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ModeToggle } from '../toggle';

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Pricing', href: '/billing' },
  { label: 'Login', href: '/login' },
];

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 lg:px-12 py-6 bg-background/80 backdrop-blur-sm border-b border-border/50"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="font-serif text-2xl italic tracking-tight hover:opacity-70 transition-opacity">
          Pulse
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <Link
                href={item.href}
                className="text-sm editorial-link text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            </motion.div>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/register"
            className="bg-foreground text-background px-4 py-2 text-xs font-mono hover:opacity-90 transition-opacity"
          >
            Start Free →
          </Link>
          <ModeToggle />
        </div>
      </div>
    </motion.header>
  );
}
