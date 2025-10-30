import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { withErrorHandling } from '@/lib/api-helpers'
import { firestoreDb } from '@/lib/firebase'
import admin from 'firebase-admin'

// ✅ MIGRATED TO FIRESTORE

async function handler(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    console.log('⚠️ Unauthorized access to /api/users/online')
    return NextResponse.json({ onlineCount: 0 }, { status: 401 })
  }

  try {
    // Get online users from Firestore (users active in last 5 minutes)
    const fiveMinutesAgo = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() - 5 * 60 * 1000)
    )
    
    const onlineUsersSnapshot = await firestoreDb
      .collection('users')
      .where('lastActive', '>', fiveMinutesAgo)
      .get()
    
    const onlineCount = onlineUsersSnapshot.size
    
    return NextResponse.json(
      { 
        onlineCount,
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('❌ Online users API error:', error)
    // ✅ FIX: Return fallback instead of error to prevent UI break
    return NextResponse.json(
      { 
        onlineCount: 1,
        error: 'Could not fetch accurate count',
        timestamp: new Date().toISOString()
      },
      { status: 200 } // Return 200 with fallback data
    )
  }
}

// ✅ FIX: Wrap with error handling and timeout protection
export const GET = withErrorHandling(handler)

// ✅ FIX: Disable caching for real-time data
export const dynamic = 'force-dynamic'
export const revalidate = 0

