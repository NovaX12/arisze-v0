// Global error handlers to prevent server crashes
// This catches uncaught exceptions and unhandled promise rejections

process.on('uncaughtException', (error) => {
  console.error('❌ UNCAUGHT EXCEPTION - Server did NOT crash (handled):')
  console.error('Error:', error.message)
  console.error('Stack:', error.stack)
  console.error('Timestamp:', new Date().toISOString())
  console.error('---')
  // Don't exit the process - let it continue running
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ UNHANDLED PROMISE REJECTION - Server did NOT crash (handled):')
  console.error('Reason:', reason)
  console.error('Promise:', promise)
  console.error('Timestamp:', new Date().toISOString())
  console.error('---')
  // Don't exit the process - let it continue running
})

process.on('warning', (warning) => {
  console.warn('⚠️ WARNING:', warning.name)
  console.warn('Message:', warning.message)
  console.warn('Stack:', warning.stack)
})

console.log('✅ Global error handlers initialized - Server will not crash on uncaught errors')
