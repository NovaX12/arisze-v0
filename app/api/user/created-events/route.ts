import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { firestoreDb } from '@/lib/firebase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔵 GET /api/user/created-events - Fetching user created events...')
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      console.log('❌ Unauthorized: No session found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    console.log(`👤 User ID: ${session.user.id}`)
    
    // Fetch user's created events
    const eventsSnapshot = await firestoreDb.collection('events')
      .where('createdBy', '==', session.user.id)
      .orderBy('createdAt', 'desc')
      .get()

    console.log(`📊 Found ${eventsSnapshot.size} created events`)

    const events = eventsSnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        _id: doc.id,
        id: doc.id,
        ...data,
        // Convert Firestore Timestamps to ISO strings
        date: data.date?.toDate ? data.date.toDate().toISOString() : data.date,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt
      }
    })

    // Transform events to include participant details
    const eventsWithParticipants = await Promise.all(
      events.map(async (event: any) => {
        // Get all bookings for this event
        const bookingsSnapshot = await firestoreDb.collection('bookings')
          .where('eventId', '==', event._id)
          .get()

        const bookings = bookingsSnapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }))

        // Get participant details
        const participants = await Promise.all(
          bookings.map(async (booking: any) => {
            let user = null
            try {
              const userDoc = await firestoreDb.collection('users').doc(booking.userId).get()
              if (userDoc.exists) {
                user = userDoc.data()
              }
            } catch (error) {
              console.error('Error fetching user:', error)
            }
            
            return {
              userId: booking.userId,
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
          _id: event._id,
          id: event.id,
          title: event.title,
          description: event.description,
          cafe: event.cafe || event.location,
          venue: event.venue || event.location,
          date: event.date,
          time: event.time,
          address: event.address,
          tags: event.tags || [],
          attendees: participants.reduce((total, p) => total + 1 + (p.hasGuest ? 1 : 0), 0),
          maxAttendees: event.maxAttendees || 50,
          image: event.image,
          contact: event.contact,
          createdBy: event.createdBy,
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
          participants
        }
      })
    )

    console.log('✅ Returning created events:', eventsWithParticipants.length)
    
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