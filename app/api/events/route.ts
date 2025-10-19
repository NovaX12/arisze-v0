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
      query.createdBy = userId
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
    // Get session to verify user is authenticated
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to create events' },
        { status: 401 }
      )
    }

    const eventData = await request.json()
    
    // Validation for required fields
    const requiredFields = ['title', 'description', 'date', 'time', 'maxAttendees', 'university', 'contact', 'address']
    const missingFields = requiredFields.filter(field => !eventData[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate cafe field (optional but should be string if provided)
    if (eventData.cafe && typeof eventData.cafe !== 'string') {
      return NextResponse.json(
        { error: 'Cafe must be a valid string' },
        { status: 400 }
      )
    }

    // Validate maxAttendees
    if (eventData.maxAttendees < 1 || eventData.maxAttendees > 100) {
      return NextResponse.json(
        { error: 'Maximum attendees must be between 1 and 100' },
        { status: 400 }
      )
    }

    // Validate date is in the future
    const eventDate = new Date(eventData.date)
    if (eventDate <= new Date()) {
      return NextResponse.json(
        { error: 'Event date must be in the future' },
        { status: 400 }
      )
    }
    
    const db = await getDatabase()
    
    // Create the event with user information
    const newEvent: Omit<Event, '_id'> = {
      title: eventData.title,
      description: eventData.description,
      venue: eventData.cafe || 'User Location',
      image: eventData.image || '/default-event-image.jpg',
      date: eventDate,
      time: eventData.time,
      tags: eventData.tags || [],
      attendees: 0,
      maxAttendees: parseInt(eventData.maxAttendees),
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
    
    const result = await db.collection('events').insertOne(newEvent)
    
    // Track user's created event
    const userCreatedEvent: Omit<UserCreatedEvent, '_id'> = {
      userId: session.user.id,
      eventId: result.insertedId.toString(),
      createdAt: new Date()
    }
    
    await db.collection('userCreatedEvents').insertOne(userCreatedEvent)
    
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
    
    return NextResponse.json({ 
      success: true, 
      eventId: result.insertedId,
      message: 'Event created successfully!'
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}

