/**
 * Environment Variable Validation
 * Validates all required environment variables at startup
 * Prevents cryptic runtime errors from missing config
 * 
 * ✅ UPDATED FOR FIREBASE - MongoDB checks removed
 */

export function validateEnv() {
  const requiredEnvVars = [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ]

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  )

  if (missingVars.length > 0) {
    console.error('\n❌ MISSING ENVIRONMENT VARIABLES ❌\n')
    console.error('The following required variables are not set:')
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`)
    })
    console.error('\nPlease check your .env.local file.\n')
    
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    )
  }

  console.log('✅ All required environment variables present')

  // Validate NEXTAUTH_SECRET length
  if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
    console.warn('\n⚠️  WARNING: NEXTAUTH_SECRET should be at least 32 characters long')
    console.warn('   Current length:', process.env.NEXTAUTH_SECRET.length)
    console.warn('   Generate a secure secret with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"\n')
  }

  // Log environment status
  console.log('📊 Environment Status:')
  console.log(`   - NODE_ENV: ${process.env.NODE_ENV}`)
  console.log(`   - NEXTAUTH_URL: ${process.env.NEXTAUTH_URL}`)
  console.log(`   - Database: Firebase Firestore (using serviceAccountKey.json.json)`)
  console.log('') // Empty line for readability
}

// Auto-validate in development and production
if (typeof window === 'undefined') {
  try {
    validateEnv()
  } catch (error: any) {
    console.error('\n⚠️  ENVIRONMENT VALIDATION FAILED ⚠️\n')
    console.error(error.message)
    console.error('\nThe app may not work correctly.\n')
    
    // Exit in production to prevent running with bad config
    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    }
  }
}
