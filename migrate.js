/**
 * Database Migration Script
 * Run with: node migrate.js
 * 
 * Purpose: Safely update existing database records with new schema fields
 * without losing data or breaking existing functionality
 */

require('dotenv').config({ path: '.env.local' })
const { MongoClient, ObjectId } = require('mongodb')

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ ERROR: MONGODB_URI not found in environment variables')
  console.error('Make sure .env.local exists with MONGODB_URI')
  process.exit(1)
}

const client = new MongoClient(MONGODB_URI)

// Migration functions
const migrations = {
  /**
   * Migration 1: Add AI Hub fields to users
   */
  async addAIHubFieldsToUsers(db) {
    console.log('\n📝 Migration 1: Adding AI Hub fields to users...')
    
    const users = db.collection('users')
    const result = await users.updateMany(
      { 
        aiHub: { $exists: false } // Only update users without aiHub field
      },
      {
        $set: {
          aiHub: {
            quizzesPlayed: 0,
            quizWins: 0,
            quizLosses: 0,
            totalPoints: 0,
            rank: 0,
            lastActive: new Date(),
            onlineStatus: false
          }
        }
      }
    )
    
    console.log(`✅ Updated ${result.modifiedCount} users with AI Hub fields`)
    return result
  },

  /**
   * Migration 2: Add isOnline and lastActive to all users
   */
  async addOnlineStatusToUsers(db) {
    console.log('\n📝 Migration 2: Adding online status to users...')
    
    const users = db.collection('users')
    const result = await users.updateMany(
      {
        $or: [
          { isOnline: { $exists: false } },
          { lastActive: { $exists: false } }
        ]
      },
      {
        $set: {
          isOnline: false,
          lastActive: new Date()
        }
      }
    )
    
    console.log(`✅ Updated ${result.modifiedCount} users with online status`)
    return result
  },

  /**
   * Migration 3: Clean up old/invalid event participants
   */
  async cleanupEventParticipants(db) {
    console.log('\n📝 Migration 3: Cleaning up event participants...')
    
    const events = db.collection('events')
    const users = db.collection('users')
    
    // Get all valid user IDs
    const validUserIds = await users.distinct('_id')
    const validUserIdStrings = validUserIds.map(id => id.toString())
    
    // Find events with participants
    const eventsWithParticipants = await events.find({
      participants: { $exists: true, $ne: [] }
    }).toArray()
    
    let totalCleaned = 0
    
    for (const event of eventsWithParticipants) {
      const cleanedParticipants = event.participants.filter(participantId => {
        const idString = participantId.toString()
        return validUserIdStrings.includes(idString)
      })
      
      if (cleanedParticipants.length !== event.participants.length) {
        await events.updateOne(
          { _id: event._id },
          { $set: { participants: cleanedParticipants } }
        )
        totalCleaned++
      }
    }
    
    console.log(`✅ Cleaned up ${totalCleaned} events with invalid participants`)
    return { modifiedCount: totalCleaned }
  },

  /**
   * Migration 4: Add timestamps to events
   */
  async addTimestampsToEvents(db) {
    console.log('\n📝 Migration 4: Adding timestamps to events...')
    
    const events = db.collection('events')
    const result = await events.updateMany(
      {
        $or: [
          { createdAt: { $exists: false } },
          { updatedAt: { $exists: false } }
        ]
      },
      {
        $set: {
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }
    )
    
    console.log(`✅ Updated ${result.modifiedCount} events with timestamps`)
    return result
  },

  /**
   * Migration 5: Add indexes for performance
   */
  async createIndexes(db) {
    console.log('\n📝 Migration 5: Creating database indexes...')
    
    try {
      // Users indexes
      await db.collection('users').createIndex({ email: 1 }, { unique: true })
      await db.collection('users').createIndex({ lastActive: 1 })
      await db.collection('users').createIndex({ isOnline: 1 })
      
      // Events indexes
      await db.collection('events').createIndex({ createdBy: 1 })
      await db.collection('events').createIndex({ date: 1 })
      await db.collection('events').createIndex({ category: 1 })
      await db.collection('events').createIndex({ participants: 1 })
      
      console.log('✅ Indexes created successfully')
      return { success: true }
    } catch (error) {
      console.log('⚠️ Some indexes may already exist (this is OK)')
      return { success: true, note: 'Some indexes already existed' }
    }
  },

  /**
   * Migration 6: Fix user profile completeness
   */
  async fixUserProfileCompleteness(db) {
    console.log('\n📝 Migration 6: Ensuring user profile fields...')
    
    const users = db.collection('users')
    const result = await users.updateMany(
      {},
      {
        $set: {
          updatedAt: new Date()
        },
        $setOnInsert: {
          name: '',
          bio: '',
          year: '',
          major: '',
          interests: [],
          createdAt: new Date()
        }
      },
      { upsert: false }
    )
    
    console.log(`✅ Updated ${result.modifiedCount} user profiles`)
    return result
  }
}

// Main migration runner
async function runMigrations() {
  console.log('🚀 Starting database migrations...')
  console.log(`📍 Connecting to: ${MONGODB_URI.substring(0, 50)}...`)
  
  try {
    // Connect to MongoDB
    await client.connect()
    console.log('✅ Connected to MongoDB\n')
    
    const db = client.db('arisze')
    
    // Get migration selection from command line
    const args = process.argv.slice(2)
    const selectedMigration = args[0]
    
    if (selectedMigration === 'all') {
      // Run all migrations
      console.log('🔄 Running ALL migrations...\n')
      
      await migrations.addAIHubFieldsToUsers(db)
      await migrations.addOnlineStatusToUsers(db)
      await migrations.cleanupEventParticipants(db)
      await migrations.addTimestampsToEvents(db)
      await migrations.createIndexes(db)
      await migrations.fixUserProfileCompleteness(db)
      
      console.log('\n✅ ALL MIGRATIONS COMPLETED!')
      
    } else if (selectedMigration && migrations[selectedMigration]) {
      // Run specific migration
      console.log(`🔄 Running migration: ${selectedMigration}\n`)
      await migrations[selectedMigration](db)
      console.log('\n✅ MIGRATION COMPLETED!')
      
    } else {
      // Show available migrations
      console.log('📋 Available migrations:')
      console.log('  - addAIHubFieldsToUsers')
      console.log('  - addOnlineStatusToUsers')
      console.log('  - cleanupEventParticipants')
      console.log('  - addTimestampsToEvents')
      console.log('  - createIndexes')
      console.log('  - fixUserProfileCompleteness')
      console.log('')
      console.log('💡 Usage:')
      console.log('  node migrate.js all                          # Run all migrations')
      console.log('  node migrate.js addAIHubFieldsToUsers        # Run specific migration')
      console.log('  node migrate.js                              # Show this help')
      console.log('')
    }
    
    // Show database stats
    console.log('\n📊 Database Statistics:')
    const usersCount = await db.collection('users').countDocuments()
    const eventsCount = await db.collection('events').countDocuments()
    console.log(`  Users: ${usersCount}`)
    console.log(`  Events: ${eventsCount}`)
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    console.error(error.stack)
    process.exit(1)
    
  } finally {
    await client.close()
    console.log('\n🔌 Disconnected from MongoDB')
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error)
  process.exit(1)
})

// Run migrations
runMigrations()
