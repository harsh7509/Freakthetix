'use client';
import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import AuthHydrator from '@/components/AuthHydrator';

export default function ClientSessionProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthHydrator />  {/* ✅ sync NextAuth → Zustand only once */}
      {children}
    </SessionProvider>
  );
}
