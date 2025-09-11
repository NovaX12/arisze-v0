import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    console.log('Testing database connection...')
    console.log('USE_MOCK_DB:', process.env.USE_MOCK_DB)
    
    const db = await getDatabase()
    console.log('Database connection established')
    
    // Test the connection by listing collections
    const collections = await db.listCollections().toArray()
    console.log('Collections retrieved:', collections.length)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful!',
      collections: collections.map(col => col.name),
      mockMode: process.env.USE_MOCK_DB === 'true'
    })
  } catch (error) {
    console.error('Database connection error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to connect to database',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

