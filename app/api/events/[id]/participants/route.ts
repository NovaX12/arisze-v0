import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

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
    const db = await getDatabase()
    
    // Validate ObjectId format
    if (!ObjectId.isValid(eventId)) {
      return NextResponse.json(
        { error: 'Invalid event ID' },
        { status: 400 }
      )
    }

    // First, verify that the user is the creator of this event or has permission to view participants
    const event = await db.collection('events').findOne({ _id: new ObjectId(eventId) })
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Check if user is the event creator
    if (event.createdBy !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only view participants of events you created' },
        { status: 403 }
      )
    }
    
    // Get all participants for this event from bookings collection
    const participants = await db.collection('bookings')
      .find({ eventId: eventId })
      .sort({ createdAt: -1 })
      .toArray()
    
    // Transform bookings to participant format
    const participantsWithDetails = participants.map(booking => ({
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
      confirmedParticipants: participantsWithDetails.filter(p => p.status === 'confirmed').length,
      participantsWithGuests: participantsWithDetails.filter(p => p.hasGuest).length,
      totalAttendees: participantsWithDetails.reduce((sum, p) => sum + p.groupSize + (p.hasGuest ? 1 : 0), 0),
      recentJoins: participantsWithDetails.filter(p => {
        const joinDate = new Date(p.joinedAt)
        const threeDaysAgo = new Date()
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
        return joinDate >= threeDaysAgo
      }).length
    }
    
    return NextResponse.json({
      event: {
        _id: event._id,
        title: event.title,
        date: event.date,
        time: event.time,
        maxAttendees: event.maxAttendees,
        currentAttendees: event.attendees || 0
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
    const db = await getDatabase()
    
    // Verify user is the event creator
    const event = await db.collection('events').findOne({ _id: new ObjectId(eventId) })
    
    if (!event || event.createdBy !== session.user.id) {
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
    
    // Update participant status in bookings collection
    const updateResult = await db.collection('bookings').updateOne(
      { 
        _id: new ObjectId(participantId),
        eventId: eventId 
      },
      {
        $set: {
          status: status,
          notes: notes || '',
          updatedAt: new Date(),
          updatedBy: session.user.id
        }
      }
    )
    
    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: `Participant status updated to ${status}`
    })
    
  } catch (error) {
    console.error('Error updating participant status:', error)
    return NextResponse.json({ error: 'Failed to update participant status' }, { status: 500 })
  }
}