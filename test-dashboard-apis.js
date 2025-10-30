/**
 * Dashboard APIs Test
 * Tests the user bookings and created events endpoints
 */

const testUserId = process.argv[2] || 'test-user-id'

console.log('\n🧪 Testing Dashboard APIs...')
console.log('═'.repeat(60))
console.log(`📋 Test User ID: ${testUserId}\n`)

async function testDashboardAPIs() {
  const baseUrl = 'http://localhost:3002'
  
  try {
    // Test 1: User Bookings API
    console.log('1️⃣  Testing GET /api/user/bookings...')
    try {
      const bookingsResponse = await fetch(`${baseUrl}/api/user/bookings`, {
        headers: {
          'Cookie': `next-auth.session-token=test-token`
        }
      })
      console.log(`   Status: ${bookingsResponse.status}`)
      const bookingsData = await bookingsResponse.json()
      console.log(`   Response:`, JSON.stringify(bookingsData, null, 2))
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`)
    }
    
    console.log('\n2️⃣  Testing GET /api/user/created-events...')
    try {
      const createdResponse = await fetch(`${baseUrl}/api/user/created-events`, {
        headers: {
          'Cookie': `next-auth.session-token=test-token`
        }
      })
      console.log(`   Status: ${createdResponse.status}`)
      const createdData = await createdResponse.json()
      console.log(`   Response:`, JSON.stringify(createdData, null, 2))
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`)
    }
    
    console.log('\n3️⃣  Testing GET /api/events (public events)...')
    try {
      const eventsResponse = await fetch(`${baseUrl}/api/events`)
      console.log(`   Status: ${eventsResponse.status}`)
      const eventsData = await eventsResponse.json()
      console.log(`   Events Count: ${eventsData.events?.length || 0}`)
      if (eventsData.events?.length > 0) {
        console.log(`   First Event:`, JSON.stringify(eventsData.events[0], null, 2))
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`)
    }
    
  } catch (error) {
    console.error('\n❌ Test Error:', error.message)
  }
  
  console.log('\n═'.repeat(60))
  console.log('✅ Tests completed\n')
}

testDashboardAPIs()
