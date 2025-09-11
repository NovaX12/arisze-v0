import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const db = await getDatabase()
    
    // Fetch user's created events
    const events = await db.collection('events')
      .find({ createdBy: session.user.id })
      .sort({ createdAt: -1 })
      .toArray()

    // Transform events to include participant details
    const eventsWithParticipants = await Promise.all(
      events.map(async (event) => {
        // Get all bookings for this event
        const bookings = await db.collection('bookings')
          .find({ eventId: event._id.toString() })
          .toArray()

        // Get participant details
        const participants = await Promise.all(
          bookings.map(async (booking) => {
            const user = await db.collection('users')
              .findOne({ _id: booking.userId })
            
            return {
              userId: booking.userId.toString(),
              userName: user?.name || 'Unknown User',
              userEmail: user?.email || 'Unknown Email',
              userPhone: booking.userPhone,
              university: booking.university,
              hasGuest: booking.hasGuest || false,
              guestInfo: booking.guestInfo,
              bookedAt: booking.bookedAt
            }
          })
        )

        return {
          _id: event._id.toString(),
          title: event.title,
          cafe: event.cafe,
          date: event.date,
          time: event.time,
          address: event.address,
          attendees: participants.reduce((total, p) => total + 1 + (p.hasGuest ? 1 : 0), 0),
          maxAttendees: event.maxAttendees || 50,
          participants
        }
      })
    )

    return NextResponse.json({
      success: true,
      events: eventsWithParticipants
    })
  } catch (error) {
    console.error('Error fetching user created events:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}