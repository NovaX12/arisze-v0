import { NextRequest, NextResponse } from 'next/server'
import { firestoreDb, admin } from '@/lib/firebase'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUserSnapshot = await firestoreDb
      .collection('users')
      .where('email', '==', email)
      .limit(1)
      .get()
      
    if (!existingUserSnapshot.empty) {
      console.log(`⚠️ Registration attempt with existing email: ${email}`)
      return NextResponse.json(
        { error: 'User already exists with this email. Please login instead.' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user in Firestore
    const docRef = await firestoreDb.collection('users').add({
      name,
      email,
      password: hashedPassword,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      role: 'user',
      isActive: true
    })

    return NextResponse.json(
      { 
        message: 'User created successfully',
        userId: docRef.id
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
