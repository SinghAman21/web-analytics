'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ClerkLoaded, ClerkLoading, SignIn } from '@clerk/nextjs';
import { SpinnerCustom } from '@/components/ui/spinner';

export default function LoginPage() {
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
          <ClerkLoading>
            <div className="border border-border bg-card p-12 flex items-center justify-center">
              <SpinnerCustom />
            </div>
          </ClerkLoading>

          <ClerkLoaded>
            <SignIn
              routing="hash"
              signUpUrl="/register"
              fallbackRedirectUrl="/dashboard"
              appearance={{
                elements: {
                  card: 'shadow-none border border-border rounded-none bg-card',
                  headerTitle: 'font-serif italic text-3xl',
                  headerSubtitle: 'text-muted-foreground',
                  formButtonPrimary:
                    'bg-foreground text-background rounded-none font-mono text-sm hover:opacity-90',
                  formFieldInput:
                    'rounded-none border-border bg-secondary text-foreground placeholder:text-muted-foreground',
                  formFieldLabel: 'font-mono text-xs uppercase tracking-[0.12em]',
                  footerActionLink: 'text-accent hover:text-accent/80',
                  socialButtonsBlockButton:
                    'rounded-none border-border bg-background hover:bg-accent/10 text-foreground',
                },
              }}
            />
          </ClerkLoaded>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Privacy-first analytics. No invasive tracking.
          </div>
        </motion.div>
      </main>
    </div>
  );
}
