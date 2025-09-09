import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/init-db'

export async function POST() {
  try {
    const result = await initializeDatabase()
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Database initialized successfully!' 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error initializing database:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to initialize database' 
    }, { status: 500 })
  }
}

