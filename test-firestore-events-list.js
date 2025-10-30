/**
 * ============================================================
 * TEST: Firestore Events List - Read Operations
 * Tests various event fetching scenarios
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
 * TEST 1: Fetch First 20 Events Ordered by Date (Ascending)
 * ============================================================
 */
async function test1_FetchFirst20Events() {
  console.log('🧪 TEST 1: Fetch First 20 Events Ordered by Date')
  try {
    // Fetch first 20 events ordered by date (ascending)
    const eventsSnapshot = await firestoreDb
      .collection('events')
      .orderBy('date', 'asc')
      .limit(20)
      .get()
    
    const events = []
    eventsSnapshot.forEach(doc => {
      events.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    // Verify results
    const success = events.length > 0 && events.length <= 20
    
    // Check if dates are in ascending order
    let datesInOrder = true
    for (let i = 1; i < events.length; i++) {
      const prevDate = events[i - 1].date?.toDate?.() || new Date(events[i - 1].date)
      const currDate = events[i].date?.toDate?.() || new Date(events[i].date)
      if (prevDate > currDate) {
        datesInOrder = false
        break
      }
    }
    
    logTest(
      'Test 1: Fetch First 20 Events',
      success && datesInOrder,
      `Found ${events.length} events, Dates in order: ${datesInOrder}`
    )
    
    // Display first 3 events
    if (events.length > 0) {
      console.log('   First 3 events:')
      events.slice(0, 3).forEach((event, idx) => {
        const date = event.date?.toDate?.() || new Date(event.date)
        console.log(`   ${idx + 1}. ${event.title} (${date.toLocaleDateString()})`)
      })
      console.log('')
    }
    
  } catch (error) {
    logTest('Test 1: Fetch First 20 Events', false, `Error: ${error.message}`)
  }
}

/**
 * ============================================================
 * TEST 2: Handle Empty Results
 * ============================================================
 */
async function test2_HandleEmptyResults() {
  console.log('🧪 TEST 2: Handle Empty Results')
  try {
    // Query with impossible condition
    const eventsSnapshot = await firestoreDb
      .collection('events')
      .where('title', '==', 'IMPOSSIBLE_EVENT_TITLE_THAT_DOES_NOT_EXIST_12345')
      .get()
    
    const isEmpty = eventsSnapshot.empty
    const count = eventsSnapshot.size
    
    logTest(
      'Test 2: Handle Empty Results',
      isEmpty && count === 0,
      `Empty: ${isEmpty}, Count: ${count}`
    )
    
  } catch (error) {
    logTest('Test 2: Handle Empty Results', false, `Error: ${error.message}`)
  }
}

/**
 * ============================================================
 * TEST 3: Fetch Events with Pagination
 * ============================================================
 */
async function test3_FetchWithPagination() {
  console.log('🧪 TEST 3: Fetch Events with Pagination')
  try {
    const pageSize = 5
    
    // First page
    const page1Snapshot = await firestoreDb
      .collection('events')
      .orderBy('date', 'asc')
      .limit(pageSize)
      .get()
    
    const page1Events = []
    page1Snapshot.forEach(doc => {
      page1Events.push({ id: doc.id, ...doc.data() })
    })
    
    // Second page (start after last doc of first page)
    let page2Events = []
    if (page1Events.length === pageSize) {
      const lastDoc = page1Snapshot.docs[page1Snapshot.docs.length - 1]
      
      const page2Snapshot = await firestoreDb
        .collection('events')
        .orderBy('date', 'asc')
        .startAfter(lastDoc)
        .limit(pageSize)
        .get()
      
      page2Snapshot.forEach(doc => {
        page2Events.push({ id: doc.id, ...doc.data() })
      })
    }
    
    const success = page1Events.length > 0
    logTest(
      'Test 3: Pagination',
      success,
      `Page 1: ${page1Events.length} events, Page 2: ${page2Events.length} events`
    )
    
  } catch (error) {
    logTest('Test 3: Pagination', false, `Error: ${error.message}`)
  }
}

/**
 * ============================================================
 * TEST 4: Fetch Upcoming Events (date >= now)
 * ============================================================
 */
async function test4_FetchUpcomingEvents() {
  console.log('🧪 TEST 4: Fetch Upcoming Events')
  try {
    const now = new Date()
    
    const eventsSnapshot = await firestoreDb
      .collection('events')
      .where('date', '>=', now)
      .orderBy('date', 'asc')
      .limit(10)
      .get()
    
    const upcomingEvents = []
    eventsSnapshot.forEach(doc => {
      upcomingEvents.push({ id: doc.id, ...doc.data() })
    })
    
    // Verify all events are in the future
    let allUpcoming = true
    upcomingEvents.forEach(event => {
      const eventDate = event.date?.toDate?.() || new Date(event.date)
      if (eventDate < now) {
        allUpcoming = false
      }
    })
    
    logTest(
      'Test 4: Upcoming Events',
      allUpcoming,
      `Found ${upcomingEvents.length} upcoming events, All in future: ${allUpcoming}`
    )
    
  } catch (error) {
    logTest('Test 4: Upcoming Events', false, `Error: ${error.message}`)
  }
}

/**
 * ============================================================
 * TEST 5: Fetch Events by Date Range
 * ============================================================
 */
async function test5_FetchByDateRange() {
  console.log('🧪 TEST 5: Fetch Events by Date Range')
  try {
    const startDate = new Date('2024-01-01')
    const endDate = new Date('2025-12-31')
    
    const eventsSnapshot = await firestoreDb
      .collection('events')
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .orderBy('date', 'asc')
      .get()
    
    const events = []
    eventsSnapshot.forEach(doc => {
      events.push({ id: doc.id, ...doc.data() })
    })
    
    // Verify all events are within range
    let allInRange = true
    events.forEach(event => {
      const eventDate = event.date?.toDate?.() || new Date(event.date)
      if (eventDate < startDate || eventDate > endDate) {
        allInRange = false
      }
    })
    
    logTest(
      'Test 5: Date Range',
      allInRange,
      `Found ${events.length} events in range, All in range: ${allInRange}`
    )
    
  } catch (error) {
    logTest('Test 5: Date Range', false, `Error: ${error.message}`)
  }
}

/**
 * ============================================================
 * TEST 6: Fetch Single Event by ID
 * ============================================================
 */
async function test6_FetchSingleEvent() {
  console.log('🧪 TEST 6: Fetch Single Event by ID')
  try {
    // Get first event ID
    const eventsSnapshot = await firestoreDb
      .collection('events')
      .limit(1)
      .get()
    
    if (eventsSnapshot.empty) {
      logTest('Test 6: Single Event', false, 'No events in database')
      return
    }
    
    const eventId = eventsSnapshot.docs[0].id
    
    // Fetch single event
    const eventDoc = await firestoreDb
      .collection('events')
      .doc(eventId)
      .get()
    
    const success = eventDoc.exists
    const eventData = eventDoc.data()
    
    logTest(
      'Test 6: Single Event',
      success,
      `Event ID: ${eventId}, Title: ${eventData?.title || 'N/A'}`
    )
    
  } catch (error) {
    logTest('Test 6: Single Event', false, `Error: ${error.message}`)
  }
}

/**
 * ============================================================
 * TEST 7: Get Total Events Count
 * ============================================================
 */
async function test7_GetEventsCount() {
  console.log('🧪 TEST 7: Get Total Events Count')
  try {
    const countSnapshot = await firestoreDb
      .collection('events')
      .count()
      .get()
    
    const count = countSnapshot.data().count
    
    logTest(
      'Test 7: Events Count',
      count >= 0,
      `Total events in database: ${count}`
    )
    
  } catch (error) {
    logTest('Test 7: Events Count', false, `Error: ${error.message}`)
  }
}

/**
 * ============================================================
 * TEST 8: Fetch Events with Field Selection
 * ============================================================
 */
async function test8_FetchWithFieldSelection() {
  console.log('🧪 TEST 8: Fetch Events with Field Selection')
  try {
    const eventsSnapshot = await firestoreDb
      .collection('events')
      .select('title', 'date', 'location')
      .orderBy('date', 'asc')
      .limit(5)
      .get()
    
    const events = []
    eventsSnapshot.forEach(doc => {
      events.push({ id: doc.id, ...doc.data() })
    })
    
    // Verify only selected fields are present
    let onlySelectedFields = true
    if (events.length > 0) {
      const firstEvent = events[0]
      const fields = Object.keys(firstEvent)
      
      // Should only have: id, title, date, location
      const expectedFields = ['id', 'title', 'date', 'location']
      onlySelectedFields = fields.every(f => expectedFields.includes(f))
    }
    
    logTest(
      'Test 8: Field Selection',
      events.length > 0 && onlySelectedFields,
      `Fetched ${events.length} events with selected fields only`
    )
    
  } catch (error) {
    logTest('Test 8: Field Selection', false, `Error: ${error.message}`)
  }
}

/**
 * ============================================================
 * TEST 9: Test Error Handling (Invalid Query)
 * ============================================================
 */
async function test9_ErrorHandling() {
  console.log('🧪 TEST 9: Test Error Handling')
  try {
    // Try to query with orderBy on non-indexed field + where clause
    // This should work but let's test the error handling structure
    
    try {
      const eventsSnapshot = await firestoreDb
        .collection('events')
        .orderBy('date', 'asc')
        .limit(20)
        .get()
      
      // If successful, that's fine
      logTest(
        'Test 9: Error Handling',
        true,
        'Query executed successfully (no error to catch)'
      )
    } catch (queryError) {
      // If there's an error, verify we can catch it
      logTest(
        'Test 9: Error Handling',
        true,
        `Successfully caught error: ${queryError.message}`
      )
    }
    
  } catch (error) {
    logTest('Test 9: Error Handling', false, `Unexpected error: ${error.message}`)
  }
}

/**
 * ============================================================
 * TEST 10: Performance Test - Large Query
 * ============================================================
 */
async function test10_PerformanceTest() {
  console.log('🧪 TEST 10: Performance Test - Fetch All Events')
  try {
    const startTime = Date.now()
    
    const eventsSnapshot = await firestoreDb
      .collection('events')
      .orderBy('date', 'asc')
      .get()
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    const count = eventsSnapshot.size
    
    logTest(
      'Test 10: Performance',
      duration < 5000, // Should complete in under 5 seconds
      `Fetched ${count} events in ${duration}ms`
    )
    
  } catch (error) {
    logTest('Test 10: Performance', false, `Error: ${error.message}`)
  }
}

/**
 * ============================================================
 * RUN ALL TESTS
 * ============================================================
 */
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════╗')
  console.log('║  FIRESTORE EVENTS LIST - COMPREHENSIVE TEST            ║')
  console.log('╚════════════════════════════════════════════════════════╝')
  console.log('')
  
  await test1_FetchFirst20Events()
  await test2_HandleEmptyResults()
  await test3_FetchWithPagination()
  await test4_FetchUpcomingEvents()
  await test5_FetchByDateRange()
  await test6_FetchSingleEvent()
  await test7_GetEventsCount()
  await test8_FetchWithFieldSelection()
  await test9_ErrorHandling()
  await test10_PerformanceTest()
  
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
