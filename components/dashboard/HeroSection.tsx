'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="min-h-[85vh] flex flex-col justify-end px-6 lg:px-12 pb-24 pt-32">
      <div className="max-w-7xl mx-auto w-full">
        {/* Overline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="label mb-6"
        >
          Privacy-First Analytics
        </motion.p>

        {/* Main headline */}
        <div className="grid lg:grid-cols-12 gap-8 items-end">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-8"
          >
            <h1 className="display-xl ">
              <span className="text-foreground">Simple</span>
              <br />
              <section className='py-3'>
              <span className="font-serif italic text-accent my-5">analytics</span>
              <span className="text-foreground"> for</span>
              </section>
              {/* <br /> */}
              <span className="text-foreground">modern sites.</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="lg:col-span-4 pb-4"
          >
            <p className="text-muted-foreground text-lg leading-relaxed max-w-sm mb-8">
              Privacy-first. Lightning-fast. No cookies.
              Free public dashboards • Live user tracking • Full UTM breakdowns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="inline-block bg-foreground text-background px-8 py-3 text-sm font-mono hover:opacity-90 transition-opacity text-center"
              >
                Start Free →
              </Link>
              <Link
                href="/public/new"
                className="inline-block border border-border px-8 py-3 text-sm font-mono text-muted-foreground hover:text-foreground hover:border-foreground transition-all text-center"
              >
                Try without signup →
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.6, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="divider mt-16 origin-left"
        />
      </div>
    </section>
  );
}
