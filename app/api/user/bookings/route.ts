import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { firestoreDb } from '@/lib/firebase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔵 GET /api/user/bookings - Fetching user bookings...')
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      console.log('❌ Unauthorized: No session found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    console.log(`👤 User ID: ${session.user.id}`)
    
    // Fetch user's bookings
    const bookingsSnapshot = await firestoreDb.collection('bookings')
      .where('userId', '==', session.user.id)
      .orderBy('createdAt', 'desc')
      .get()

    console.log(`📊 Found ${bookingsSnapshot.size} bookings`)

    const bookings = bookingsSnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        _id: doc.id,
        ...data,
        // Convert Firestore Timestamps
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        bookedAt: data.bookedAt?.toDate ? data.bookedAt.toDate().toISOString() : data.bookedAt,
        date: data.date?.toDate ? data.date.toDate().toISOString() : data.date
      }
    })

    // Transform bookings to include event details
    const bookingsWithEventDetails = await Promise.all(
      bookings.map(async (booking: any) => {
        let event = null
        try {
          const eventDoc = await firestoreDb.collection('events').doc(booking.eventId).get()
          if (eventDoc.exists) {
            event = eventDoc.data()
          }
        } catch (error) {
          console.error('Error fetching event:', error)
        }
        
        const eventDate = event?.date?.toDate ? event.date.toDate().toISOString() : (event?.date || booking.date)
        
        return {
          _id: booking._id,
          eventId: booking.eventId,
          eventTitle: event?.title || 'Unknown Event',
          eventCafe: event?.cafe || event?.venue || event?.location || 'Unknown Venue',
          eventVenue: event?.venue || event?.cafe || event?.location || 'Unknown Venue',
          eventDate: eventDate,
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

    console.log('✅ Returning bookings with event details:', bookingsWithEventDetails.length)

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