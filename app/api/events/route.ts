import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { Event, UserCreatedEvent, UserEventProfile } from '@/lib/models'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const userId = searchParams.get('userId')
    
    let query: any = {}
    
    if (type) {
      query.type = type
    }
    
    if (userId) {
      // If requesting specific user's events, show all their events (public and private)
      query.createdBy = userId
    } else {
      // If no userId specified, only show public events globally
      query.isPublic = true
    }
    
    const events = await db.collection('events').find(query).toArray()
    
    // Manual sorting by createdAt in descending order (newest first)
    const sortedEvents = events.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime()
      const dateB = new Date(b.createdAt || 0).getTime()
      return dateB - dateA
    })
    
    return NextResponse.json({ events: sortedEvents })
  } catch (error) {
    console.error('Error fetching events:', error)
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
    
    console.log('🔌 Connecting to database...')
    const db = await getDatabase()
    console.log('✅ Database connected')
    
    // Create the event with user information
    const newEvent: Omit<Event, '_id'> = {
      title: eventData.title,
      description: eventData.description,
      venue: venueName,
      image: eventData.image || '/default-event-image.jpg',
      date: eventDate,
      time: eventData.time,
      tags: eventData.tags || [],
      attendees: 0,
      maxAttendees: maxAttendeesNum,
      university: eventData.university,
      contact: eventData.contact,
      address: eventData.address,
      createdBy: session.user.id,
      createdByName: session.user.name || 'Unknown User',
      createdByEmail: session.user.email || '',
      eventType: 'user-generated',
      isPublic: eventData.isPublic !== false, // Default to public
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    console.log('✅ Event object created:', JSON.stringify(newEvent, null, 2))
    
    console.log('💾 Inserting event into database...')
    const result = await db.collection('events').insertOne(newEvent)
    console.log('✅ Event inserted with ID:', result.insertedId)
    
    // Track user's created event
    const userCreatedEvent: Omit<UserCreatedEvent, '_id'> = {
      userId: session.user.id,
      eventId: result.insertedId.toString(),
      createdAt: new Date()
    }
    
    await db.collection('userCreatedEvents').insertOne(userCreatedEvent)
    console.log('✅ User event tracking created')
    
    // Update user's event profile stats
    await db.collection('userEventProfiles').updateOne(
      { userId: session.user.id },
      {
        $inc: { eventsCreated: 1 },
        $set: { 
          lastEventCreated: new Date(),
          updatedAt: new Date()
        }
      },
      { upsert: true }
    )
    console.log('✅ User event profile updated')
    
    return NextResponse.json({ 
      success: true, 
      eventId: result.insertedId,
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

