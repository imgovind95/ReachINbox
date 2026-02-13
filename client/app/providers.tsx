'use client';

import { SessionProvider } from 'next-auth/react';

/**
 * AppProviders wrapper.
 * Wraps the application with necessary context providers including NextAuth SessionProvider.
 * This structure allows for easy addition of future providers (Theme, Redux, etc).
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
