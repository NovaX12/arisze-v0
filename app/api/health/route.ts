import { NextResponse } from 'next/server'
import { firestoreDb } from '@/lib/firebase'

export async function GET() {
  const startTime = Date.now()
  
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024), // MB
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024), // MB
    },
    database: 'checking...',
    responseTime: 0,
  }

  try {
    // Check Firestore connection
    await firestoreDb.collection('health_check').limit(1).get()
    health.database = 'connected (Firestore)'
  } catch (error: any) {
    health.status = 'error'
    health.database = `error: ${error.message}`
  }

  health.responseTime = Date.now() - startTime

  const statusCode = health.status === 'ok' ? 200 : 503
  
  return NextResponse.json(health, { 
    status: statusCode,
    headers: {
      'Cache-Control': 'no-store, must-revalidate',
      'X-Response-Time': `${health.responseTime}ms`,
    }
  })
}

export const dynamic = 'force-dynamic'
export const revalidate = 0
