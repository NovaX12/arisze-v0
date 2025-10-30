/**
 * Test script for Firebase API endpoints
 * Tests all migrated endpoints to verify Firebase integration
 */

const BASE_URL = 'http://localhost:3000'

async function testEndpoint(name, url, options = {}) {
  console.log(`\n🧪 Testing: ${name}`)
  console.log(`   URL: ${url}`)
  
  try {
    const response = await fetch(url, options)
    const data = await response.json()
    
    if (response.ok) {
      console.log(`   ✅ Success (${response.status})`)
      console.log(`   📊 Data:`, JSON.stringify(data, null, 2).substring(0, 200))
      return { success: true, data }
    } else {
      console.log(`   ❌ Failed (${response.status})`)
      console.log(`   Error:`, data)
      return { success: false, error: data }
    }
  } catch (error) {
    console.log(`   ❌ Error:`, error.message)
    return { success: false, error: error.message }
  }
}

async function runTests() {
  console.log('🚀 Starting Firebase API Tests...\n')
  console.log('=' .repeat(60))
  
  // Test 1: GET /api/events - List all public events
  await testEndpoint(
    'GET /api/events - List all public events',
    `${BASE_URL}/api/events`
  )
  
  // Test 2: GET /api/users - List users
  await testEndpoint(
    'GET /api/users - List users',
    `${BASE_URL}/api/users`
  )
  
  // Test 3: GET /api/events/[id] - Get specific event
  // First, let's get an event ID from the list
  console.log('\n' + '='.repeat(60))
  console.log('🔍 Getting event ID for single event test...')
  
  const eventsResponse = await fetch(`${BASE_URL}/api/events`)
  const eventsData = await eventsResponse.json()
  
  if (eventsData.events && eventsData.events.length > 0) {
    const firstEventId = eventsData.events[0].id
    console.log(`   Found event ID: ${firstEventId}`)
    
    await testEndpoint(
      'GET /api/events/[id] - Get single event (CRITICAL TEST)',
      `${BASE_URL}/api/events/${firstEventId}`
    )
  } else {
    console.log('   ⚠️  No events found in database')
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('✅ All tests completed!')
}

// Run the tests
runTests().catch(console.error)
