import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { firestoreDb, admin } from '@/lib/firebase'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // Get session to verify user is authenticated
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    const { venueId, venueName, date, time, groupSize } = await request.json()

    // Validation
    if (!venueId || !venueName || !date || !time || !groupSize) {
      return NextResponse.json(
        { error: 'All booking fields are required' },
        { status: 400 }
      )
    }

    if (groupSize < 1 || groupSize > 20) {
      return NextResponse.json(
        { error: 'Group size must be between 1 and 20' },
        { status: 400 }
      )
    }

    // Create new booking in Firestore
    const newBooking = {
      userId: session.user.id,
      venueId,
      venueName,
      date: admin.firestore.Timestamp.fromDate(new Date(date)),
      time,
      groupSize: parseInt(groupSize),
      status: 'confirmed',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }

    const docRef = await firestoreDb.collection('bookings').add(newBooking)

    return NextResponse.json({
      message: 'Event booked successfully!',
      booking: {
        id: docRef.id,
        ...newBooking,
        date: new Date(date), // Convert back for response
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Booking creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    // Get session to verify user is authenticated
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Fetch user's bookings from Firestore
    const bookingsSnapshot = await firestoreDb.collection('bookings')
      .where('userId', '==', session.user.id)
      .where('status', '==', 'confirmed') // Only show active bookings
      .orderBy('date', 'asc') // Sort by date
      .get()

    const bookings = bookingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate?.() || doc.data().date, // Convert Firestore Timestamp
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
    }))

    return NextResponse.json({
      bookings: bookings
    })

  } catch (error) {
    console.error('Bookings fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    // Get session to verify user is authenticated
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    const { bookingId } = await request.json()

    // Validation
    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    // Get the booking to verify ownership
    const bookingDoc = await firestoreDb.collection('bookings').doc(bookingId).get()
    
    if (!bookingDoc.exists) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    const bookingData = bookingDoc.data()
    
    // Check if booking belongs to current user
    if (bookingData?.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this booking' },
        { status: 403 }
      )
    }

    // Delete the booking
    await firestoreDb.collection('bookings').doc(bookingId).delete()

    return NextResponse.json({
      message: 'Booking cancelled successfully'
    })

  } catch (error) {
    console.error('Booking cancellation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}