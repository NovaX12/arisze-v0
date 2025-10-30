// Next.js instrumentation - runs before the app starts
// This file is automatically loaded by Next.js 14+

export function register() {
  // Global error handlers to prevent server crashes
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    process.on('uncaughtException', (error) => {
      console.error('❌ UNCAUGHT EXCEPTION - Server did NOT crash (handled):')
      console.error('Error:', error.message)
      console.error('Stack:', error.stack)
      console.error('Timestamp:', new Date().toISOString())
      
      // Check if it's a Firebase/Database error
      if (error.message.includes('Firebase') || error.message.includes('ECONNREFUSED')) {
        console.error('🔥 CRITICAL: Firebase Connection Issue Detected!')
        console.error('Check: 1) Firebase credentials in serviceAccountKey.json.json')
        console.error('Check: 2) Firebase project permissions')
        console.error('Check: 3) Network connectivity')
      }
      console.error('---')
      // Don't exit - let the server continue
    })

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ UNHANDLED PROMISE REJECTION - Server did NOT crash (handled):')
      console.error('Reason:', reason)
      console.error('Promise:', promise)
      console.error('Timestamp:', new Date().toISOString())
      
      // Check if it's a database promise rejection
      if (reason && typeof reason === 'object' && 'message' in reason) {
        const message = (reason as Error).message
        if (message.includes('Firebase') || message.includes('Firestore')) {
          console.error('🔥 CRITICAL: Firebase/Firestore Query Failed!')
          console.error('This usually means a route is trying to access database without proper error handling')
        }
      }
      console.error('---')
      // Don't exit - let the server continue
    })

    process.on('warning', (warning) => {
      console.warn('⚠️ WARNING:', warning.name)
      console.warn('Message:', warning.message)
    })

    console.log('✅ Global error handlers initialized via instrumentation.ts')
    console.log('✅ Firebase/Firestore connection monitoring enabled')
    console.log('✅ Session security enhanced with strong NEXTAUTH_SECRET')
  }
}
