import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('🔍 [TEST-CONNECTION] Testing MongoDB connection...')
    
    const db = await getDatabase()
    console.log('✅ [TEST-CONNECTION] Database connection obtained')
    
    const collections = await db.listCollections().toArray()
    console.log('📚 [TEST-CONNECTION] Collections found:', collections.map(c => c.name))
    
    // Try to count documents in events collection
    let eventsCount = 0
    try {
      eventsCount = await db.collection('events').countDocuments()
      console.log('📊 [TEST-CONNECTION] Events count:', eventsCount)
    } catch (e) {
      console.warn('⚠️ [TEST-CONNECTION] Could not count events:', e)
    }
    
    return NextResponse.json({
      connected: true,
      success: true,
      message: 'Database connection successful',
      database: db.databaseName,
      collections: collections.map(col => col.name),
      eventsCount,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ [TEST-CONNECTION] Database connection failed:', error)
    return NextResponse.json(
      { 
        connected: false,
        success: false, 
        error: error instanceof Error ? error.message : 'Database connection failed',
        details: error,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

