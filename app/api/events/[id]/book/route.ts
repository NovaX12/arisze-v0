import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { firestoreDb } from '@/lib/firebase'
import admin from 'firebase-admin'

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
    
    // Run Firestore Transaction for atomicity
    const result = await firestoreDb.runTransaction(async (transaction) => {
      // 1. Get event document
      const eventDocRef = firestoreDb.collection('events').doc(eventId)
      const eventDoc = await transaction.get(eventDocRef)
      
      if (!eventDoc.exists) {
        throw new Error('EVENT_NOT_FOUND')
      }
      
      const event = eventDoc.data()
      
      // Check if event is full
      const currentAttendees = event?.attendees || 0
      const maxAttendees = event?.maxAttendees || 0
      const guestCount = bookingData.hasGuest ? 1 : 0
      const totalNewAttendees = 1 + guestCount
      
      if (currentAttendees + totalNewAttendees > maxAttendees) {
        throw new Error('EVENT_FULL')
      }
      
      // 2. Check if user already booked this event
      const existingBookingSnapshot = await firestoreDb
        .collection('bookings')
        .where('eventId', '==', eventId)
        .where('userId', '==', session.user.id)
        .limit(1)
        .get()
      
      if (!existingBookingSnapshot.empty) {
        throw new Error('ALREADY_BOOKED')
      }
      
      // Check if event date has passed
      const eventDate = event?.date?.toDate ? event.date.toDate() : new Date(event?.date)
      if (eventDate <= new Date()) {
        throw new Error('PAST_EVENT')
      }
      
      // 3. Create the booking
      const bookingDocRef = firestoreDb.collection('bookings').doc()
      const newBooking = {
        eventId: eventId,
        userId: session.user.id,
        userName: session.user.name || 'Unknown User',
        userEmail: session.user.email || '',
        userPhone: bookingData.userPhone,
        groupSize: bookingData.groupSize || 1,
        hasGuest: bookingData.hasGuest || false,
        guestInfo: bookingData.hasGuest ? bookingData.guestInfo : null,
        date: eventDate,
        time: event?.time || '',
        status: 'confirmed',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      transaction.set(bookingDocRef, newBooking)
      
      // 4. Create event participant record
      const participantDocRef = firestoreDb.collection('eventParticipants').doc()
      const participant = {
        eventId: eventId,
        userId: session.user.id,
        userName: session.user.name || 'Unknown User',
        userEmail: session.user.email || '',
        userPhone: bookingData.userPhone,
        groupSize: bookingData.groupSize || 1,
        hasGuest: bookingData.hasGuest || false,
        guestInfo: bookingData.hasGuest ? bookingData.guestInfo : null,
        joinedAt: new Date(),
        status: 'registered'
      }
      
      transaction.set(participantDocRef, participant)
      
      // 5. Update event attendee count using FieldValue.increment
      transaction.update(eventDocRef, {
        attendees: admin.firestore.FieldValue.increment(totalNewAttendees),
        updatedAt: new Date()
      })
      
      // 6. Update user's event profile stats using FieldValue.increment
      const userProfileRef = firestoreDb.collection('userEventProfiles').doc(session.user.id)
      transaction.set(userProfileRef, {
        userId: session.user.id,
        eventsBooked: admin.firestore.FieldValue.increment(1),
        lastEventBooked: new Date(),
        updatedAt: new Date()
      }, { merge: true })
      
      // Return data for response
      return {
        bookingId: bookingDocRef.id,
        eventTitle: event?.title || 'Unknown Event',
        eventDate: eventDate,
        totalNewAttendees
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      bookingId: result.bookingId,
      message: `Successfully booked ${result.eventTitle}${bookingData.hasGuest ? ' (with guest)' : ''}!`,
      eventTitle: result.eventTitle,
      eventDate: result.eventDate,
      totalAttendees: result.totalNewAttendees
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error booking event:', error)
    
    // Handle specific transaction errors
    if (error instanceof Error) {
      if (error.message === 'EVENT_NOT_FOUND') {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }
      if (error.message === 'EVENT_FULL') {
        return NextResponse.json({ error: 'Event is full or not enough spots available' }, { status: 400 })
      }
      if (error.message === 'ALREADY_BOOKED') {
        return NextResponse.json({ error: 'You have already booked this event' }, { status: 400 })
      }
      if (error.message === 'PAST_EVENT') {
        return NextResponse.json({ error: 'Cannot book past events' }, { status: 400 })
      }
    }
    
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
    
    // Query bookings collection where eventId and userId match
    const bookingSnapshot = await firestoreDb
      .collection('bookings')
      .where('eventId', '==', eventId)
      .where('userId', '==', session.user.id)
      .limit(1)
      .get()
    
    const hasBooked = !bookingSnapshot.empty
    const booking = hasBooked ? {
      id: bookingSnapshot.docs[0].id,
      ...bookingSnapshot.docs[0].data()
    } : null
    
    return NextResponse.json({ 
      hasBooked,
      booking
    })
    
  } catch (error) {
    console.error('Error checking booking status:', error)
    return NextResponse.json({ error: 'Failed to check booking status' }, { status: 500 })
  }
}