import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { Cafe } from '@/lib/models'

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    const cafes = await db.collection('cafes').find({}).toArray()
    
    return NextResponse.json(cafes)
  } catch (error) {
    console.error('Error fetching cafes:', error)
    return NextResponse.json({ error: 'Failed to fetch cafes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cafeData: Omit<Cafe, '_id'> = await request.json()
    
    const db = await getDatabase()
    const result = await db.collection('cafes').insertOne({
      ...cafeData,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    return NextResponse.json({ 
      success: true, 
      cafeId: result.insertedId 
    })
  } catch (error) {
    console.error('Error creating cafe:', error)
    return NextResponse.json({ error: 'Failed to create cafe' }, { status: 500 })
  }
}

