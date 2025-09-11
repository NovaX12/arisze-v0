import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

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
    
    // First, verify that the user is the creator of this event or has permission to view participants
    const event = await db.collection('events').findOne({ _id: eventId })
    
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
    
    // Get all participants for this event
    const participants = await db.collection('eventParticipants')
      .find({ eventId: eventId })
      .sort({ joinedAt: -1 })
      .toArray()
    
    // Get detailed booking information
    const participantsWithBookingDetails = await Promise.all(
      participants.map(async (participant) => {
        const booking = await db.collection('bookings').findOne({
          eventId: eventId,
          userId: participant.userId
        })
        
        return {
          ...participant,
          bookingDetails: booking
        }
      })
    )
    
    // Calculate statistics
    const stats = {
      totalParticipants: participants.length,
      confirmedParticipants: participants.filter(p => p.status === 'confirmed').length,
      participantsWithGuests: participants.filter(p => p.hasGuest).length,
      totalAttendees: participants.reduce((sum, p) => sum + (p.hasGuest ? 2 : 1), 0),
      universities: [...new Set(participants.map(p => p.university))],
      recentJoins: participants.filter(p => {
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
      participants: participantsWithBookingDetails,
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
    
    // Update participant status
    const updateResult = await db.collection('eventParticipants').updateOne(
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
    
    // Also update the corresponding booking status
    const participant = await db.collection('eventParticipants').findOne({
      _id: new ObjectId(participantId)
    })
    
    if (participant) {
      await db.collection('bookings').updateOne(
        {
          eventId: eventId,
          userId: participant.userId
        },
        {
          $set: {
            status: status,
            notes: notes || '',
            updatedAt: new Date()
          }
        }
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