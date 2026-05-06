'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGoogleLogin } from '@react-oauth/google';
import { useEffect, useState } from 'react';
import { SpinnerCustom } from '@/components/ui/spinner';
import { useAuth } from '@/lib/auth-context';

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
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(244,114,182,0.12),_transparent_30%),linear-gradient(180deg,_#faf7f2_0%,_#f3efe7_100%)] text-foreground">
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(0,0,0,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.15)_1px,transparent_1px)] [background-size:42px_42px]" />

      <header className="relative z-10 px-6 lg:px-12 py-6 flex items-center justify-between border-b border-black/10">
        <Link href="/" className="font-serif text-2xl italic tracking-tight hover:opacity-70 transition-opacity">
          Pulse
        </Link>
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Google OAuth</span>
      </header>

      <main className="relative z-10 min-h-[calc(100vh-81px)] flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-5xl grid gap-8 lg:grid-cols-[1.1fr_0.9fr]"
        >
          <div className="hidden lg:flex flex-col justify-between rounded-[2rem] border border-black/10 bg-black text-white p-10 shadow-[0_32px_120px_rgba(0,0,0,0.16)]">
            <div className="space-y-6 max-w-xl">
              <p className="text-xs uppercase tracking-[0.25em] text-white/60">Authentication</p>
              <h1 className="font-serif text-5xl leading-tight">
                One Google login, one Supabase profile, one session token.
              </h1>
              <p className="text-white/70 text-base leading-7">
                The backend exchanges Google&apos;s authorization code, verifies the identity token, upserts the user in Supabase, and sets a secure session cookie.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              {['Verify code', 'Upsert Supabase user', 'Set session cookie'].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/80">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-black/10 bg-white/85 backdrop-blur-xl shadow-[0_28px_80px_rgba(23,23,23,0.12)] p-8 sm:p-10">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Sign in</p>
              <h2 className="font-serif text-4xl tracking-tight">Continue with Google</h2>
              <p className="text-sm text-muted-foreground leading-6">
                Use the company Google account to create or resume your analytics workspace.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <button
                type="button"
                onClick={() => startGoogleLogin()}
                disabled={isLoading || isSigningIn}
                className="group flex w-full items-center justify-center gap-3 rounded-full border border-black/10 bg-black px-5 py-3.5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading || isSigningIn ? <SpinnerCustom /> : <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-black text-xs font-bold">G</span>}
                <span>Continue with Google</span>
              </button>

              <p className="text-xs leading-5 text-muted-foreground">
                You will be redirected to Google to approve access. After approval, the backend creates your Supabase record if it does not exist.
              </p>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-black/10 bg-secondary/60 p-4">
                <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Session</div>
                <div className="mt-2 text-sm">Stored as an HttpOnly cookie and reused on every request.</div>
              </div>
              <div className="rounded-2xl border border-black/10 bg-secondary/60 p-4">
                <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Backend</div>
                <div className="mt-2 text-sm">Verifies Google, upserts Supabase, and issues the app session.</div>
              </div>
            </div>

            <div className="mt-8 text-center text-sm text-muted-foreground">
              Privacy-first analytics. No invasive tracking.
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
