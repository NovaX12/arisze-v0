import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'

/**
 * DELETE /api/events/[id]
 * Delete an event (only by the creator)
 * Also deletes all related bookings and participant records
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get session to verify user is authenticated
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    const eventId = params.id
    
    // Validate ObjectId format
    let objectId: ObjectId
    try {
      objectId = new ObjectId(eventId)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid event ID format' },
        { status: 400 }
      )
    }

    // Connect to database
    const db = await getDatabase()
    
    // Find the event first to verify it exists and check ownership
    const event = await db.collection('events').findOne({ _id: objectId })
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Verify the user is the event creator
    if (event.createdBy !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only delete events you created' },
        { status: 403 }
      )
    }

    // Count affected bookings before deletion
    const bookingsCount = await db.collection('bookings').countDocuments({ eventId: eventId })
    
    // Delete all related bookings
    await db.collection('bookings').deleteMany({ eventId: eventId })
    
    // Delete all related event participants
    await db.collection('eventParticipants').deleteMany({ eventId: eventId })
    
    // Delete the userCreatedEvents tracking record
    await db.collection('userCreatedEvents').deleteMany({ 
      eventId: eventId,
      userId: session.user.id 
    })
    
    // Update user's event profile stats
    await db.collection('userEventProfiles').updateOne(
      { userId: session.user.id },
      {
        $inc: { eventsCreated: -1 },
        $set: { updatedAt: new Date() }
      }
    )
    
    // Finally, delete the event itself
    const result = await db.collection('events').deleteOne({ _id: objectId })
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to delete event' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully',
      deletedBookings: bookingsCount,
      eventTitle: event.title
    })

  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/events/[id]
 * Get details for a specific event
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id
    
    // Validate ObjectId format
    let objectId: ObjectId
    try {
      objectId = new ObjectId(eventId)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid event ID format' },
        { status: 400 }
      )
    }

    // Connect to database
    const db = await getDatabase()
    
    // Find the event
    const event = await db.collection('events').findOne({ _id: objectId })
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      event: event
    })

  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}
