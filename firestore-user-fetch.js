/**
 * Firestore User Document Fetcher
 * Demonstrates fetching a single user document from Firestore
 * using Firebase Admin SDK with proper error handling
 */

const admin = require('firebase-admin')
const path = require('path')

// Initialize Firebase Admin if not already initialized
if (admin.apps.length === 0) {
  const serviceAccount = require(path.resolve('./serviceAccountKey.json.json'))
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  })
}

// Get Firestore database instance
const firestoreDb = admin.firestore()

/**
 * Fetch a single user document from Firestore
 * 
 * @param {Object} req - Express request object (with req.user.uid from middleware)
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} JSON response with user data or error
 */
async function getUserDocument(req, res) {
  try {
    // Get user ID from middleware (guaranteed to be a string)
    const userId = req.user.uid
    
    console.log(`🔍 Fetching user document: ${userId}`)
    
    // Fetch document from Firestore 'users' collection
    const userDocRef = firestoreDb.collection('users').doc(userId)
    const userDoc = await userDocRef.get()
    
    // Check if document exists
    if (!userDoc.exists) {
      console.log(`❌ User not found: ${userId}`)
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: `No user document found with ID: ${userId}`,
        userId: userId
      })
    }
    
    // Document exists - get data
    const userData = userDoc.data()
    
    console.log(`✅ User found: ${userId}`)
    
    // Return document data with 200 status
    return res.status(200).json({
      success: true,
      user: {
        id: userDoc.id,
        ...userData
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Error fetching user document:', error)
    
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to fetch user document',
      details: error.message
    })
  }
}

/**
 * Express route handler - Complete implementation
 * Combines middleware and Firestore fetch
 */
async function getUserProfile(req, res) {
  try {
    const userId = req.user.uid
    
    // Fetch document from Firestore
    const userDocRef = firestoreDb.collection('users').doc(userId)
    const userDoc = await userDocRef.get()
    
    // Handle not found
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: `No user document found with ID: ${userId}`
      })
    }
    
    // Return user data
    const userData = userDoc.data()
    
    return res.status(200).json({
      success: true,
      user: {
        id: userDoc.id,
        ...userData
      }
    })
    
  } catch (error) {
    console.error('Error fetching user:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    })
  }
}

/**
 * Reusable function to get user data by ID
 * Can be used in any part of your application
 * 
 * @param {string} userId - User document ID
 * @returns {Promise<Object|null>} User data or null if not found
 */
async function getUserById(userId) {
  try {
    const userDocRef = firestoreDb.collection('users').doc(userId)
    const userDoc = await userDocRef.get()
    
    if (!userDoc.exists) {
      console.log(`User ${userId} not found`)
      return null
    }
    
    return {
      id: userDoc.id,
      ...userDoc.data()
    }
  } catch (error) {
    console.error('Error fetching user by ID:', error)
    throw error
  }
}

/**
 * Fetch user with specific fields only
 * More efficient when you don't need all data
 * 
 * @param {string} userId - User document ID
 * @param {Array<string>} fields - Fields to select
 * @returns {Promise<Object|null>} User data with selected fields
 */
async function getUserWithFields(userId, fields = []) {
  try {
    const userDocRef = firestoreDb.collection('users').doc(userId)
    const userDoc = await userDocRef.get()
    
    if (!userDoc.exists) {
      return null
    }
    
    const userData = userDoc.data()
    
    // If fields specified, return only those fields
    if (fields.length > 0) {
      const filteredData = { id: userDoc.id }
      fields.forEach(field => {
        if (userData[field] !== undefined) {
          filteredData[field] = userData[field]
        }
      })
      return filteredData
    }
    
    return {
      id: userDoc.id,
      ...userData
    }
  } catch (error) {
    console.error('Error fetching user with fields:', error)
    throw error
  }
}

/**
 * Check if user document exists
 * Lightweight check without fetching all data
 * 
 * @param {string} userId - User document ID
 * @returns {Promise<boolean>} True if exists, false otherwise
 */
async function userExists(userId) {
  try {
    const userDocRef = firestoreDb.collection('users').doc(userId)
    const userDoc = await userDocRef.get()
    return userDoc.exists
  } catch (error) {
    console.error('Error checking user existence:', error)
    return false
  }
}

// Export functions
module.exports = {
  firestoreDb,
  getUserDocument,
  getUserProfile,
  getUserById,
  getUserWithFields,
  userExists
}

/**
 * ============================================================
 * USAGE EXAMPLES
 * ============================================================
 */

// Example 1: Basic Express route with middleware
/*
const express = require('express')
const { verifyNextAuthSession } = require('./middleware/verifyNextAuthSession')
const { getUserDocument } = require('./firestore-user-fetch')

const app = express()

app.get('/api/user/profile', verifyNextAuthSession, getUserDocument)
*/

// Example 2: Full implementation in route
/*
app.get('/api/user/me', verifyNextAuthSession, async (req, res) => {
  try {
    const userId = req.user.uid  // From middleware
    
    // Fetch from Firestore
    const userDocRef = firestoreDb.collection('users').doc(userId)
    const userDoc = await userDocRef.get()
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    return res.status(200).json({ 
      success: true,
      user: { id: userDoc.id, ...userDoc.data() }
    })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})
*/

// Example 3: Using helper function
/*
app.get('/api/user/profile', verifyNextAuthSession, async (req, res) => {
  try {
    const userData = await getUserById(req.user.uid)
    
    if (!userData) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    return res.status(200).json({ success: true, user: userData })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})
*/

// Example 4: Fetch specific fields only
/*
app.get('/api/user/basic', verifyNextAuthSession, async (req, res) => {
  try {
    const userData = await getUserWithFields(req.user.uid, [
      'name', 
      'email', 
      'avatar'
    ])
    
    if (!userData) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    return res.status(200).json({ success: true, user: userData })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})
*/

// Example 5: Check if user exists before complex operation
/*
app.post('/api/user/upgrade', verifyNextAuthSession, async (req, res) => {
  const userId = req.user.uid
  
  // Quick existence check
  const exists = await userExists(userId)
  if (!exists) {
    return res.status(404).json({ error: 'User not found' })
  }
  
  // Proceed with upgrade logic...
  return res.status(200).json({ success: true })
})
*/
