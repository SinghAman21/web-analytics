'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ModeToggle } from '../toggle';

interface AppHeaderProps {
  title?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export default function AppHeader({ title, breadcrumbs }: AppHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="border-b border-border bg-background/50 backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-serif text-2xl italic tracking-tight hover:opacity-70 transition-opacity">
            Pulse
          </Link>

          {breadcrumbs && breadcrumbs.length > 0 && (
            <>
              <span className="w-px h-6 bg-border" />
              <nav className="flex items-center gap-2">
                {breadcrumbs.map((crumb, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {i > 0 && <span className="text-muted-foreground">/</span>}
                    {crumb.href ? (
                      <Link
                        href={crumb.href}
                        className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-sm font-mono text-muted-foreground">{crumb.label}</span>
                    )}
                  </div>
                ))}
              </nav>
            </>
          )}

          {title && !breadcrumbs && (
            <>
              <span className="w-px h-6 bg-border" />
              <h1 className="text-sm font-mono text-muted-foreground">{title}</h1>
            </>
          )}
        </div>

        <ModeToggle />
      </div>
    </motion.header>
  );
}
