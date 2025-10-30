import { NextResponse } from 'next/server'
import { firestoreDb, admin } from '@/lib/firebase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('🔍 [TEST-CONNECTION] Testing Firestore connection...')
    
    // List collections
    const collectionsSnapshot = await firestoreDb.listCollections()
    const collections = await Promise.all(
      collectionsSnapshot.map(async (col) => col.id)
    )
    console.log('📚 [TEST-CONNECTION] Collections found:', collections)
    
    // Try to count documents in events collection
    let eventsCount = 0
    try {
      const eventsSnapshot = await firestoreDb.collection('events').count().get()
      eventsCount = eventsSnapshot.data().count
      console.log('📊 [TEST-CONNECTION] Events count:', eventsCount)
    } catch (e) {
      console.warn('⚠️ [TEST-CONNECTION] Could not count events:', e)
    }
    
    return NextResponse.json({
      connected: true,
      success: true,
      message: 'Firestore connection successful',
      database: 'Firestore',
      projectId: admin.app().options.projectId,
      collections,
      eventsCount,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ [TEST-CONNECTION] Firestore connection failed:', error)
    return NextResponse.json(
      { 
        connected: false,
        success: false, 
        error: error instanceof Error ? error.message : 'Firestore connection failed',
        details: error,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

