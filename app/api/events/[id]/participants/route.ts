import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { firestoreDb } from '@/lib/firebase'
import { Event } from '@/lib/models'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get session to verify user is authenticated
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to view participants' },
        { status: 401 }
      )
    }

    const eventId = params.id

    // First, verify that the user is the creator of this event or has permission to view participants
    const eventDoc = await firestoreDb.collection('events').doc(eventId).get()
    
    if (!eventDoc.exists) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    const event = eventDoc.data() as Event

    // Check if user is the event creator
    if (event?.createdBy !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only view participants of events you created' },
        { status: 403 }
      )
    }
    
    // Get all participants for this event from bookings collection
    const participantsSnapshot = await firestoreDb.collection('bookings')
      .where('eventId', '==', eventId)
      .orderBy('createdAt', 'desc')
      .get()
    
    const participants = participantsSnapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }))
    
    // Transform bookings to participant format
    const participantsWithDetails = participants.map((booking: any) => ({
      _id: booking._id,
      userId: booking.userId,
      userName: booking.userName,
      userEmail: booking.userEmail,
      userPhone: booking.userPhone,
      groupSize: booking.groupSize || 1,
      hasGuest: booking.hasGuest || false,
      guestInfo: booking.guestInfo || null,
      joinedAt: booking.createdAt,
      status: booking.status || 'confirmed',
      bookingDetails: booking
    }))
    
    // Calculate statistics
    const stats = {
      totalParticipants: participantsWithDetails.length,
      confirmedParticipants: participantsWithDetails.filter((p: any) => p.status === 'confirmed').length,
      participantsWithGuests: participantsWithDetails.filter((p: any) => p.hasGuest).length,
      totalAttendees: participantsWithDetails.reduce((sum: number, p: any) => sum + p.groupSize + (p.hasGuest ? 1 : 0), 0),
      recentJoins: participantsWithDetails.filter((p: any) => {
        const joinDate = new Date(p.joinedAt)
        const threeDaysAgo = new Date()
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
        return joinDate >= threeDaysAgo
      }).length
    }
    
    return NextResponse.json({
      event: {
        _id: eventDoc.id,
        title: event?.title,
        date: event?.date,
        time: event?.time,
        maxAttendees: event?.maxAttendees,
        currentAttendees: event?.attendees || 0
      },
      participants: participantsWithDetails,
      stats: stats
    })
    
  } catch (error) {
    console.error('Error fetching event participants:', error)
    return NextResponse.json({ error: 'Failed to fetch participants' }, { status: 500 })
  }
}

// POST endpoint to update participant status (for event creators)
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { participantId, status, notes } = await request.json()
    const eventId = params.id
    
    // Verify user is the event creator
    const eventDoc = await firestoreDb.collection('events').doc(eventId).get()
    const event = eventDoc.data() as Event
    
    if (!eventDoc.exists || event?.createdBy !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only manage participants of events you created' },
        { status: 403 }
      )
    }

    // Validate status
    const validStatuses = ['confirmed', 'cancelled', 'waitlist', 'attended', 'no-show']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }
    
    // Check if participant exists
    const bookingDoc = await firestoreDb.collection('bookings').doc(participantId).get()
    const booking = bookingDoc.data()
    
    if (!bookingDoc.exists || booking?.eventId !== eventId) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      )
    }
    
    // Update participant status in bookings collection
    await firestoreDb.collection('bookings').doc(participantId).update({
      status: status,
      notes: notes || '',
      updatedAt: new Date(),
      updatedBy: session.user.id
    })
    
    return NextResponse.json({
      success: true,
      message: `Participant status updated to ${status}`
    })
    
  } catch (error) {
    console.error('Error updating participant status:', error)
    return NextResponse.json({ error: 'Failed to update participant status' }, { status: 500 })
  }
}