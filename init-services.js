/**
 * Service Initialization Script
 * Initializes MongoDB and Firebase Admin SDK
 * Run with: node init-services.js
 */

const { MongoClient } = require('mongodb')
const admin = require('firebase-admin')
const fs = require('fs')
const path = require('path')

// MongoDB Configuration
const MONGODB_URI = 'mongodb+srv://kathanchauhan22_db_user:NovaX135@arisze.y20yxd7.mongodb.net/arisze?retryWrites=true&w=majority'
const DATABASE_NAME = 'arisze'

// Firebase Configuration
const FIREBASE_KEY_PATH = './serviceAccountKey.json.json'

/**
 * Initialize MongoDB Connection
 */
async function initializeMongoDB() {
  console.log('\n🔵 Initializing MongoDB...')
  console.log(`📍 URI: ${MONGODB_URI.substring(0, 50)}...`)
  console.log(`📊 Database: ${DATABASE_NAME}`)
  
  try {
    const client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      retryReads: true,
      w: 'majority'
    })
    
    // Connect to MongoDB
    await client.connect()
    console.log('✅ MongoDB connected successfully!')
    
    // Get database
    const db = client.db(DATABASE_NAME)
    
    // Verify connection with ping
    await db.command({ ping: 1 })
    console.log('✅ MongoDB ping successful!')
    
    // List collections
    const collections = await db.listCollections().toArray()
    console.log(`📋 Collections found: ${collections.length}`)
    collections.forEach(col => {
      console.log(`   - ${col.name}`)
    })
    
    // Get collection counts
    console.log('\n📊 Collection Statistics:')
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments()
      console.log(`   ${col.name}: ${count} documents`)
    }
    
    return { client, db, success: true }
    
  } catch (error) {
    console.error('❌ MongoDB initialization failed:', error.message)
    return { client: null, db: null, success: false, error }
  }
}

/**
 * Initialize Firebase Admin SDK
 */
async function initializeFirebase() {
  console.log('\n🔥 Initializing Firebase Admin SDK...')
  console.log(`📍 Key file: ${FIREBASE_KEY_PATH}`)
  
  try {
    // Check if key file exists
    const keyPath = path.resolve(FIREBASE_KEY_PATH)
    if (!fs.existsSync(keyPath)) {
      throw new Error(`Firebase key file not found at: ${keyPath}`)
    }
    
    console.log('✅ Firebase key file found')
    
    // Read service account key
    const serviceAccount = require(keyPath)
    
    // Check if Firebase is already initialized
    if (admin.apps.length > 0) {
      console.log('⚠️ Firebase Admin SDK already initialized')
      return { app: admin.app(), success: true, alreadyInitialized: true }
    }
    
    // Initialize Firebase Admin
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: serviceAccount.project_id + '.appspot.com'
    })
    
    console.log('✅ Firebase Admin SDK initialized successfully!')
    console.log(`📦 Project ID: ${serviceAccount.project_id}`)
    
    // Verify Firestore access
    const db = admin.firestore()
    const testCollection = await db.collection('_test_').limit(1).get()
    console.log('✅ Firestore access verified!')
    
    // Verify Storage access
    const bucket = admin.storage().bucket()
    console.log(`✅ Storage bucket: ${bucket.name}`)
    
    return { app, success: true, alreadyInitialized: false }
    
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message)
    return { app: null, success: false, error }
  }
}

/**
 * Main initialization function
 */
async function initializeServices() {
  console.log('🚀 Starting Service Initialization...')
  console.log('=' .repeat(60))
  
  const results = {
    mongodb: null,
    firebase: null,
    overallSuccess: false
  }
  
  try {
    // Initialize MongoDB
    results.mongodb = await initializeMongoDB()
    
    // Initialize Firebase
    results.firebase = await initializeFirebase()
    
    // Check overall success
    results.overallSuccess = results.mongodb.success && results.firebase.success
    
    // Print summary
    console.log('\n' + '='.repeat(60))
    console.log('📋 INITIALIZATION SUMMARY')
    console.log('='.repeat(60))
    console.log(`MongoDB: ${results.mongodb.success ? '✅ SUCCESS' : '❌ FAILED'}`)
    console.log(`Firebase: ${results.firebase.success ? '✅ SUCCESS' : '❌ FAILED'}`)
    console.log('='.repeat(60))
    
    if (results.overallSuccess) {
      console.log('\n🎉 All services initialized successfully!')
      console.log('\n💡 Next steps:')
      console.log('   1. Start your Next.js dev server: npm run dev')
      console.log('   2. Your app is ready to use both MongoDB and Firebase')
      console.log('   3. Check .env.local for environment variables\n')
    } else {
      console.log('\n⚠️ Some services failed to initialize')
      if (!results.mongodb.success) {
        console.log('\n❌ MongoDB Issues:')
        console.log('   - Check your internet connection')
        console.log('   - Verify MongoDB Atlas IP whitelist')
        console.log('   - Confirm credentials are correct')
      }
      if (!results.firebase.success) {
        console.log('\n❌ Firebase Issues:')
        console.log('   - Ensure serviceAccountKey.json exists')
        console.log('   - Verify the JSON file is valid')
        console.log('   - Check Firebase project settings')
      }
      console.log('')
    }
    
    // Close MongoDB connection
    if (results.mongodb.client) {
      await results.mongodb.client.close()
      console.log('🔌 MongoDB connection closed')
    }
    
    return results
    
  } catch (error) {
    console.error('\n❌ Initialization error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error)
  process.exit(1)
})

// Run initialization
if (require.main === module) {
  initializeServices()
    .then((results) => {
      process.exit(results.overallSuccess ? 0 : 1)
    })
    .catch((error) => {
      console.error('❌ Fatal error:', error)
      process.exit(1)
    })
}

// Export for use in other scripts
module.exports = {
  initializeMongoDB,
  initializeFirebase,
  initializeServices,
  MONGODB_URI,
  DATABASE_NAME
}
