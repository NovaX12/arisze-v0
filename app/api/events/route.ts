import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { Event } from '@/lib/models'

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    const events = await db.collection('events').find({}).toArray()
    
    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const eventData: Omit<Event, '_id'> = await request.json()
    
    const db = await getDatabase()
    const result = await db.collection('events').insertOne({
      ...eventData,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    return NextResponse.json({ 
      success: true, 
      eventId: result.insertedId 
    })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}

