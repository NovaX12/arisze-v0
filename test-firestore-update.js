/**
 * ============================================================
 * TEST: Firestore User Document Update
 * Tests doc().update() method with various scenarios
 * ============================================================
 */

import admin from 'firebase-admin'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load service account key
const serviceAccountKey = JSON.parse(
  readFileSync(join(__dirname, 'serviceAccountKey.json.json'), 'utf-8')
)

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey)
  })
}

const firestoreDb = admin.firestore()

// Test counters
let totalTests = 0
let passedTests = 0
let failedTests = 0

/**
 * Test helper function
 */
function logTest(testName, success, details = '') {
  totalTests++
  if (success) {
    passedTests++
    console.log(`✅ PASS: ${testName}`)
    if (details) console.log(`   ${details}`)
  } else {
    failedTests++
    console.error(`❌ FAIL: ${testName}`)
    if (details) console.error(`   ${details}`)
  }
  console.log('')
}

/**
 * ============================================================
 * TEST 1: Basic Update - Update single field
 * ============================================================
 */
async function test1_BasicUpdate() {
  console.log('🧪 TEST 1: Basic Update - Update single field')
  try {
    // Get first user
    const usersSnapshot = await firestoreDb.collection('users').limit(1).get()
    if (usersSnapshot.empty) {
      logTest('Test 1: Basic Update', false, 'No users found in database')
      return
    }
    
    const userId = usersSnapshot.docs[0].id
    const originalData = usersSnapshot.docs[0].data()
    
    // Update bio field
    const userDocRef = firestoreDb.collection('users').doc(userId)
    await userDocRef.update({
      bio: 'Updated bio from test',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    })
    
    // Verify update
    const updatedDoc = await userDocRef.get()
    const updatedData = updatedDoc.data()
    
    const success = updatedData.bio === 'Updated bio from test'
    logTest(
      'Test 1: Basic Update',
      success,
      `User: ${userId}, Bio updated: ${success}`
    )
    
    // Restore original data
    if (originalData.bio !== undefined) {
      await userDocRef.update({ bio: originalData.bio })
    }
    
  } catch (error) {
    logTest('Test 1: Basic Update', false, `Error: ${error.message}`)
  }
}

/**
 * ============================================================
 * TEST 2: Multiple Field Update
 * ============================================================
 */
async function test2_MultipleFieldUpdate() {
  console.log('🧪 TEST 2: Multiple Field Update')
  try {
    const usersSnapshot = await firestoreDb.collection('users').limit(1).get()
    const userId = usersSnapshot.docs[0].id
    const originalData = usersSnapshot.docs[0].data()
    
    // Update multiple fields
    const userDocRef = firestoreDb.collection('users').doc(userId)
    await userDocRef.update({
      bio: 'Multi-field test bio',
      major: 'Test Major',
      year: 3,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    })
    
    // Verify update
    const updatedDoc = await userDocRef.get()
    const updatedData = updatedDoc.data()
    
    const success = 
      updatedData.bio === 'Multi-field test bio' &&
      updatedData.major === 'Test Major' &&
      updatedData.year === 3
    
    logTest(
      'Test 2: Multiple Field Update',
      success,
      `Updated: bio, major, year`
    )
    
    // Restore
    await userDocRef.update({
      bio: originalData.bio || '',
      major: originalData.major || '',
      year: originalData.year || 1
    })
    
  } catch (error) {
    logTest('Test 2: Multiple Field Update', false, `Error: ${error.message}`)
  }
}

/**
 * ============================================================
 * TEST 3: Update Non-Existent Document (Should Fail)
 * ============================================================
 */
async function test3_UpdateNonExistent() {
  console.log('🧪 TEST 3: Update Non-Existent Document')
  try {
    const fakeUserId = 'non_existent_user_12345'
    const userDocRef = firestoreDb.collection('users').doc(fakeUserId)
    
    try {
      await userDocRef.update({ bio: 'This should fail' })
      logTest('Test 3: Update Non-Existent', false, 'Should have thrown error')
    } catch (error) {
      // Expected error
      const success = error.code === 5 || error.message.includes('NOT_FOUND')
      logTest(
        'Test 3: Update Non-Existent',
        success,
        `Correctly threw error: ${error.message}`
      )
    }
    
  } catch (error) {
    logTest('Test 3: Update Non-Existent', false, `Unexpected error: ${error.message}`)
  }
}

/**
 * ============================================================
 * TEST 4: Conditional Update (Check Before Update)
 * ============================================================
 */
async function test4_ConditionalUpdate() {
  console.log('🧪 TEST 4: Conditional Update')
  try {
    const usersSnapshot = await firestoreDb.collection('users').limit(1).get()
    const userId = usersSnapshot.docs[0].id
    const userDocRef = firestoreDb.collection('users').doc(userId)
    
    // Check if document exists before updating
    const docSnapshot = await userDocRef.get()
    if (!docSnapshot.exists) {
      logTest('Test 4: Conditional Update', false, 'Document not found')
      return
    }
    
    // Only update if user has email
    const userData = docSnapshot.data()
    if (userData.email) {
      await userDocRef.update({
        bio: 'Conditional update test',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      })
      
      const updatedDoc = await userDocRef.get()
      const success = updatedDoc.data().bio === 'Conditional update test'
      logTest(
        'Test 4: Conditional Update',
        success,
        `Updated user with email: ${userData.email}`
      )
      
      // Restore
      await userDocRef.update({ bio: userData.bio || '' })
    } else {
      logTest('Test 4: Conditional Update', true, 'Skipped: User has no email')
    }
    
  } catch (error) {
    logTest('Test 4: Conditional Update', false, `Error: ${error.message}`)
  }
}

/**
 * ============================================================
 * TEST 5: Batch Update - Update multiple documents
 * ============================================================
 */
async function test5_BatchUpdate() {
  console.log('🧪 TEST 5: Batch Update')
  try {
    // Get first 3 users
    const usersSnapshot = await firestoreDb.collection('users').limit(3).get()
    const userIds = usersSnapshot.docs.map(doc => doc.id)
    const originalData = {}
    
    // Store original data
    usersSnapshot.docs.forEach(doc => {
      originalData[doc.id] = doc.data()
    })
    
    // Batch update
    const batch = firestoreDb.batch()
    const testTag = 'batch_test_tag'
    
    userIds.forEach(userId => {
      const userDocRef = firestoreDb.collection('users').doc(userId)
      batch.update(userDocRef, {
        testTag: testTag,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      })
    })
    
    await batch.commit()
    
    // Verify updates
    let allUpdated = true
    for (const userId of userIds) {
      const doc = await firestoreDb.collection('users').doc(userId).get()
      if (doc.data().testTag !== testTag) {
        allUpdated = false
        break
      }
    }
    
    logTest(
      'Test 5: Batch Update',
      allUpdated,
      `Updated ${userIds.length} users with batch operation`
    )
    
    // Clean up - remove test tag
    const cleanupBatch = firestoreDb.batch()
    userIds.forEach(userId => {
      const userDocRef = firestoreDb.collection('users').doc(userId)
      cleanupBatch.update(userDocRef, {
        testTag: admin.firestore.FieldValue.delete()
      })
    })
    await cleanupBatch.commit()
    
  } catch (error) {
    logTest('Test 5: Batch Update', false, `Error: ${error.message}`)
  }
}

/**
 * ============================================================
 * TEST 6: Field Deletion with FieldValue.delete()
 * ============================================================
 */
async function test6_FieldDeletion() {
  console.log('🧪 TEST 6: Field Deletion')
  try {
    const usersSnapshot = await firestoreDb.collection('users').limit(1).get()
    const userId = usersSnapshot.docs[0].id
    const userDocRef = firestoreDb.collection('users').doc(userId)
    const originalData = usersSnapshot.docs[0].data()
    
    // Add a temporary field
    await userDocRef.update({ tempField: 'temporary data' })
    
    // Verify it was added
    let doc = await userDocRef.get()
    const fieldAdded = doc.data().tempField === 'temporary data'
    
    // Delete the field
    await userDocRef.update({
      tempField: admin.firestore.FieldValue.delete()
    })
    
    // Verify it was deleted
    doc = await userDocRef.get()
    const fieldDeleted = doc.data().tempField === undefined
    
    const success = fieldAdded && fieldDeleted
    logTest(
      'Test 6: Field Deletion',
      success,
      `Field added: ${fieldAdded}, Field deleted: ${fieldDeleted}`
    )
    
  } catch (error) {
    logTest('Test 6: Field Deletion', false, `Error: ${error.message}`)
  }
}

/**
 * ============================================================
 * TEST 7: Array Operations (arrayUnion)
 * ============================================================
 */
async function test7_ArrayOperations() {
  console.log('🧪 TEST 7: Array Operations')
  try {
    const usersSnapshot = await firestoreDb.collection('users').limit(1).get()
    const userId = usersSnapshot.docs[0].id
    const userDocRef = firestoreDb.collection('users').doc(userId)
    const originalData = usersSnapshot.docs[0].data()
    
    // Add to badges array
    await userDocRef.update({
      badges: admin.firestore.FieldValue.arrayUnion('test_badge_1', 'test_badge_2')
    })
    
    // Verify badges were added
    let doc = await userDocRef.get()
    const badges = doc.data().badges || []
    const hasTestBadges = badges.includes('test_badge_1') && badges.includes('test_badge_2')
    
    logTest(
      'Test 7: Array Operations',
      hasTestBadges,
      `Badges added: ${badges.join(', ')}`
    )
    
    // Remove test badges
    await userDocRef.update({
      badges: admin.firestore.FieldValue.arrayRemove('test_badge_1', 'test_badge_2')
    })
    
  } catch (error) {
    logTest('Test 7: Array Operations', false, `Error: ${error.message}`)
  }
}

/**
 * ============================================================
 * TEST 8: Numeric Increment
 * ============================================================
 */
async function test8_NumericIncrement() {
  console.log('🧪 TEST 8: Numeric Increment')
  try {
    const usersSnapshot = await firestoreDb.collection('users').limit(1).get()
    const userId = usersSnapshot.docs[0].id
    const userDocRef = firestoreDb.collection('users').doc(userId)
    
    // Get original points value
    const originalDoc = await userDocRef.get()
    const originalPoints = originalDoc.data().points || 0
    
    // Increment points by 10
    await userDocRef.update({
      points: admin.firestore.FieldValue.increment(10)
    })
    
    // Verify increment
    const updatedDoc = await userDocRef.get()
    const newPoints = updatedDoc.data().points || 0
    const success = newPoints === originalPoints + 10
    
    logTest(
      'Test 8: Numeric Increment',
      success,
      `Points: ${originalPoints} → ${newPoints}`
    )
    
    // Restore original value
    await userDocRef.update({ points: originalPoints })
    
  } catch (error) {
    logTest('Test 8: Numeric Increment', false, `Error: ${error.message}`)
  }
}

/**
 * ============================================================
 * RUN ALL TESTS
 * ============================================================
 */
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════╗')
  console.log('║  FIRESTORE UPDATE OPERATIONS - COMPREHENSIVE TEST      ║')
  console.log('╚════════════════════════════════════════════════════════╝')
  console.log('')
  
  await test1_BasicUpdate()
  await test2_MultipleFieldUpdate()
  await test3_UpdateNonExistent()
  await test4_ConditionalUpdate()
  await test5_BatchUpdate()
  await test6_FieldDeletion()
  await test7_ArrayOperations()
  await test8_NumericIncrement()
  
  console.log('╔════════════════════════════════════════════════════════╗')
  console.log('║  TEST RESULTS                                          ║')
  console.log('╚════════════════════════════════════════════════════════╝')
  console.log(`Total Tests: ${totalTests}`)
  console.log(`✅ Passed: ${passedTests}`)
  console.log(`❌ Failed: ${failedTests}`)
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`)
  console.log('')
  
  process.exit(failedTests > 0 ? 1 : 0)
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
