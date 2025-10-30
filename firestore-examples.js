/**
 * Complete Firestore User Fetch Example
 * Demonstrates the full flow from authentication to Firestore data retrieval
 */

const express = require('express')
const { verifyNextAuthSession } = require('./middleware/verifyNextAuthSession')
const admin = require('firebase-admin')
const path = require('path')

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  const serviceAccount = require(path.resolve('./serviceAccountKey.json.json'))
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  })
}

const firestoreDb = admin.firestore()

const app = express()
app.use(express.json())

/**
 * ============================================================
 * EXAMPLE 1: Basic Firestore Fetch
 * Fetches user document using req.user.uid from middleware
 * Handles 404 (not found) and 200 (success) cases
 * ============================================================
 */
app.get('/api/user/basic', verifyNextAuthSession, async (req, res) => {
  try {
    // Step 1: Get user ID from middleware (always a string)
    const userId = req.user.uid
    
    // Step 2: Get document reference
    const userDocRef = firestoreDb.collection('users').doc(userId)
    
    // Step 3: Fetch the document
    const userDoc = await userDocRef.get()
    
    // Step 4: Check if document exists
    if (!userDoc.exists) {
      // Document not found - return 404
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: `No user document found with ID: ${userId}`
      })
    }
    
    // Step 5: Get document data
    const userData = userDoc.data()
    
    // Step 6: Return success with data - 200
    return res.status(200).json({
      success: true,
      user: {
        id: userDoc.id,
        ...userData
      }
    })
    
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    })
  }
})

/**
 * ============================================================
 * EXAMPLE 2: Fetch with Field Selection
 * Only returns specific fields from the document
 * More efficient when you don't need all data
 * ============================================================
 */
app.get('/api/user/public-info', verifyNextAuthSession, async (req, res) => {
  try {
    const userId = req.user.uid
    const userDocRef = firestoreDb.collection('users').doc(userId)
    const userDoc = await userDocRef.get()
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }
    
    const userData = userDoc.data()
    
    // Return only public fields
    return res.status(200).json({
      success: true,
      user: {
        id: userDoc.id,
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar,
        bio: userData.bio
      }
    })
    
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

/**
 * ============================================================
 * EXAMPLE 3: Fetch with Additional Processing
 * Fetches user and adds computed fields
 * ============================================================
 */
app.get('/api/user/complete', verifyNextAuthSession, async (req, res) => {
  try {
    const userId = req.user.uid
    const userDocRef = firestoreDb.collection('users').doc(userId)
    const userDoc = await userDocRef.get()
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    const userData = userDoc.data()
    
    // Add computed fields
    const accountAge = userData.createdAt 
      ? Math.floor((Date.now() - new Date(userData.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0
    
    return res.status(200).json({
      success: true,
      user: {
        id: userDoc.id,
        ...userData,
        accountAgeDays: accountAge,
        isNewUser: accountAge < 30,
        lastFetched: new Date().toISOString()
      }
    })
    
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

/**
 * ============================================================
 * EXAMPLE 4: Fetch User and Related Data
 * Fetches user plus their events from separate collection
 * ============================================================
 */
app.get('/api/user/with-events', verifyNextAuthSession, async (req, res) => {
  try {
    const userId = req.user.uid
    
    // Fetch user document
    const userDocRef = firestoreDb.collection('users').doc(userId)
    const userDoc = await userDocRef.get()
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    const userData = userDoc.data()
    
    // Fetch user's events
    const eventsSnapshot = await firestoreDb.collection('events')
      .where('createdBy', '==', userId)
      .limit(10)
      .get()
    
    const userEvents = []
    eventsSnapshot.forEach(doc => {
      userEvents.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    return res.status(200).json({
      success: true,
      user: {
        id: userDoc.id,
        ...userData
      },
      events: userEvents,
      eventCount: userEvents.length
    })
    
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

/**
 * ============================================================
 * EXAMPLE 5: Fetch with Caching
 * Checks cache first, then Firestore
 * ============================================================
 */
const userCache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

app.get('/api/user/cached', verifyNextAuthSession, async (req, res) => {
  try {
    const userId = req.user.uid
    
    // Check cache first
    const cached = userCache.get(userId)
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      console.log('✅ Cache hit')
      return res.status(200).json({
        success: true,
        user: cached.data,
        source: 'cache'
      })
    }
    
    // Cache miss - fetch from Firestore
    console.log('🔄 Cache miss - fetching from Firestore')
    const userDocRef = firestoreDb.collection('users').doc(userId)
    const userDoc = await userDocRef.get()
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    const userData = {
      id: userDoc.id,
      ...userDoc.data()
    }
    
    // Store in cache
    userCache.set(userId, {
      data: userData,
      timestamp: Date.now()
    })
    
    return res.status(200).json({
      success: true,
      user: userData,
      source: 'firestore'
    })
    
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

/**
 * ============================================================
 * EXAMPLE 6: Update User Document
 * Uses doc().update() method with req.body data
 * Handles 200 (success) and 500 (error)
 * ============================================================
 */
app.put('/api/user/update', verifyNextAuthSession, async (req, res) => {
  try {
    // Get user ID from middleware
    const userId = req.user.uid
    
    // Get update data from request body
    const updateData = req.body
    
    // Add timestamp
    updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp()
    
    console.log(`📝 Updating user ${userId}:`, updateData)
    
    // Update document using doc().update()
    const userDocRef = firestoreDb.collection('users').doc(userId)
    await userDocRef.update(updateData)
    
    console.log(`✅ User ${userId} updated successfully`)
    
    // Fetch updated document
    const updatedDoc = await userDocRef.get()
    
    // Return success (200)
    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: updatedDoc.id,
        ...updatedDoc.data()
      }
    })
    
  } catch (error) {
    console.error('❌ Update error:', error)
    
    // Return error (500)
    return res.status(500).json({
      success: false,
      error: 'Failed to update user',
      message: error.message
    })
  }
})

/**
 * ============================================================
 * EXAMPLE 7: Update with Field Validation
 * Only allows specific fields to be updated
 * ============================================================
 */
app.put('/api/user/profile', verifyNextAuthSession, async (req, res) => {
  try {
    const userId = req.user.uid
    const { name, bio, major, year } = req.body
    
    // Build update data with only provided fields
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
    
    if (name !== undefined) updateData.name = name
    if (bio !== undefined) updateData.bio = bio
    if (major !== undefined) updateData.major = major
    if (year !== undefined) updateData.year = year
    
    // Update using doc().update()
    const userDocRef = firestoreDb.collection('users').doc(userId)
    await userDocRef.update(updateData)
    
    // Success (200)
    return res.status(200).json({
      success: true,
      message: 'Profile updated',
      updatedFields: Object.keys(updateData).filter(k => k !== 'updatedAt')
    })
    
  } catch (error) {
    // Error (500)
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * ============================================================
 * Start Server
 * ============================================================
 */
const PORT = 3002

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60))
  console.log('🔥 Firestore User Fetch Examples Server')
  console.log('='.repeat(60))
  console.log(`📍 Server: http://localhost:${PORT}`)
  console.log('')
  console.log('📋 Endpoints:')
  console.log('  GET  /api/user/basic          - Basic fetch (404/200)')
  console.log('  GET  /api/user/public-info    - Field selection')
  console.log('  GET  /api/user/complete       - With computed fields')
  console.log('  GET  /api/user/with-events    - With related data')
  console.log('  GET  /api/user/cached         - With caching')
  console.log('  PUT  /api/user/update         - Update document')
  console.log('  PUT  /api/user/profile        - Update with validation')
  console.log('  GET  /api/events              - List events (first 20)')
  console.log('  GET  /api/events/upcoming     - Upcoming events')
  console.log('='.repeat(60) + '\n')
})

/**
 * ============================================================
 * EXAMPLE 8: Get Events List (First 20, Ordered by Date)
 * Returns list of events with proper ordering
 * ============================================================
 */
app.get('/api/events', async (req, res) => {
  try {
    console.log('📋 Fetching events list...')
    
    // Fetch first 20 events ordered by date (ascending)
    const eventsSnapshot = await firestoreDb
      .collection('events')
      .orderBy('date', 'asc')
      .limit(20)
      .get()
    
    // Check if any events exist
    if (eventsSnapshot.empty) {
      console.log('ℹ️ No events found')
      return res.status(200).json({
        success: true,
        message: 'No events found',
        events: [],
        count: 0
      })
    }
    
    // Map documents to array with IDs
    const events = []
    eventsSnapshot.forEach(doc => {
      events.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    console.log(`✅ Successfully fetched ${events.length} events`)
    
    // Return success (200)
    return res.status(200).json({
      success: true,
      message: 'Events fetched successfully',
      events: events,
      count: events.length
    })
    
  } catch (error) {
    console.error('❌ Error fetching events:', error)
    
    // Return error (500)
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch events',
      message: error.message
    })
  }
})

/**
 * ============================================================
 * EXAMPLE 9: Get Upcoming Events
 * Fetches events with date >= current date
 * ============================================================
 */
app.get('/api/events/upcoming', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20
    const now = new Date()
    
    console.log(`📅 Fetching upcoming events (limit: ${limit})`)
    
    // Fetch upcoming events
    const eventsSnapshot = await firestoreDb
      .collection('events')
      .where('date', '>=', now)
      .orderBy('date', 'asc')
      .limit(limit)
      .get()
    
    const events = []
    eventsSnapshot.forEach(doc => {
      events.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    console.log(`✅ Found ${events.length} upcoming events`)
    
    // Success (200)
    return res.status(200).json({
      success: true,
      message: 'Upcoming events fetched successfully',
      events: events,
      count: events.length
    })
    
  } catch (error) {
    console.error('❌ Error fetching upcoming events:', error)
    // Error (500)
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

module.exports = app

