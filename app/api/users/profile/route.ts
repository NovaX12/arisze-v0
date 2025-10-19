import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'

// Removed duplicate GET function - using the one with Request parameter below

export async function PUT(request: Request) {
  try {
    // Get session to verify user is authenticated
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    const { name, university, year, major, bio, showcaseBadges } = await request.json()

    // Validation
    if (!name && !university && !year && !major && !bio && !showcaseBadges) {
      return NextResponse.json(
        { error: 'At least one field must be provided' },
        { status: 400 }
      )
    }

    // Connect to database
    const db = await getDatabase()
    
    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    }
    
    if (name !== undefined) updateData.name = name
    if (university !== undefined) updateData.university = university
    if (year !== undefined) updateData.year = year
    if (major !== undefined) updateData.major = major
    if (bio !== undefined) updateData.bio = bio
    if (showcaseBadges !== undefined) updateData.showcaseBadges = showcaseBadges

    // Update user profile
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(session.user.id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Fetch updated user data
    const updatedUser = await db.collection('users').findOne(
      { _id: new ObjectId(session.user.id) },
      { projection: { password: 0 } } // Exclude password
    )

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    // Get session to verify user is authenticated
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Connect to database
    const db = await getDatabase()
    
    // Fetch user profile (handle both ObjectId and string formats)
    let query;
    try {
      // Try ObjectId format first (real MongoDB)
      query = { _id: new ObjectId(session.user.id) };
    } catch (error) {
      // Fallback to string format (mock database)
      query = { _id: session.user.id };
    }
    
    const user = await db.collection('users').findOne(
      query as any,
      { projection: { password: 0 } } // Exclude password
    )

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: user
    })

  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
