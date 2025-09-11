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
    
    // Fetch user's bookings
    const bookings = await db.collection('bookings')
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray()

    // Transform bookings to include event details
    const bookingsWithEventDetails = await Promise.all(
      bookings.map(async (booking) => {
        let event = null
        try {
          // Convert eventId to ObjectId for querying
          const eventObjectId = new ObjectId(booking.eventId)
          event = await db.collection('events')
            .findOne({ _id: eventObjectId })
        } catch (error) {
          console.error('Error converting eventId to ObjectId:', error)
        }
        
        return {
          _id: booking._id.toString(),
          eventId: booking.eventId.toString(),
          eventTitle: event?.title || 'Unknown Event',
          eventCafe: event?.cafe || 'Unknown Venue',
          eventDate: event?.date || booking.eventDate,
          eventTime: event?.time,
          eventAddress: event?.address || '',
          userPhone: booking.userPhone,
          university: booking.university,
          hasGuest: booking.hasGuest || false,
          guestInfo: booking.guestInfo,
          bookedAt: booking.bookedAt,
          status: 'confirmed'
        }
      })
    )

    return NextResponse.json({
      success: true,
      bookings: bookingsWithEventDetails
    })
  } catch (error) {
    console.error('Error fetching user bookings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}