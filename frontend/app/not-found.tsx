'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MoveRight, Home, Search } from 'lucide-react';

const NotFound = () => {
  const pathname = usePathname();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', pathname);
  }, [pathname]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden bg-background"
    >
      {/* Subtle animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Soft warm gradient background */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(
              ellipse 120% 120% at ${70 + mousePos.x * 20}% ${40 + mousePos.y * 20}%,
              hsl(var(--highlight)) 0%,
              transparent 70%
            )`,
            transition: 'background 0.3s ease-out',
          }}
        />
        
        {/* Subtle dots pattern */}
        <svg
          className="absolute inset-0 opacity-[0.02]"
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="dots" x="20" y="20" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1" fill="hsl(var(--foreground))" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-20">
        <motion.div
          className="max-w-2xl w-full text-center space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* 404 Number */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-2"
          >
            <div className="text-7xl md:text-8xl font-black tracking-tighter bg-gradient-to-br from-accent to-accent/60 bg-clip-text text-transparent">
              404
            </div>
            <div className="h-1 w-24 mx-auto bg-gradient-to-r from-accent/0 via-accent to-accent/0" />
          </motion.div>

          {/* Main heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-foreground">
              Page Not Found
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              The page you're looking for doesn't exist or may have been moved. Let me help you find
              what you need.
            </p>
          </motion.div>

          {/* Subtle info cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left py-8"
          >
            <div className="editorial-card p-4 rounded-lg">
              <div className="text-sm font-mono text-muted-foreground mb-2">Requested</div>
              <div className="text-sm text-foreground truncate font-medium">{pathname}</div>
            </div>
            <div className="editorial-card p-4 rounded-lg">
              <div className="text-sm font-mono text-muted-foreground mb-2">Status</div>
              <div className="text-sm text-destructive font-medium">404 Not Found</div>
            </div>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 justify-center pt-4"
          >
            <Link
              href="/"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-accent text-accent-foreground font-medium transition-all duration-300 hover:shadow-[0_8px_24px_hsl(var(--accent)_/_0.3)] hover:scale-105"
            >
              <Home className="w-4 h-4" />
              Return Home
              <MoveRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-border bg-card/50 text-foreground font-medium transition-all duration-300 hover:border-accent/50 hover:shadow-md"
            >
              <Search className="w-4 h-4" />
              Go to Dashboard
            </Link>
          </motion.div>

          {/* Footer text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-xs text-muted-foreground pt-4"
          >
            Need help? Contact our{' '}
            <a
              href="/contact"
              className="text-accent hover:underline transition-colors"
            >
              support team
            </a>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
