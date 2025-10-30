import admin from 'firebase-admin'

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // This initialization uses environment variables
    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
    
    // Debug: Log environment variable presence (NOT the actual values for security)
    console.log('🔍 Firebase Env Check:', {
      hasProjectId: !!projectId,
      hasClientEmail: !!clientEmail,
      hasPrivateKey: !!privateKey,
      privateKeyLength: privateKey?.length || 0,
      privateKeyStartsWith: privateKey?.substring(0, 30) || 'N/A'
    })
    
    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Missing required Firebase environment variables')
    }
    
    // Parse private key - this is where errors typically occur
    const parsedPrivateKey = privateKey.replace(/\\n/g, '\n')
    
    console.log('🔍 Private Key Parse Check:', {
      originalLength: privateKey.length,
      parsedLength: parsedPrivateKey.length,
      containsNewlines: parsedPrivateKey.includes('\n'),
      startsWithBegin: parsedPrivateKey.startsWith('-----BEGIN'),
      endsWithEnd: parsedPrivateKey.endsWith('KEY-----')
    })
    
    // Initialize Firebase Admin with environment variables
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: projectId,
        privateKey: parsedPrivateKey,
        clientEmail: clientEmail
      }),
      projectId: projectId
    })
    
    console.log('✅ Firebase Admin SDK initialized successfully')
  } catch (error: any) {
    // CRITICAL ERROR LOGGING - This will expose private key parsing failures
    console.error('\n' + '='.repeat(80))
    console.error('### CRITICAL FIREBASE AUTH ERROR ###')
    console.error('='.repeat(80))
    console.error('Error Message:', error?.message || 'Unknown error')
    console.error('Error Code:', error?.code || 'N/A')
    console.error('Error Type:', error?.constructor?.name || typeof error)
    console.error('\nFull Error Object:')
    console.error(JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    console.error('\nStack Trace:')
    console.error(error?.stack || 'No stack trace available')
    console.error('\nEnvironment Variables State:')
    console.error({
      FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY_EXISTS: !!process.env.FIREBASE_PRIVATE_KEY,
      FIREBASE_PRIVATE_KEY_LENGTH: process.env.FIREBASE_PRIVATE_KEY?.length || 0,
      FIREBASE_PRIVATE_KEY_FIRST_30_CHARS: process.env.FIREBASE_PRIVATE_KEY?.substring(0, 30) || 'N/A',
      FIREBASE_PRIVATE_KEY_LAST_30_CHARS: process.env.FIREBASE_PRIVATE_KEY?.substring(process.env.FIREBASE_PRIVATE_KEY.length - 30) || 'N/A'
    })
    console.error('='.repeat(80))
    console.error('### END CRITICAL FIREBASE AUTH ERROR ###')
    console.error('='.repeat(80) + '\n')
    throw error
  }
}

// Export Firestore instance
export const firestoreDb = admin.firestore()

// Export admin for FieldValue and other utilities
export { admin }
