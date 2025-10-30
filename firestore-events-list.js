/**
 * ============================================================
 * Firestore Events List - Fetch Events Collection
 * GET /api/events - Returns list of events with pagination
 * ============================================================
 */

import admin from 'firebase-admin'

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  const serviceAccount = await import('./serviceAccountKey.json.json', {
    assert: { type: 'json' }
  })
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount.default)
  })
}

const firestoreDb = admin.firestore()

/**
 * ============================================================
 * FUNCTION 1: Get Events List (Main Route Handler)
 * Fetches first 20 events ordered by date ascending
 * ============================================================
 */
export async function getEventsList(req, res) {
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
}

/**
 * ============================================================
 * FUNCTION 2: Get Events with Pagination
 * Supports page number and custom limit
 * ============================================================
 */
export async function getEventsPaginated(req, res) {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit
    
    console.log(`📋 Fetching events page ${page} (limit: ${limit})`)
    
    // Get total count
    const totalSnapshot = await firestoreDb.collection('events').count().get()
    const totalCount = totalSnapshot.data().count
    
    // Fetch events with pagination
    let query = firestoreDb
      .collection('events')
      .orderBy('date', 'asc')
      .limit(limit)
    
    // Handle pagination by skipping documents
    if (skip > 0) {
      const skipSnapshot = await firestoreDb
        .collection('events')
        .orderBy('date', 'asc')
        .limit(skip)
        .get()
      
      if (!skipSnapshot.empty) {
        const lastDoc = skipSnapshot.docs[skipSnapshot.docs.length - 1]
        query = query.startAfter(lastDoc)
      }
    }
    
    const eventsSnapshot = await query.get()
    
    // Map events
    const events = []
    eventsSnapshot.forEach(doc => {
      events.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    console.log(`✅ Fetched ${events.length} events (page ${page})`)
    
    // Return with pagination metadata
    return res.status(200).json({
      success: true,
      events: events,
      pagination: {
        page: page,
        limit: limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    })
    
  } catch (error) {
    console.error('❌ Error fetching paginated events:', error)
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

/**
 * ============================================================
 * FUNCTION 3: Get Upcoming Events
 * Fetches events with date >= current date
 * ============================================================
 */
export async function getUpcomingEvents(req, res) {
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
    
    return res.status(200).json({
      success: true,
      message: 'Upcoming events fetched successfully',
      events: events,
      count: events.length
    })
    
  } catch (error) {
    console.error('❌ Error fetching upcoming events:', error)
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

/**
 * ============================================================
 * FUNCTION 4: Get Events by Date Range
 * Fetches events between start and end dates
 * ============================================================
 */
export async function getEventsByDateRange(req, res) {
  try {
    const { startDate, endDate } = req.query
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'startDate and endDate query parameters are required'
      })
    }
    
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    console.log(`📅 Fetching events from ${start.toDateString()} to ${end.toDateString()}`)
    
    // Fetch events in date range
    const eventsSnapshot = await firestoreDb
      .collection('events')
      .where('date', '>=', start)
      .where('date', '<=', end)
      .orderBy('date', 'asc')
      .get()
    
    const events = []
    eventsSnapshot.forEach(doc => {
      events.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    console.log(`✅ Found ${events.length} events in date range`)
    
    return res.status(200).json({
      success: true,
      events: events,
      count: events.length,
      dateRange: {
        start: startDate,
        end: endDate
      }
    })
    
  } catch (error) {
    console.error('❌ Error fetching events by date range:', error)
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

/**
 * ============================================================
 * FUNCTION 5: Get Events with Filters
 * Supports filtering by status, category, etc.
 * ============================================================
 */
export async function getEventsFiltered(req, res) {
  try {
    const { status, category, limit = 20 } = req.query
    
    console.log('🔍 Fetching filtered events:', { status, category, limit })
    
    // Build query
    let query = firestoreDb.collection('events')
    
    // Apply filters
    if (status) {
      query = query.where('status', '==', status)
    }
    
    if (category) {
      query = query.where('category', '==', category)
    }
    
    // Order and limit
    query = query.orderBy('date', 'asc').limit(parseInt(limit))
    
    const eventsSnapshot = await query.get()
    
    const events = []
    eventsSnapshot.forEach(doc => {
      events.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    console.log(`✅ Found ${events.length} events with filters`)
    
    return res.status(200).json({
      success: true,
      events: events,
      count: events.length,
      filters: { status, category }
    })
    
  } catch (error) {
    console.error('❌ Error fetching filtered events:', error)
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

/**
 * ============================================================
 * FUNCTION 6: Get Single Event by ID
 * Helper function to fetch one event
 * ============================================================
 */
export async function getEventById(eventId) {
  try {
    const eventDoc = await firestoreDb
      .collection('events')
      .doc(eventId)
      .get()
    
    if (!eventDoc.exists) {
      return null
    }
    
    return {
      id: eventDoc.id,
      ...eventDoc.data()
    }
  } catch (error) {
    console.error(`❌ Error fetching event ${eventId}:`, error)
    throw error
  }
}

/**
 * ============================================================
 * FUNCTION 7: Get Events Count
 * Returns total number of events
 * ============================================================
 */
export async function getEventsCount(req, res) {
  try {
    const countSnapshot = await firestoreDb
      .collection('events')
      .count()
      .get()
    
    const count = countSnapshot.data().count
    
    console.log(`📊 Total events count: ${count}`)
    
    return res.status(200).json({
      success: true,
      count: count
    })
    
  } catch (error) {
    console.error('❌ Error getting events count:', error)
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

// Export firestoreDb for external use
export { firestoreDb }
