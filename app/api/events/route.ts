import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { Event, UserCreatedEvent, UserEventProfile } from '@/lib/models'
import { firestoreDb } from '@/lib/firebase'
import type { Query } from 'firebase-admin/firestore'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔵 GET /api/events - Fetching events...')
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const userId = searchParams.get('userId')
    
    console.log('📋 Query params:', { type, userId })
    
    // Build Firestore query
    let query: Query = firestoreDb.collection('events')
    
    if (userId) {
      // If requesting specific user's events, show all their events (public and private)
      console.log(`🔍 Filtering by userId: ${userId}`)
      query = query.where('createdBy', '==', userId)
      // Sort by createdAt (requires index for createdBy + createdAt)
      query = query.orderBy('createdAt', 'desc')
    } else {
      // If no userId specified, only show public events globally
      console.log('🌍 Fetching all public events')
      query = query.where('isPublic', '==', true)
      // ⚠️ TEMPORARY FIX: Remove sorting to avoid index requirement
      // Re-enable after index finishes building: query = query.orderBy('createdAt', 'desc')
    }
    
    // Add type filter if present
    if (type) {
      console.log(`🏷️  Filtering by type: ${type}`)
      query = query.where('type', '==', type)
    }
    
    // Execute query
    const eventsSnapshot = await query.get()
    console.log(`📊 Found ${eventsSnapshot.size} events`)
    
    // Map documents to clean JSON array with proper date serialization
    const events = eventsSnapshot.docs.map((doc: any) => {
      const data = doc.data()
      return {
        id: doc.id,
        _id: doc.id,  // Add _id for compatibility
        ...data,
        // Convert Firestore Timestamps to ISO strings for JSON serialization
        date: data.date?.toDate ? data.date.toDate().toISOString() : data.date,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt
      }
    })
    
    console.log('✅ Returning events:', events.length)
    if (events.length > 0) {
      console.log('📝 First event sample:', { 
        id: events[0].id, 
        title: events[0].title,
        isPublic: events[0].isPublic,
        createdBy: events[0].createdBy
      })
    }
    
    return NextResponse.json({ events })
  } catch (error) {
    console.error('❌ Error fetching events:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 POST /api/events - Event creation request received')
    
    // Get session to verify user is authenticated
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      console.error('❌ Unauthorized: No session found')
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to create events' },
        { status: 401 }
      )
    }

    console.log('✅ User authenticated:', session.user.email)

    const eventData = await request.json()
    
    // Log incoming data for debugging
    console.log('📝 Creating event with data:', JSON.stringify(eventData, null, 2))
    
    // Validation for required fields
    const requiredFields = ['title', 'description', 'date', 'time', 'maxAttendees', 'university', 'contact', 'address']
    const missingFields = requiredFields.filter(field => !eventData[field])
    
    if (missingFields.length > 0) {
      console.error('❌ Missing fields:', missingFields)
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Accept both 'cafe' and 'venue' field names for backward compatibility
    const venueName = eventData.cafe || eventData.venue
    
    if (!venueName || typeof venueName !== 'string') {
      console.error('❌ Invalid venue name:', venueName)
      return NextResponse.json(
        { error: 'Venue/cafe name is required and must be a valid string' },
        { status: 400 }
      )
    }

    // Validate maxAttendees
    const maxAttendeesNum = parseInt(eventData.maxAttendees)
    if (isNaN(maxAttendeesNum) || maxAttendeesNum < 1 || maxAttendeesNum > 100) {
      console.error('❌ Invalid maxAttendees:', eventData.maxAttendees)
      return NextResponse.json(
        { error: 'Maximum attendees must be a number between 1 and 100' },
        { status: 400 }
      )
    }

    // Validate date is in the future
    const eventDate = new Date(eventData.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day for fair comparison
    
    if (eventDate < today) {
      console.error('❌ Event date in past:', eventDate)
      return NextResponse.json(
        { error: 'Event date must be today or in the future' },
        { status: 400 }
      )
    }
    
    // Create the event object with user information
    const newEvent: Omit<Event, '_id' | 'id'> = {
      title: eventData.title,
      description: eventData.description,
      location: venueName,
      image: eventData.image || '/default-event-image.jpg',
      date: eventDate,
      time: eventData.time,
      tags: eventData.tags || [],
      attendees: 0,
      maxAttendees: maxAttendeesNum,
      university: eventData.university,
      createdBy: session.user.id,
      isPublic: eventData.isPublic !== false, // Default to public
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    console.log('✅ Event object created:', JSON.stringify(newEvent, null, 2))
    
    // Use Firestore batched write for atomic operations
    console.log('💾 Starting Firestore batch operations...')
    const batch = firestoreDb.batch()
    
    // 1. Add event to 'events' collection
    const eventDocRef = firestoreDb.collection('events').doc()
    batch.set(eventDocRef, newEvent)
    const eventId = eventDocRef.id
    console.log('✅ Event queued for creation with ID:', eventId)
    
    // 2. Add document to 'userCreatedEvents' collection
    const userCreatedEventRef = firestoreDb.collection('userCreatedEvents').doc()
    batch.set(userCreatedEventRef, {
      userId: session.user.id,
      eventId: eventId,
      createdAt: new Date()
    })
    console.log('✅ User-event tracking queued')
    
    // 3. Update 'userEventProfiles' document (upsert with merge)
    const userProfileRef = firestoreDb.collection('userEventProfiles').doc(session.user.id)
    
    // Get current profile to increment eventsCreated
    const userProfileDoc = await userProfileRef.get()
    const currentEventsCreated = userProfileDoc.exists ? (userProfileDoc.data()?.eventsCreated || 0) : 0
    
    batch.set(userProfileRef, {
      userId: session.user.id,
      eventsCreated: currentEventsCreated + 1,
      lastEventCreated: new Date(),
      updatedAt: new Date()
    }, { merge: true })
    console.log('✅ User profile update queued')
    
    // Commit all operations atomically
    await batch.commit()
    console.log('✅ Batch commit successful - all operations completed')
    
    return NextResponse.json({ 
      success: true, 
      eventId: eventId,
      message: 'Event created successfully!'
    }, { status: 201 })
    
  } catch (error) {
    console.error('❌ Error creating event:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create event'
    return NextResponse.json({ 
      error: 'Failed to create event', 
      details: errorMessage 
    }, { status: 500 })
  }
}

