import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import admin from 'firebase-admin'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const firestoreDb = getFirestore()

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
    
    // Find the event first to verify it exists and check ownership
    const eventDocRef = firestoreDb.collection('events').doc(eventId)
    const eventDoc = await eventDocRef.get()
    
    if (!eventDoc.exists) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    const event = eventDoc.data()

    // Verify the user is the event creator
    if (event?.createdBy !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only delete events you created' },
        { status: 403 }
      )
    }

    // Use Firestore batch for atomic deletion across collections
    const batch = firestoreDb.batch()
    
    // Query and collect documents to delete from related collections
    console.log('🔍 Finding related documents to delete...')
    
    // 1. Find and delete bookings
    const bookingsSnapshot = await firestoreDb
      .collection('bookings')
      .where('eventId', '==', eventId)
      .get()
    
    const bookingsCount = bookingsSnapshot.size
    bookingsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref)
    })
    console.log(`✅ Queued ${bookingsCount} bookings for deletion`)
    
    // 2. Find and delete event participants
    const participantsSnapshot = await firestoreDb
      .collection('eventParticipants')
      .where('eventId', '==', eventId)
      .get()
    
    participantsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref)
    })
    console.log(`✅ Queued ${participantsSnapshot.size} participants for deletion`)
    
    // 3. Find and delete userCreatedEvents tracking records
    const userCreatedEventsSnapshot = await firestoreDb
      .collection('userCreatedEvents')
      .where('eventId', '==', eventId)
      .where('userId', '==', session.user.id)
      .get()
    
    userCreatedEventsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref)
    })
    console.log(`✅ Queued ${userCreatedEventsSnapshot.size} user-event tracking records for deletion`)
    
    // 4. Update user's event profile stats (decrement eventsCreated)
    const userProfileRef = firestoreDb.collection('userEventProfiles').doc(session.user.id)
    batch.update(userProfileRef, {
      eventsCreated: admin.firestore.FieldValue.increment(-1),
      updatedAt: new Date()
    })
    console.log('✅ Queued user profile update (decrement eventsCreated)')
    
    // 5. Delete the event itself
    batch.delete(eventDocRef)
    console.log('✅ Queued event deletion')
    
    // Commit all operations atomically
    await batch.commit()
    console.log('✅ Batch commit successful - all deletions completed')

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully',
      deletedBookings: bookingsCount,
      eventTitle: event?.title || 'Unknown'
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
    
    // Get event document from Firestore
    const eventDocRef = firestoreDb.collection('events').doc(eventId)
    const eventDoc = await eventDocRef.get()
    
    if (!eventDoc.exists) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      event: {
        id: eventDoc.id,
        ...eventDoc.data()
      }
    })

  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}
