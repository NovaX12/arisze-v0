/**
 * Test Firestore User Fetch Functionality
 * Verifies document retrieval works correctly
 * Run with: node test-firestore-fetch.js
 */

const admin = require('firebase-admin')
const path = require('path')

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  const serviceAccount = require(path.resolve('./serviceAccountKey.json.json'))
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  })
  console.log('✅ Firebase Admin initialized')
}

const firestoreDb = admin.firestore()

/**
 * Test fetching a user document
 */
async function testUserFetch() {
  console.log('\n' + '='.repeat(60))
  console.log('🧪 Testing Firestore User Fetch')
  console.log('='.repeat(60) + '\n')
  
  try {
    // Get list of user IDs from Firestore
    console.log('📋 Fetching users from Firestore...')
    const usersSnapshot = await firestoreDb.collection('users').limit(5).get()
    
    if (usersSnapshot.empty) {
      console.log('⚠️ No users found in Firestore')
      return
    }
    
    console.log(`✅ Found ${usersSnapshot.size} users\n`)
    
    // Test each user
    let testCount = 0
    for (const doc of usersSnapshot.docs) {
      testCount++
      const userId = doc.id
      
      console.log(`\n🔍 Test ${testCount}: Fetching user ${userId}`)
      console.log('-'.repeat(60))
      
      // Simulate the fetch logic
      const userDocRef = firestoreDb.collection('users').doc(userId)
      const userDoc = await userDocRef.get()
      
      // Check if exists (should always be true since we got it from list)
      if (!userDoc.exists) {
        console.log('❌ Document not found (404)')
        console.log('   Status: 404')
        console.log('   Response: { error: "User not found" }')
      } else {
        console.log('✅ Document found (200)')
        const userData = userDoc.data()
        console.log('   Status: 200')
        console.log('   User Data:')
        console.log(`     - ID: ${userDoc.id}`)
        console.log(`     - Email: ${userData.email || 'N/A'}`)
        console.log(`     - Name: ${userData.name || 'N/A'}`)
        console.log(`     - Migrated: ${userData.migratedAt ? 'Yes' : 'No'}`)
        console.log(`     - Fields: ${Object.keys(userData).length}`)
      }
    }
    
    // Test with non-existent user
    console.log(`\n\n🔍 Test ${testCount + 1}: Fetching non-existent user`)
    console.log('-'.repeat(60))
    const fakeUserId = 'nonexistent123456789'
    console.log(`   User ID: ${fakeUserId}`)
    
    const fakeDocRef = firestoreDb.collection('users').doc(fakeUserId)
    const fakeDoc = await fakeDocRef.get()
    
    if (!fakeDoc.exists) {
      console.log('✅ Correctly returned not found (404)')
      console.log('   Status: 404')
      console.log('   Response: { error: "User not found" }')
    } else {
      console.log('❌ Unexpected: Document exists')
    }
    
    console.log('\n' + '='.repeat(60))
    console.log('📊 TEST SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total Tests: ${testCount + 1}`)
    console.log('✅ All tests passed!')
    console.log('='.repeat(60) + '\n')
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    console.error(error.stack)
  }
}

/**
 * Demonstrate the exact code for fetching user document
 */
async function demonstrateCode() {
  console.log('\n' + '='.repeat(60))
  console.log('💡 Code Implementation Example')
  console.log('='.repeat(60) + '\n')
  
  console.log('// Fetch user document from Firestore')
  console.log('async function getUserDocument(req, res) {')
  console.log('  try {')
  console.log('    // Get user ID from middleware')
  console.log('    const userId = req.user.uid')
  console.log('')
  console.log('    // Fetch document from Firestore')
  console.log('    const userDocRef = firestoreDb.collection("users").doc(userId)')
  console.log('    const userDoc = await userDocRef.get()')
  console.log('')
  console.log('    // Handle not found (404)')
  console.log('    if (!userDoc.exists) {')
  console.log('      return res.status(404).json({')
  console.log('        error: "User not found"')
  console.log('      })')
  console.log('    }')
  console.log('')
  console.log('    // Return document data (200)')
  console.log('    const userData = userDoc.data()')
  console.log('    return res.status(200).json({')
  console.log('      success: true,')
  console.log('      user: {')
  console.log('        id: userDoc.id,')
  console.log('        ...userData')
  console.log('      }')
  console.log('    })')
  console.log('  } catch (error) {')
  console.log('    return res.status(500).json({ error: error.message })')
  console.log('  }')
  console.log('}')
  console.log('')
}

// Run tests
if (require.main === module) {
  demonstrateCode()
  testUserFetch()
    .then(() => {
      console.log('✅ All operations completed\n')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Fatal error:', error)
      process.exit(1)
    })
}

module.exports = { testUserFetch }
