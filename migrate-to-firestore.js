/**
 * MongoDB to Firestore Migration Script
 * Migrates users from MongoDB to Firestore with batched writes
 * Run with: node migrate-to-firestore.js
 */

const { MongoClient } = require('mongodb')
const admin = require('firebase-admin')
const path = require('path')

// MongoDB Configuration
const MONGODB_URI = 'mongodb+srv://kathanchauhan22_db_user:NovaX135@arisze.y20yxd7.mongodb.net/arisze?retryWrites=true&w=majority'
const DATABASE_NAME = 'arisze'

// Firebase Configuration
const FIREBASE_KEY_PATH = './serviceAccountKey.json.json'

/**
 * Migrates users from MongoDB to Firestore
 * Uses cursor iteration and batched writes (500 documents per batch)
 */
async function migrateUsers() {
  console.log('\n🔄 Starting User Migration from MongoDB to Firestore...\n')
  
  let mongoClient = null
  let migratedCount = 0
  let batchCount = 0
  let errorCount = 0
  
  try {
    // Initialize Firebase Admin if not already initialized
    if (admin.apps.length === 0) {
      const serviceAccount = require(path.resolve(FIREBASE_KEY_PATH))
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      })
      console.log('✅ Firebase Admin SDK initialized')
    }
    
    const firestore = admin.firestore()
    
    // Connect to MongoDB
    console.log('🔵 Connecting to MongoDB...')
    mongoClient = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10
    })
    
    await mongoClient.connect()
    console.log('✅ MongoDB connected\n')
    
    const db = mongoClient.db(DATABASE_NAME)
    const usersCollection = db.collection('users')
    
    // Get total count for progress tracking
    const totalUsers = await usersCollection.countDocuments()
    console.log(`📊 Total users to migrate: ${totalUsers}\n`)
    
    if (totalUsers === 0) {
      console.log('⚠️ No users found in MongoDB collection')
      return { success: true, migratedCount: 0, batchCount: 0, errorCount: 0 }
    }
    
    // Create cursor to iterate through all documents
    const cursor = usersCollection.find({})
    
    let batch = firestore.batch()
    let batchSize = 0
    const BATCH_LIMIT = 500
    
    console.log('🔄 Processing users...\n')
    
    // Iterate through all MongoDB documents using cursor
    while (await cursor.hasNext()) {
      try {
        const mongoDoc = await cursor.next()
        
        // Convert MongoDB _id to string for Firestore document ID
        const firestoreDocId = mongoDoc._id.toString()
        
        // Create a copy of the document without the _id field
        const { _id, ...firestoreData } = mongoDoc
        
        // Handle large avatar fields (Firestore limit: 1MB per field)
        if (firestoreData.avatar && typeof firestoreData.avatar === 'string') {
          const avatarSize = Buffer.byteLength(firestoreData.avatar, 'utf8')
          if (avatarSize > 1000000) { // ~1MB limit
            console.log(`   ⚠️ User ${firestoreDocId}: Avatar too large (${Math.round(avatarSize/1024)}KB), storing URL reference only`)
            // Store as URL reference instead of base64
            firestoreData.avatarLarge = true
            firestoreData.avatarSize = avatarSize
            // Keep only first 100 chars as preview
            firestoreData.avatarPreview = firestoreData.avatar.substring(0, 100)
            delete firestoreData.avatar
          }
        }
        
        // Remove any other potentially large fields
        Object.keys(firestoreData).forEach(key => {
          if (typeof firestoreData[key] === 'string') {
            const fieldSize = Buffer.byteLength(firestoreData[key], 'utf8')
            if (fieldSize > 1000000) {
              console.log(`   ⚠️ User ${firestoreDocId}: Field '${key}' too large (${Math.round(fieldSize/1024)}KB), truncating`)
              firestoreData[key] = firestoreData[key].substring(0, 1000) + '... [truncated]'
            }
          }
        })
        
        // Add metadata fields
        firestoreData.mongoId = firestoreDocId
        firestoreData.migratedAt = admin.firestore.FieldValue.serverTimestamp()
        
        // Add document to batch
        const docRef = firestore.collection('users').doc(firestoreDocId)
        batch.set(docRef, firestoreData, { merge: true })
        
        batchSize++
        migratedCount++
        
        // Commit batch when it reaches the limit
        if (batchSize >= BATCH_LIMIT) {
          await batch.commit()
          batchCount++
          
          console.log(`✅ Batch ${batchCount} committed: ${batchSize} users`)
          console.log(`   Progress: ${migratedCount}/${totalUsers} (${Math.round(migratedCount/totalUsers*100)}%)`)
          
          // Create new batch
          batch = firestore.batch()
          batchSize = 0
        }
        
      } catch (error) {
        errorCount++
        console.error(`❌ Error processing document:`, error.message)
        // Continue with next document
      }
    }
    
    // Commit any remaining documents in the final batch
    if (batchSize > 0) {
      await batch.commit()
      batchCount++
      console.log(`✅ Final batch ${batchCount} committed: ${batchSize} users`)
    }
    
    console.log('\n' + '='.repeat(60))
    console.log('📋 MIGRATION SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total Users in MongoDB: ${totalUsers}`)
    console.log(`Successfully Migrated: ${migratedCount}`)
    console.log(`Total Batches: ${batchCount}`)
    console.log(`Errors: ${errorCount}`)
    console.log(`Success Rate: ${Math.round(migratedCount/totalUsers*100)}%`)
    console.log('='.repeat(60))
    
    if (migratedCount === totalUsers && errorCount === 0) {
      console.log('\n🎉 Migration completed successfully!\n')
    } else if (errorCount > 0) {
      console.log(`\n⚠️ Migration completed with ${errorCount} errors\n`)
    }
    
    return {
      success: true,
      migratedCount,
      batchCount,
      errorCount,
      totalUsers
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    console.error(error.stack)
    
    return {
      success: false,
      migratedCount,
      batchCount,
      errorCount,
      error: error.message
    }
    
  } finally {
    // Close MongoDB connection
    if (mongoClient) {
      await mongoClient.close()
      console.log('🔌 MongoDB connection closed\n')
    }
  }
}

/**
 * Migrates events from MongoDB to Firestore
 * Uses cursor iteration and batched writes (500 documents per batch)
 */
async function migrateEvents() {
  console.log('\n🔄 Starting Event Migration from MongoDB to Firestore...\n')
  
  let mongoClient = null
  let migratedCount = 0
  let batchCount = 0
  let errorCount = 0
  
  try {
    // Initialize Firebase Admin if not already initialized
    if (admin.apps.length === 0) {
      const serviceAccount = require(path.resolve(FIREBASE_KEY_PATH))
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      })
      console.log('✅ Firebase Admin SDK initialized')
    }
    
    const firestore = admin.firestore()
    
    // Connect to MongoDB
    console.log('🔵 Connecting to MongoDB...')
    mongoClient = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10
    })
    
    await mongoClient.connect()
    console.log('✅ MongoDB connected\n')
    
    const db = mongoClient.db(DATABASE_NAME)
    const eventsCollection = db.collection('events')
    
    // Get total count for progress tracking
    const totalEvents = await eventsCollection.countDocuments()
    console.log(`📊 Total events to migrate: ${totalEvents}\n`)
    
    if (totalEvents === 0) {
      console.log('⚠️ No events found in MongoDB collection')
      return { success: true, migratedCount: 0, batchCount: 0, errorCount: 0 }
    }
    
    // Create cursor to iterate through all documents
    const cursor = eventsCollection.find({})
    
    let batch = firestore.batch()
    let batchSize = 0
    const BATCH_LIMIT = 500
    
    console.log('🔄 Processing events...\n')
    
    // Iterate through all MongoDB documents using cursor
    while (await cursor.hasNext()) {
      try {
        const mongoDoc = await cursor.next()
        
        // Convert MongoDB _id to string for Firestore document ID
        const firestoreDocId = mongoDoc._id.toString()
        
        // Create a copy of the document without the _id field
        const { _id, ...firestoreData } = mongoDoc
        
        // Convert ObjectId fields to strings (createdBy, participants, etc.)
        if (firestoreData.createdBy && typeof firestoreData.createdBy === 'object') {
          firestoreData.createdBy = firestoreData.createdBy.toString()
        }
        
        if (Array.isArray(firestoreData.participants)) {
          firestoreData.participants = firestoreData.participants.map(p => 
            typeof p === 'object' ? p.toString() : p
          )
        }
        
        // Handle large image fields (Firestore limit: 1MB per field)
        if (firestoreData.image && typeof firestoreData.image === 'string') {
          const imageSize = Buffer.byteLength(firestoreData.image, 'utf8')
          if (imageSize > 1000000) { // ~1MB limit
            console.log(`   ⚠️ Event ${firestoreDocId}: Image too large (${Math.round(imageSize/1024)}KB), storing URL reference only`)
            firestoreData.imageLarge = true
            firestoreData.imageSize = imageSize
            firestoreData.imagePreview = firestoreData.image.substring(0, 100)
            delete firestoreData.image
          }
        }
        
        // Remove any other potentially large fields
        Object.keys(firestoreData).forEach(key => {
          if (typeof firestoreData[key] === 'string') {
            const fieldSize = Buffer.byteLength(firestoreData[key], 'utf8')
            if (fieldSize > 1000000) {
              console.log(`   ⚠️ Event ${firestoreDocId}: Field '${key}' too large (${Math.round(fieldSize/1024)}KB), truncating`)
              firestoreData[key] = firestoreData[key].substring(0, 1000) + '... [truncated]'
            }
          }
        })
        
        // Add metadata fields
        firestoreData.mongoId = firestoreDocId
        firestoreData.migratedAt = admin.firestore.FieldValue.serverTimestamp()
        
        // Add document to batch
        const docRef = firestore.collection('events').doc(firestoreDocId)
        batch.set(docRef, firestoreData, { merge: true })
        
        batchSize++
        migratedCount++
        
        // Commit batch when it reaches the limit
        if (batchSize >= BATCH_LIMIT) {
          await batch.commit()
          batchCount++
          
          console.log(`✅ Batch ${batchCount} committed: ${batchSize} events`)
          console.log(`   Progress: ${migratedCount}/${totalEvents} (${Math.round(migratedCount/totalEvents*100)}%)`)
          
          // Create new batch
          batch = firestore.batch()
          batchSize = 0
        }
        
      } catch (error) {
        errorCount++
        console.error(`❌ Error processing document:`, error.message)
        // Continue with next document
      }
    }
    
    // Commit any remaining documents in the final batch
    if (batchSize > 0) {
      await batch.commit()
      batchCount++
      console.log(`✅ Final batch ${batchCount} committed: ${batchSize} events`)
    }
    
    console.log('\n' + '='.repeat(60))
    console.log('📋 MIGRATION SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total Events in MongoDB: ${totalEvents}`)
    console.log(`Successfully Migrated: ${migratedCount}`)
    console.log(`Total Batches: ${batchCount}`)
    console.log(`Errors: ${errorCount}`)
    console.log(`Success Rate: ${Math.round(migratedCount/totalEvents*100)}%`)
    console.log('='.repeat(60))
    
    if (migratedCount === totalEvents && errorCount === 0) {
      console.log('\n🎉 Migration completed successfully!\n')
    } else if (errorCount > 0) {
      console.log(`\n⚠️ Migration completed with ${errorCount} errors\n`)
    }
    
    return {
      success: true,
      migratedCount,
      batchCount,
      errorCount,
      totalEvents
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    console.error(error.stack)
    
    return {
      success: false,
      migratedCount,
      batchCount,
      errorCount,
      error: error.message
    }
    
  } finally {
    // Close MongoDB connection
    if (mongoClient) {
      await mongoClient.close()
      console.log('🔌 MongoDB connection closed\n')
    }
  }
}

/**
 * Verify migration by comparing counts
 */
async function verifyMigration(collection = 'users') {
  console.log(`\n🔍 Verifying ${collection} migration...\n`)
  
  let mongoClient = null
  
  try {
    // Initialize Firebase if needed
    if (admin.apps.length === 0) {
      const serviceAccount = require(path.resolve(FIREBASE_KEY_PATH))
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      })
    }
    
    const firestore = admin.firestore()
    
    // Connect to MongoDB
    mongoClient = new MongoClient(MONGODB_URI)
    await mongoClient.connect()
    
    const db = mongoClient.db(DATABASE_NAME)
    const mongoCount = await db.collection(collection).countDocuments()
    
    // Count Firestore documents
    const firestoreSnapshot = await firestore.collection(collection).count().get()
    const firestoreCount = firestoreSnapshot.data().count
    
    console.log('📊 Verification Results:')
    console.log(`   MongoDB ${collection}: ${mongoCount}`)
    console.log(`   Firestore ${collection}: ${firestoreCount}`)
    
    if (mongoCount === firestoreCount) {
      console.log(`   ✅ Counts match! ${collection} migration verified.\n`)
      return true
    } else {
      console.log(`   ⚠️ Count mismatch! Difference: ${Math.abs(mongoCount - firestoreCount)}\n`)
      return false
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message)
    return false
  } finally {
    if (mongoClient) {
      await mongoClient.close()
    }
  }
}

/**
 * Verify all collections
 */
async function verifyAllMigrations() {
  console.log('\n🔍 Verifying ALL migrations...\n')
  
  const usersVerified = await verifyMigration('users')
  const eventsVerified = await verifyMigration('events')
  
  console.log('=' .repeat(60))
  console.log('📋 OVERALL VERIFICATION')
  console.log('=' .repeat(60))
  console.log(`Users: ${usersVerified ? '✅ VERIFIED' : '❌ FAILED'}`)
  console.log(`Events: ${eventsVerified ? '✅ VERIFIED' : '❌ FAILED'}`)
  console.log('=' .repeat(60))
  
  return usersVerified && eventsVerified
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error)
  process.exit(1)
})

// Run migration if executed directly
if (require.main === module) {
  const args = process.argv.slice(2)
  
  if (args[0] === 'verify') {
    // Run verification for specific collection or all
    if (args[1] === 'users') {
      verifyMigration('users')
        .then(() => process.exit(0))
        .catch(() => process.exit(1))
    } else if (args[1] === 'events') {
      verifyMigration('events')
        .then(() => process.exit(0))
        .catch(() => process.exit(1))
    } else {
      // Verify all collections
      verifyAllMigrations()
        .then((success) => process.exit(success ? 0 : 1))
        .catch(() => process.exit(1))
    }
  } else if (args[0] === 'users') {
    // Run users migration only
    migrateUsers()
      .then((result) => {
        if (result.success) {
          console.log('💡 Run "node migrate-to-firestore.js verify users" to verify the migration\n')
        }
        process.exit(result.success ? 0 : 1)
      })
      .catch((error) => {
        console.error('❌ Fatal error:', error)
        process.exit(1)
      })
  } else if (args[0] === 'events') {
    // Run events migration only
    migrateEvents()
      .then((result) => {
        if (result.success) {
          console.log('💡 Run "node migrate-to-firestore.js verify events" to verify the migration\n')
        }
        process.exit(result.success ? 0 : 1)
      })
      .catch((error) => {
        console.error('❌ Fatal error:', error)
        process.exit(1)
      })
  } else if (args[0] === 'all') {
    // Run all migrations
    console.log('🚀 Running ALL migrations...\n')
    
    migrateUsers()
      .then((usersResult) => {
        console.log('\n' + '='.repeat(60))
        console.log('Moving to Events migration...')
        console.log('='.repeat(60))
        return migrateEvents()
      })
      .then((eventsResult) => {
        console.log('\n' + '='.repeat(60))
        console.log('🎉 ALL MIGRATIONS COMPLETED!')
        console.log('='.repeat(60))
        console.log('💡 Run "node migrate-to-firestore.js verify" to verify all migrations\n')
        process.exit(0)
      })
      .catch((error) => {
        console.error('❌ Fatal error:', error)
        process.exit(1)
      })
  } else {
    // Show help
    console.log('\n📋 MongoDB to Firestore Migration Tool\n')
    console.log('Usage:')
    console.log('  node migrate-to-firestore.js users           # Migrate users only')
    console.log('  node migrate-to-firestore.js events          # Migrate events only')
    console.log('  node migrate-to-firestore.js all             # Migrate all collections')
    console.log('  node migrate-to-firestore.js verify          # Verify all migrations')
    console.log('  node migrate-to-firestore.js verify users    # Verify users migration')
    console.log('  node migrate-to-firestore.js verify events   # Verify events migration')
    console.log('')
    process.exit(0)
  }
}

// Export for use in other scripts
module.exports = {
  migrateUsers,
  migrateEvents,
  verifyMigration,
  verifyAllMigrations
}
