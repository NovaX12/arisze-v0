import { NextResponse } from 'next/server'
import { firestoreDb } from '@/lib/firebase'

export async function GET() {
  try {
    const eventsSnapshot = await firestoreDb.collection('events').get()
    const events = eventsSnapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }))
    
    return NextResponse.json({ events })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}