/**
 * Firestore User Document Update
 * Updates user document using Firebase Admin SDK
 * Uses doc().update() method with proper error handling
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
 * Update user document in Firestore
 * 
 * @param {Object} req - Express request object (with req.user.uid and req.body)
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} JSON response with updated data or error
 */
async function updateUserDocument(req, res) {
  try {
    // Get user ID from middleware (guaranteed to be a string)
    const userId = req.user.uid
    
    // Get update data from request body
    const updateData = req.body
    
    console.log(`📝 Updating user document: ${userId}`)
    console.log(`📋 Update data:`, updateData)
    
    // Add timestamp to update
    updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp()
    
    // Get document reference and update
    const userDocRef = firestoreDb.collection('users').doc(userId)
    await userDocRef.update(updateData)
    
    console.log(`✅ User document updated successfully: ${userId}`)
    
    // Fetch updated document to return
    const updatedDoc = await userDocRef.get()
    const updatedData = updatedDoc.data()
    
    // Return success response (200)
    return res.status(200).json({
      success: true,
      message: 'User document updated successfully',
      user: {
        id: updatedDoc.id,
        ...updatedData
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Error updating user document:', error)
    
    // Handle specific Firestore errors
    if (error.code === 5) { // NOT_FOUND
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'No user document exists with the provided ID',
        userId: req.user.uid
      })
    }
    
    // Return error response (500)
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to update user document',
      details: error.message
    })
  }
}

/**
 * Basic update implementation without fetching updated document
 */
async function updateUserBasic(req, res) {
  try {
    const userId = req.user.uid
    const updateData = req.body
    
    // Add timestamp
    updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp()
    
    // Update document
    const userDocRef = firestoreDb.collection('users').doc(userId)
    await userDocRef.update(updateData)
    
    // Return success (200)
    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      userId: userId
    })
    
  } catch (error) {
    console.error('Update error:', error)
    
    // Return error (500)
    return res.status(500).json({
      success: false,
      error: 'Failed to update user',
      message: error.message
    })
  }
}

/**
 * Update with validation
 */
async function updateUserWithValidation(req, res) {
  try {
    const userId = req.user.uid
    const updateData = req.body
    
    // Validate update data
    const allowedFields = ['name', 'bio', 'major', 'year', 'interests', 'avatar']
    const sanitizedData = {}
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        sanitizedData[field] = updateData[field]
      }
    }
    
    // Check if there's data to update
    if (Object.keys(sanitizedData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'No valid fields to update'
      })
    }
    
    // Add timestamp
    sanitizedData.updatedAt = admin.firestore.FieldValue.serverTimestamp()
    
    // Update document
    const userDocRef = firestoreDb.collection('users').doc(userId)
    await userDocRef.update(sanitizedData)
    
    // Fetch and return updated document
    const updatedDoc = await userDocRef.get()
    
    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: updatedDoc.id,
        ...updatedDoc.data()
      }
    })
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

/**
 * Update specific fields only
 */
async function updateUserFields(req, res) {
  try {
    const userId = req.user.uid
    const { name, bio, major } = req.body
    
    // Build update object with only provided fields
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
    
    if (name !== undefined) updateData.name = name
    if (bio !== undefined) updateData.bio = bio
    if (major !== undefined) updateData.major = major
    
    // Update document
    const userDocRef = firestoreDb.collection('users').doc(userId)
    await userDocRef.update(updateData)
    
    return res.status(200).json({
      success: true,
      message: 'User fields updated',
      updatedFields: Object.keys(updateData).filter(k => k !== 'updatedAt')
    })
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

/**
 * Increment numeric field (e.g., profile views)
 */
async function incrementUserField(req, res) {
  try {
    const userId = req.user.uid
    const { field, value = 1 } = req.body
    
    const userDocRef = firestoreDb.collection('users').doc(userId)
    await userDocRef.update({
      [field]: admin.firestore.FieldValue.increment(value),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    })
    
    return res.status(200).json({
      success: true,
      message: `Field ${field} incremented by ${value}`
    })
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

/**
 * Add to array field
 */
async function addToUserArray(req, res) {
  try {
    const userId = req.user.uid
    const { field, value } = req.body
    
    const userDocRef = firestoreDb.collection('users').doc(userId)
    await userDocRef.update({
      [field]: admin.firestore.FieldValue.arrayUnion(value),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    })
    
    return res.status(200).json({
      success: true,
      message: `Value added to ${field} array`
    })
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

// Export functions
module.exports = {
  firestoreDb,
  updateUserDocument,
  updateUserBasic,
  updateUserWithValidation,
  updateUserFields,
  incrementUserField,
  addToUserArray
}

/**
 * ============================================================
 * USAGE EXAMPLES
 * ============================================================
 */

// Example 1: Basic update route
/*
const express = require('express')
const { verifyNextAuthSession } = require('./middleware/verifyNextAuthSession')
const { updateUserDocument } = require('./firestore-user-update')

const app = express()
app.use(express.json())

app.put('/api/user/profile', verifyNextAuthSession, updateUserDocument)
*/

// Example 2: Inline implementation
/*
app.put('/api/user/update', verifyNextAuthSession, async (req, res) => {
  try {
    const userId = req.user.uid
    const updateData = req.body
    
    // Add timestamp
    updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp()
    
    // Update document
    const userDocRef = firestoreDb.collection('users').doc(userId)
    await userDocRef.update(updateData)
    
    // Success (200)
    return res.status(200).json({
      success: true,
      message: 'User updated successfully'
    })
    
  } catch (error) {
    // Error (500)
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
})
*/

// Example 3: Update with validation
/*
app.put('/api/user/profile', verifyNextAuthSession, async (req, res) => {
  try {
    const userId = req.user.uid
    const { name, bio, major } = req.body
    
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
    
    if (name) updateData.name = name
    if (bio) updateData.bio = bio
    if (major) updateData.major = major
    
    const userDocRef = firestoreDb.collection('users').doc(userId)
    await userDocRef.update(updateData)
    
    return res.status(200).json({ success: true })
    
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})
*/

// Example 4: Fetch and return updated document
/*
app.put('/api/user/profile', verifyNextAuthSession, async (req, res) => {
  try {
    const userId = req.user.uid
    const updateData = req.body
    updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp()
    
    const userDocRef = firestoreDb.collection('users').doc(userId)
    await userDocRef.update(updateData)
    
    // Fetch updated document
    const updatedDoc = await userDocRef.get()
    
    return res.status(200).json({
      success: true,
      user: { id: updatedDoc.id, ...updatedDoc.data() }
    })
    
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})
*/
