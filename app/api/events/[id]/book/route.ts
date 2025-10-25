import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { Booking, EventParticipant } from '@/lib/models'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get session to verify user is authenticated
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to book events' },
        { status: 401 }
      )
    }

    const bookingData = await request.json()
    const eventId = params.id
    
    // Validation for required fields
    const requiredFields = ['userPhone', 'university']
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[+]?[0-9\s\-\(\)]{10,15}$/
    if (!phoneRegex.test(bookingData.userPhone)) {
      return NextResponse.json(
        { error: 'Please provide a valid phone number' },
        { status: 400 }
      )
    }

    // If bringing guest, validate guest info
    if (bookingData.hasGuest && bookingData.guestInfo) {
      if (!bookingData.guestInfo.name || !bookingData.guestInfo.email) {
        return NextResponse.json(
          { error: 'Guest name and email are required when bringing a guest' },
          { status: 400 }
        )
      }
      
      // Validate guest email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(bookingData.guestInfo.email)) {
        return NextResponse.json(
          { error: 'Please provide a valid guest email address' },
          { status: 400 }
        )
      }
    }
    
    const db = await getDatabase()
    
    // Validate and convert eventId to ObjectId
    let objectId: ObjectId
    try {
      objectId = new ObjectId(eventId)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid event ID format' },
        { status: 400 }
      )
    }
    
    // Check if event exists and is bookable
    const event = await db.collection('events').findOne({ _id: objectId })
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Check if event is full
    const currentAttendees = event.attendees || 0
    const maxAttendees = event.maxAttendees || 0
    const guestCount = bookingData.hasGuest ? 1 : 0
    const totalNewAttendees = 1 + guestCount
    
    if (currentAttendees + totalNewAttendees > maxAttendees) {
      return NextResponse.json(
        { error: 'Event is full or not enough spots available' },
        { status: 400 }
      )
    }

    // Check if user already booked this event
    const existingBooking = await db.collection('bookings').findOne({
      eventId: eventId,
      userId: session.user.id
    })
    
    if (existingBooking) {
      return NextResponse.json(
        { error: 'You have already booked this event' },
        { status: 400 }
      )
    }

    // Check if event date has passed
    const eventDate = new Date(event.date)
    if (eventDate <= new Date()) {
      return NextResponse.json(
        { error: 'Cannot book past events' },
        { status: 400 }
      )
    }
    
    // Create the booking
    const newBooking: Omit<Booking, '_id'> = {
      eventId: eventId,
      userId: session.user.id,
      userName: session.user.name || 'Unknown User',
      userEmail: session.user.email || '',
      userPhone: bookingData.userPhone,
      groupSize: bookingData.groupSize || 1,
      hasGuest: bookingData.hasGuest || false,
      guestInfo: bookingData.hasGuest ? bookingData.guestInfo : undefined,
      date: eventDate,
      time: event.time,
      status: 'confirmed',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const bookingResult = await db.collection('bookings').insertOne(newBooking)
    
    // Create event participant record
    const participant: Omit<EventParticipant, '_id'> = {
      eventId: eventId, // FIX: Added missing eventId field
      userId: session.user.id,
      userName: session.user.name || 'Unknown User',
      userEmail: session.user.email || '',
      userPhone: bookingData.userPhone,
      groupSize: bookingData.groupSize || 1,
      hasGuest: bookingData.hasGuest || false,
      guestInfo: bookingData.hasGuest ? bookingData.guestInfo : undefined,
      joinedAt: new Date(),
      status: 'registered'
    }
    
    await db.collection('eventParticipants').insertOne(participant)
    
    // Update event attendee count
    await db.collection('events').updateOne(
      { _id: objectId },
      { 
        $inc: { attendees: totalNewAttendees },
        $set: { updatedAt: new Date() }
      }
    )
    
    // Update user's event profile stats
    await db.collection('userEventProfiles').updateOne(
      { userId: session.user.id },
      {
        $inc: { eventsBooked: 1 },
        $set: { 
          lastEventBooked: new Date(),
          updatedAt: new Date()
        }
      },
      { upsert: true }
    )
    
    return NextResponse.json({ 
      success: true, 
      bookingId: bookingResult.insertedId,
      message: `Successfully booked ${event.title}${bookingData.hasGuest ? ' (with guest)' : ''}!`,
      eventTitle: event.title,
      eventDate: event.date,
      totalAttendees: totalNewAttendees
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error booking event:', error)
    return NextResponse.json({ error: 'Failed to book event' }, { status: 500 })
  }
}

// GET endpoint to check booking status
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const eventId = params.id
    const db = await getDatabase()
    
    // Check if user has booked this event
    const booking = await db.collection('bookings').findOne({
      eventId: eventId,
      userId: session.user.id
    })
    
    return NextResponse.json({ 
      hasBooked: !!booking,
      booking: booking || null
    })
    
  } catch (error) {
    console.error('Error checking booking status:', error)
    return NextResponse.json({ error: 'Failed to check booking status' }, { status: 500 })
  }
}