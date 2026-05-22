'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { clearSessionToken } from '@/lib/session-token';
import { SpinnerCustom } from '@/components/ui/spinner';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      clearSessionToken();
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <SpinnerCustom />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
