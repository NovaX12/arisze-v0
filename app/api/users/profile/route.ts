import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'

// Removed duplicate GET function - using the one with Request parameter below

export async function PUT(request: Request) {
  try {
    console.log('🔵 PUT /api/users/profile - Profile update request received')
    
    // Get session to verify user is authenticated
    const session = await getServerSession(authOptions)
    
    console.log('👤 Session:', session?.user?.email, 'ID:', session?.user?.id)
    
    if (!session?.user?.id) {
      console.error('❌ Unauthorized: No session found')
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('📝 Update data received:', body)
    
    const { name, university, year, major, bio, showcaseBadges } = body

    // Validation
    if (!name && !university && !year && !major && !bio && !showcaseBadges) {
      console.error('❌ No fields provided for update')
      return NextResponse.json(
        { error: 'At least one field must be provided' },
        { status: 400 }
      )
    }

    console.log('🔌 Connecting to database...')
    // Connect to database
    const db = await getDatabase()
    console.log('✅ Database connected')
    
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

    console.log('💾 Update data prepared:', updateData)
    console.log('🔍 Updating user with ID:', session.user.id)

    // Handle both ObjectId format and string/number format
    let userQuery: any
    try {
      // Try ObjectId format first (standard MongoDB _id)
      userQuery = { _id: new ObjectId(session.user.id) }
      console.log('✅ Using ObjectId format for query')
    } catch (error) {
      // Fallback to direct ID (string or number) - for test/mock users
      userQuery = { _id: session.user.id }
      console.log('⚠️ Using direct ID format for query (non-ObjectId)')
    }

    // Update user profile
    const result = await db.collection('users').updateOne(
      userQuery,
      { $set: updateData }
    )

    console.log('📊 Update result:', { 
      matchedCount: result.matchedCount, 
      modifiedCount: result.modifiedCount 
    })

    if (result.matchedCount === 0) {
      console.error('❌ User not found with ID:', session.user.id)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Fetch updated user data
    const updatedUser = await db.collection('users').findOne(
      userQuery,
      { projection: { password: 0 } } // Exclude password
    )

    console.log('✅ Profile updated successfully')
    console.log('👤 Updated user:', updatedUser?.name, updatedUser?.email)

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser
    })

  } catch (error) {
    console.error('❌ Profile update error:', error)
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
