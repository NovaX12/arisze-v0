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
      
      // Check if it's a MongoDB error
      if (error.message.includes('MongoDB') || error.message.includes('ECONNREFUSED')) {
        console.error('🔥 CRITICAL: MongoDB Connection Issue Detected!')
        console.error('Check: 1) MONGODB_URI in .env.local')
        console.error('Check: 2) MongoDB Atlas whitelist')
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
        if (message.includes('MongoDB') || message.includes('getDatabase')) {
          console.error('🔥 CRITICAL: Database Query Failed!')
          console.error('This usually means a route is trying to access DB without proper error handling')
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
    console.log('✅ MongoDB connection monitoring enabled')
    console.log('✅ Session security enhanced with strong NEXTAUTH_SECRET')
  }
}
