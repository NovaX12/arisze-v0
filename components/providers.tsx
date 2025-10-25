'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { AuthErrorHandler } from './auth-error-handler'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider 
      basePath="/api/auth"
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true} // Refetch when user returns to tab
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthErrorHandler />
        {children}
      </ThemeProvider>
    </SessionProvider>
  )
}

