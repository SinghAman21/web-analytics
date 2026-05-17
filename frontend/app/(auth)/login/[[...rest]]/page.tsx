'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGoogleLogin } from '@react-oauth/google';
import { useEffect, useState } from 'react';
import { SpinnerCustom } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { ModeToggle } from '@/components/toggle';

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="size-5">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.645 32.657 29.315 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.156 7.963 3.047l5.657-5.657C34.045 6.053 29.327 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.156 7.963 3.047l5.657-5.657C34.045 6.053 29.327 4 24 4c-7.391 0-13.734 4.159-17.694 10.691z" />
      <path fill="#4CAF50" d="M24 44c5.227 0 10.005-2.006 13.594-5.273l-6.273-5.302C29.283 35.091 26.812 36 24 36c-5.294 0-9.611-3.327-11.297-7.962l-6.52 5.025C10.12 39.065 16.228 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.44 4.057-4.204 6.972-7.982 8.425l.003-.002 6.273 5.302C36.169 39.846 40 33.5 40 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

export default function LoginPage() {
  const { user, loginWithGoogleCode, isLoading } = useAuth();
  const [error, setError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard');
    }
  }, [isLoading, router, user]);

  const startGoogleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (codeResponse) => {
      try {
        setIsSigningIn(true);
        setError('');
        await loginWithGoogleCode(codeResponse.code);
      } catch (loginError) {
        setError(loginError instanceof Error ? loginError.message : 'Google sign in failed');
      } finally {
        setIsSigningIn(false);
      }
    },
    onError: () => {
      setIsSigningIn(false);
      setError('Google sign in was cancelled or failed');
    },
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 opacity-100 bg-[radial-gradient(circle_at_top,_color-mix(in_oklch,_hsl(var(--accent))_12%,_transparent)_0,_transparent_32%),radial-gradient(circle_at_bottom_right,_color-mix(in_oklch,_hsl(var(--primary))_7%,_transparent)_0,_transparent_26%)]" />
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(hsl(var(--foreground)/0.16)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--foreground)/0.16)_1px,transparent_1px)] [background-size:44px_44px]" />

      <header className="relative z-10 border-b border-border/70 bg-background/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-3 hover:opacity-80 transition-opacity">
            <span className="font-serif text-2xl italic tracking-tight">Pulse</span>
            <span className="hidden sm:inline text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Analytics</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Google OAuth</span>
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="relative z-10 min-h-[calc(100vh-73px)] flex items-center px-6 py-10 lg:py-14">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]"
        >
          <div className="editorial-card relative overflow-hidden rounded-[1.75rem] p-8 sm:p-10 lg:p-12">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,hsl(var(--accent)/0.1),transparent_40%),linear-gradient(225deg,hsl(var(--primary)/0.06),transparent_38%)]" />
            <div className="relative flex h-full flex-col justify-between gap-8">
              <div className="space-y-6 max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" />
                  Authentication
                </div>

                <h1 className="display-lg max-w-[11ch] text-balance">
                  Sign in to the same analytics system.
                </h1>

                <p className="max-w-lg text-sm sm:text-base leading-7 text-muted-foreground">
                  Use Google to access your workspace. The flow matches the rest of the product: quiet, direct, and focused on getting you into the dashboard fast.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {['Google OAuth', 'Supabase session', 'Privacy-first dashboard'].map((item) => (
                  <motion.div
                    key={item}
                    whileHover={{ y: -2 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    className="rounded-2xl border border-border bg-background/60 px-4 py-4"
                  >
                    <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{item}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="editorial-card-hover relative overflow-hidden rounded-[1.75rem] p-8 sm:p-10 lg:p-12">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--foreground)/0.03),transparent_28%)]" />
            <div className="relative">
              <div className="space-y-2">
                <p className="label">Sign in</p>
                <h2 className="display-lg text-[clamp(2.5rem,4vw,4rem)]">Continue with Google</h2>
                <p className="max-w-md text-sm sm:text-base leading-7 text-muted-foreground">
                  Access the dashboard with your company account. If your profile does not exist yet, it will be created automatically.
                </p>
              </div>

              <div className="mt-8 space-y-4">
                <Button
                  type="button"
                  onClick={() => startGoogleLogin()}
                  disabled={isLoading || isSigningIn}
                  size="lg"
                  variant="outline"
                  className="group h-12 w-full rounded-full border-border bg-background px-5 text-sm font-medium text-foreground shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:border-[hsl(var(--accent))] hover:bg-secondary/40 hover:shadow-[0_14px_36px_hsl(var(--foreground)/0.12)] active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading || isSigningIn ? (
                    <SpinnerCustom />
                  ) : (
                    <span className="inline-flex items-center justify-center rounded-full bg-background/80 p-0.5 ring-1 ring-border transition-transform duration-200 group-hover:scale-105">
                      <GoogleMark />
                    </span>
                  )}
                  <span className="transition-transform duration-200 group-hover:translate-x-0.5">Continue with Google</span>
                </Button>

                <p className="text-xs leading-5 text-muted-foreground">
                  You&apos;ll be redirected to Google, then returned here once your session has been created.
                </p>

                {error ? (
                  <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                ) : null}
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  className="rounded-2xl border border-border bg-secondary/40 p-4"
                >
                  <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Session</div>
                  <div className="mt-2 text-sm leading-6 text-foreground/90">Stored as an HttpOnly cookie and reused on every request.</div>
                </motion.div>
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  className="rounded-2xl border border-border bg-secondary/40 p-4"
                >
                  <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Backend</div>
                  <div className="mt-2 text-sm leading-6 text-foreground/90">Verifies Google, upserts the user, and issues the app session.</div>
                </motion.div>
              </div>

              <div className="mt-8 flex items-center justify-between gap-4 border-t border-border pt-5 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <span>Privacy-first analytics</span>
                <span>No invasive tracking</span>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
