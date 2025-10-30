import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { firestoreDb } from '@/lib/firebase'
import path from 'path'
import fs from 'fs'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    console.log('🔵 POST /api/users/avatar-upload - Avatar upload request received')
    
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

    const { avatarUrl } = await request.json()
    console.log('📸 Avatar URL length:', avatarUrl?.length)

    // Validation
    if (!avatarUrl) {
      console.error('❌ No avatar URL provided')
      return NextResponse.json(
        { error: 'Avatar URL is required' },
        { status: 400 }
      )
    }

    // Basic validation for base64 data URL or HTTP URL
    if (!avatarUrl.startsWith('data:image/') && !avatarUrl.startsWith('http')) {
      console.error('❌ Invalid avatar URL format:', avatarUrl.substring(0, 50))
      return NextResponse.json(
        { error: 'Invalid avatar URL format' },
        { status: 400 }
      )
    }

    console.log(' Updating user avatar for ID:', session.user.id)
    
    // Update user avatar in Firestore
    await firestoreDb.collection('users').doc(session.user.id).update({
      avatar: avatarUrl,
      updatedAt: new Date()
    })

    console.log('✅ Avatar updated successfully')

    return NextResponse.json({
      message: 'Avatar updated successfully',
      avatarUrl: avatarUrl
    })

  } catch (error) {
    console.error('❌ Avatar upload error:', error)
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

