import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/init-db'

export async function POST() {
  try {
    const result = await initializeDatabase()
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Database initialized successfully with sample data!' 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to initialize database',
        error: result.error 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in init-db API:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}