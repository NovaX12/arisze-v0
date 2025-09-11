import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

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

    // Connect to database
    const db = await getDatabase()
    
    // Create new booking
    const newBooking = {
      userId: session.user.id,
      venueId,
      venueName,
      date: new Date(date),
      time,
      groupSize: parseInt(groupSize),
      status: 'confirmed',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('bookings').insertOne(newBooking)

    return NextResponse.json({
      message: 'Event booked successfully!',
      booking: {
        id: result.insertedId,
        ...newBooking
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

    // Connect to database
    const db = await getDatabase()
    
    // Fetch user's bookings
    const bookings = await db.collection('bookings')
      .find({ 
        userId: session.user.id,
        status: 'confirmed' // Only show active bookings
      })
      .sort({ date: 1, time: 1 }) // Sort by date and time
      .toArray()

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

    // Connect to database
    const db = await getDatabase()
    
    // Delete the booking (only if it belongs to the current user)
    const result = await db.collection('bookings').deleteOne({
      _id: bookingId,
      userId: session.user.id
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Booking not found or unauthorized' },
        { status: 404 }
      )
    }

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