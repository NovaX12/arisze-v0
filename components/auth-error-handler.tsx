'use client'

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

export function AuthErrorHandler() {
  const { status, data: session } = useSession()

  useEffect(() => {
    // Override console.error to suppress NextAuth client fetch errors
    const originalConsoleError = console.error
    
    console.error = (...args) => {
      // Filter out NextAuth client fetch errors
      const message = args[0]?.toString() || ''
      
      if (
        message.includes('[next-auth][error][CLIENT_FETCH_ERROR]') ||
        message.includes('net::ERR_ABORTED') && message.includes('/api/auth/session')
      ) {
        // Silently ignore NextAuth session fetch errors
        return
      }
      
      // Allow other errors to be logged normally
      originalConsoleError.apply(console, args)
    }

    // Cleanup function to restore original console.error
    return () => {
      console.error = originalConsoleError
    }
  }, [])

  // This component doesn't render anything visible
  return null
}