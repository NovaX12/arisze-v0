import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(request: Request) {
  try {
    // Get session to verify user is authenticated
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    const { avatarUrl } = await request.json()

    // Validation
    if (!avatarUrl) {
      return NextResponse.json(
        { error: 'Avatar URL is required' },
        { status: 400 }
      )
    }

    // Basic validation for base64 data URL or HTTP URL
    if (!avatarUrl.startsWith('data:image/') && !avatarUrl.startsWith('http')) {
      return NextResponse.json(
        { error: 'Invalid avatar URL format' },
        { status: 400 }
      )
    }

    // Connect to database
    const db = await getDatabase()
    
    // Update user avatar
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(session.user.id) },
      { 
        $set: { 
          avatar: avatarUrl,
          updatedAt: new Date()
        } 
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Avatar updated successfully',
      avatarUrl: avatarUrl
    })

  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Generate presigned URL for direct upload (if using cloud storage)
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

    // For now, we'll use a simple file upload approach
    // In production, you would generate a presigned URL for AWS S3, Cloudinary, etc.
    
    return NextResponse.json({
      message: 'Use direct upload for now',
      uploadUrl: '/api/users/avatar-upload',
      // In production, return presigned URL here
      // presignedUrl: await generatePresignedUrl(session.user.id)
    })

  } catch (error) {
    console.error('Presigned URL generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

