import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get session to verify user is authenticated
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to view your events' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'booked', 'created', 'all'
    
    const db = await getDatabase()
    const userId = session.user.id
    
    let result: any = {}
    
    // Get booked events
    if (type === 'booked' || type === 'all' || !type) {
      const bookedEvents = await db.collection('bookings')
        .aggregate([
          {
            $match: { userId: userId }
          },
          {
            $lookup: {
              from: 'events',
              localField: 'eventId',
              foreignField: '_id',
              as: 'eventDetails',
              pipeline: [
                {
                  $addFields: {
                    _id: { $toString: '$_id' }
                  }
                }
              ]
            }
          },
          {
            $lookup: {
              from: 'events',
              let: { eventIdStr: '$eventId' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: [{ $toString: '$_id' }, '$$eventIdStr']
                    }
                  }
                }
              ],
              as: 'eventDetails'
            }
          },
          {
            $unwind: {
              path: '$eventDetails',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $sort: { bookingDate: -1 }
          },
          {
            $project: {
              _id: 1,
              eventId: 1,
              eventTitle: 1,
              userPhone: 1,
              university: 1,
              hasGuest: 1,
              guestInfo: 1,
              bookingDate: 1,
              eventDate: 1,
              status: 1,
              eventDetails: {
                _id: 1,
                title: 1,
                description: 1,
                cafe: 1,
                image: 1,
                date: 1,
                time: 1,
                tags: 1,
                attendees: 1,
                maxAttendees: 1,
                university: 1,
                contact: 1,
                address: 1,
                eventType: 1,
                createdByName: 1
              }
            }
          }
        ])
        .toArray()
      
      result.bookedEvents = bookedEvents
    }
    
    // Get created events
    if (type === 'created' || type === 'all' || !type) {
      const createdEvents = await db.collection('events')
        .find({ createdBy: userId })
        .sort({ createdAt: -1 })
        .toArray()
      
      // Get participants for each created event
      const createdEventsWithParticipants = await Promise.all(
        createdEvents.map(async (event) => {
          const participants = await db.collection('eventParticipants')
            .find({ eventId: event._id.toString() })
            .sort({ joinedAt: -1 })
            .toArray()
          
          return {
            ...event,
            participants: participants
          }
        })
      )
      
      result.createdEvents = createdEventsWithParticipants
    }
    
    // Get user event profile stats
    const userProfile = await db.collection('userEventProfiles')
      .findOne({ userId: userId })
    
    result.userProfile = userProfile || {
      userId: userId,
      eventsCreated: 0,
      eventsBooked: 0,
      lastEventCreated: null,
      lastEventBooked: null
    }
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Error fetching user events:', error)
    return NextResponse.json({ error: 'Failed to fetch user events' }, { status: 500 })
  }
}

// POST endpoint to update user event preferences
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { preferences } = await request.json()
    const db = await getDatabase()
    
    // Update user event profile with preferences
    await db.collection('userEventProfiles').updateOne(
      { userId: session.user.id },
      {
        $set: {
          preferences: preferences,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    )
    
    return NextResponse.json({ 
      success: true,
      message: 'Event preferences updated successfully'
    })
    
  } catch (error) {
    console.error('Error updating user event preferences:', error)
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
  }
}