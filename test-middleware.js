/**
 * Test Express Server with NextAuth Session Middleware
 * Demonstrates verifyNextAuthSession middleware usage
 * 
 * Run with: node test-middleware.js
 */

const express = require('express')
const { verifyNextAuthSession, optionalAuth } = require('./middleware/verifyNextAuthSession')
const { getUserDocument, getUserById, firestoreDb } = require('./firestore-user-fetch')

// Create Express app
const app = express()
const PORT = 3001

// Middleware
app.use(express.json())

// Test routes

/**
 * Public route - no authentication required
 */
app.get('/api/public', (req, res) => {
  res.json({
    success: true,
    message: 'This is a public endpoint',
    timestamp: new Date().toISOString()
  })
})

/**
 * Public route with optional authentication
 * Shows user info if logged in, but doesn't block if not
 */
app.get('/api/public-with-user', optionalAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Public endpoint with optional user info',
    authenticated: !!req.user,
    user: req.user ? {
      uid: req.user.uid,
      email: req.user.email,
      name: req.user.name
    } : null,
    timestamp: new Date().toISOString()
  })
})

/**
 * Protected route - requires authentication
 * Returns 401 if no valid session
 */
app.get('/api/protected', verifyNextAuthSession, (req, res) => {
  res.json({
    success: true,
    message: 'You are authenticated!',
    user: {
      uid: req.user.uid,
      email: req.user.email,
      name: req.user.name,
      image: req.user.image
    },
    timestamp: new Date().toISOString()
  })
})

/**
 * Protected POST route - requires authentication
 */
app.post('/api/protected/data', verifyNextAuthSession, (req, res) => {
  const { data } = req.body
  
  res.json({
    success: true,
    message: 'Data received',
    receivedData: data,
    processedBy: req.user.uid,
    userEmail: req.user.email,
    timestamp: new Date().toISOString()
  })
})

/**
 * User profile endpoint - requires authentication
 * Fetches from Firestore using req.user.uid
 */
app.get('/api/user/profile', verifyNextAuthSession, getUserDocument)

/**
 * Alternative: User profile with custom implementation
 */
app.get('/api/user/me', verifyNextAuthSession, async (req, res) => {
  try {
    const userId = req.user.uid
    
    console.log(`📥 Fetching Firestore document for user: ${userId}`)
    
    // Fetch from Firestore
    const userDocRef = firestoreDb.collection('users').doc(userId)
    const userDoc = await userDocRef.get()
    
    // Handle not found (404)
    if (!userDoc.exists) {
      console.log(`❌ Document not found: ${userId}`)
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: `No user document found with ID: ${userId}`,
        userId: userId
      })
    }
    
    // Document found - return data (200)
    const userData = userDoc.data()
    console.log(`✅ Document found: ${userId}`)
    
    return res.status(200).json({
      success: true,
      message: 'User document retrieved successfully',
      user: {
        id: userDoc.id,
        ...userData
      },
      source: 'firestore',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Firestore fetch error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    })
  }
})

/**
 * User profile with helper function
 */
app.get('/api/user/data', verifyNextAuthSession, async (req, res) => {
  try {
    const userData = await getUserById(req.user.uid)
    
    if (!userData) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }
    
    return res.status(200).json({
      success: true,
      user: userData
    })
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'NextAuth Middleware Test Server',
    timestamp: new Date().toISOString()
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err)
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  })
})

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60))
    console.log('🚀 Test Express Server with NextAuth Middleware')
    console.log('='.repeat(60))
    console.log(`📍 Server running on: http://localhost:${PORT}`)
    console.log('')
    console.log('📋 Available endpoints:')
    console.log(`   GET  /health                    - Health check`)
    console.log(`   GET  /api/public                - Public endpoint`)
    console.log(`   GET  /api/public-with-user      - Optional auth`)
    console.log(`   GET  /api/protected             - Protected (requires auth)`)
    console.log(`   POST /api/protected/data        - Protected POST`)
    console.log(`   GET  /api/user/profile          - Firestore user fetch (main)`)
    console.log(`   GET  /api/user/me               - Firestore user fetch (alt)`)
    console.log(`   GET  /api/user/data             - Firestore with helper`)
    console.log('')
    console.log('💡 Test with curl:')
    console.log(`   curl http://localhost:${PORT}/api/public`)
    console.log(`   curl http://localhost:${PORT}/api/protected`)
    console.log('')
    console.log('🔐 For protected routes, include NextAuth session cookie')
    console.log('   or use Authorization: Bearer <token> header')
    console.log('='.repeat(60) + '\n')
  })
}

module.exports = app
