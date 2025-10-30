import { NextResponse } from 'next/server'
import { firestoreDb } from '@/lib/firebase'

export async function GET() {
  try {
    const badgesSnapshot = await firestoreDb.collection('badges').get()
    const badges = badgesSnapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }))
    
    return NextResponse.json({ badges })
  } catch (error) {
    console.error('Error fetching badges:', error)
    return NextResponse.json({ error: 'Failed to fetch badges' }, { status: 500 })
  }
}