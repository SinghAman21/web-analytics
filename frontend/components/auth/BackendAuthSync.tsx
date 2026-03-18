'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function BackendAuthSync() {
  const { isSignedIn, userId, getToken } = useAuth();
  const syncingRef = useRef(false);

  useEffect(() => {
    const syncUserToBackend = async () => {
      if (!isSignedIn || !userId || syncingRef.current) {
        return;
      }

      syncingRef.current = true;
      try {
        const token = await getToken();
        if (!token) {
          return;
        }

        await fetch(`${API_URL}/api/auth/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Failed to sync signed-in user to backend:', error);
      } finally {
        syncingRef.current = false;
      }
    };

    syncUserToBackend();
  }, [isSignedIn, userId, getToken]);

  return null;
}
