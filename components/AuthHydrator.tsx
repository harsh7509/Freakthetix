'use client';
import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useAuth, type AuthUser } from '@/lib/store/auth';

export default function AuthHydrator() {
  const { data: session, status } = useSession();
  const setUser = useAuth((s) => s.setUser);
  const setLoading = useAuth((s) => s.setLoading);

  const last = useRef<string>(''); // cache last serialized state

  useEffect(() => {
    const loading = status === 'loading';
    const raw = session?.user as any;

    const next: AuthUser | null = raw
      ? {
          id: String(raw.id ?? raw._id ?? ''),
          email: String(raw.email ?? ''),
          name: raw.name ?? '',
          role: (raw.role as any) ?? 'user',
        }
      : null;

    const key = JSON.stringify({ loading, next });

    // ✅ Update only when something actually changes
    if (key !== last.current) {
      last.current = key;
      setLoading(loading);
      setUser(next);
    }
  }, [status, session, setLoading, setUser]);

  return null;
}
