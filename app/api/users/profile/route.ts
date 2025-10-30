import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { firestoreDb } from '@/lib/firebase'
import admin from 'firebase-admin'

export const dynamic = 'force-dynamic'

// ✅ MIGRATED TO FIRESTORE

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, bio, location, university, avatar, year, major } = body

    console.log('🔵 PUT /api/users/profile - Update request:', { 
      email: session.user.email, 
      fields: { name, bio, location, university, year, major, hasAvatar: !!avatar } 
    })

    // Find user by email
    const usersSnapshot = await firestoreDb
      .collection('users')
      .where('email', '==', session.user.email)
      .limit(1)
      .get()

    if (usersSnapshot.empty) {
      console.log('❌ User not found for email:', session.user.email)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const userDoc = usersSnapshot.docs[0]
    const updateData: any = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }

    // Only update provided fields
    if (name !== undefined) updateData.name = name
    if (bio !== undefined) updateData.bio = bio
    if (location !== undefined) updateData.location = location
    if (university !== undefined) updateData.university = university
    if (avatar !== undefined) updateData.avatar = avatar
    if (year !== undefined) updateData.year = year
    if (major !== undefined) updateData.major = major

    console.log('📝 Updating Firestore with:', updateData)

    await userDoc.ref.update(updateData)

    // Get updated user data
    const updatedDoc = await userDoc.ref.get()
    const userData = updatedDoc.data()
    const updatedUser = { id: updatedDoc.id, ...userData }

    console.log('✅ Profile updated successfully for user:', session.user.email)

    return NextResponse.json(
      { 
        message: 'Profile updated successfully',
        user: updatedUser
      },
      { status: 200 }
    )
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
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find user by email
    const usersSnapshot = await firestoreDb
      .collection('users')
      .where('email', '==', session.user.email)
      .limit(1)
      .get()

    if (usersSnapshot.empty) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const userDoc = usersSnapshot.docs[0]
    const userData = { id: userDoc.id, ...userDoc.data() }

    return NextResponse.json(
      { user: userData },
      { status: 200 }
    )
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
