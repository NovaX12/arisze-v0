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

    const { universityId, universityName, studentName, studentId, universityEmail } = await request.json()

    // Validation
    if (!universityId || !universityName || !studentName || !studentId || !universityEmail) {
      return NextResponse.json(
        { error: 'All verification fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(universityEmail)) {
      return NextResponse.json(
        { error: 'Please provide a valid university email address' },
        { status: 400 }
      )
    }

    // Connect to database
    const db = await getDatabase()
    
    // Create verification record (optional - for logging purposes)
    const verificationRecord = {
      userId: new ObjectId(session.user.id),
      universityId,
      universityName,
      studentName,
      studentId,
      universityEmail,
      status: 'pending', // In a real app, this might be 'pending', 'approved', 'rejected'
      submittedAt: new Date(),
      verifiedAt: null
    }

    await db.collection('verifications').insertOne(verificationRecord)

    // Update the main User document with verification data
    const updateResult = await db.collection('users').updateOne(
      { _id: new ObjectId(session.user.id) },
      { 
        $set: { 
          university: universityName,
          studentId: studentId,
          universityEmail: universityEmail,
          studentName: studentName,
          verificationStatus: 'verified', // Auto-approve for demo purposes
          updatedAt: new Date()
        } 
      }
    )

    if (updateResult.matchedCount === 0) {
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
      message: 'Student verification submitted successfully! Your profile has been updated.',
      verification: {
        id: verificationRecord,
        status: 'verified'
      },
      user: updatedUser
    }, { status: 201 })

  } catch (error) {
    console.error('Student verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
