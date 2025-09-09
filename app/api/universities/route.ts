import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { University } from '@/lib/models'

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    const universities = await db.collection('universities').find({}).toArray()
    
    return NextResponse.json(universities)
  } catch (error) {
    console.error('Error fetching universities:', error)
    return NextResponse.json({ error: 'Failed to fetch universities' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const universityData: Omit<University, '_id'> = await request.json()
    
    const db = await getDatabase()
    const result = await db.collection('universities').insertOne({
      ...universityData,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    return NextResponse.json({ 
      success: true, 
      universityId: result.insertedId 
    })
  } catch (error) {
    console.error('Error creating university:', error)
    return NextResponse.json({ error: 'Failed to create university' }, { status: 500 })
  }
}

