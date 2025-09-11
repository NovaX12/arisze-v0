import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  const { name, email, password, university, year, major } = await request.json()

  // Validation
  if (!name || !email || !password) {
    return NextResponse.json({ 
      message: 'Name, email, and password are required' 
    }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ 
      message: 'Password must be at least 8 characters long' 
    }, { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ 
      message: 'Please enter a valid email address' 
    }, { status: 400 })
  }

  try {
    console.log('Registration attempt for:', { name, email })

    // Connect to database
    const db = await getDatabase()

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email })
    if (existingUser) {
      console.log('User already exists:', email)
      return NextResponse.json({ 
        message: 'User with this email already exists' 
      }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create new user with default earned badges
    const newUser = {
      name,
      email,
      password: hashedPassword,
      university: university || '',
      year: year || '',
      major: major || '',
      bio: '',
      avatar: '',
      earnedBadges: ['newbie', 'profile-pro', 'early-bird', 'academic-ally'],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('users').insertOne(newUser)
    console.log('User created successfully:', result.insertedId)

    // Return success (don't include password)
    const { password: _, ...userWithoutPassword } = newUser
    return NextResponse.json({ 
      message: 'User created successfully',
      user: {
        id: result.insertedId.toString(),
        ...userWithoutPassword
      }
    }, { status: 201 })

  } catch (error: unknown) {
    console.error('Registration error:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
      return NextResponse.json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Registration failed'
      }, { status: 500 })
    }
    return NextResponse.json({ 
      message: 'Internal server error',
      error: 'Registration failed'
    }, { status: 500 })
  }
}
