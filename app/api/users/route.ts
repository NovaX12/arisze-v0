import { NextRequest, NextResponse } from 'next/server'
import { User } from '@/lib/models'
import { firestoreDb } from '@/lib/firebase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    let usersSnapshot
    
    if (email) {
      // Query by email if search parameter is present
      usersSnapshot = await firestoreDb
        .collection('users')
        .where('email', '==', email)
        .get()
    } else {
      // Fetch all users with a limit of 50
      usersSnapshot = await firestoreDb
        .collection('users')
        .limit(50)
        .get()
    }
    
    // Map documents to clean JSON array
    const users = usersSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData: Omit<User, '_id'> = await request.json()
    
    // Check if user already exists using Firestore query
    const existingUserSnapshot = await firestoreDb
      .collection('users')
      .where('email', '==', userData.email)
      .limit(1)
      .get()
    
    if (!existingUserSnapshot.empty) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }
    
    // Add new user to Firestore collection
    const docRef = await firestoreDb.collection('users').add({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    return NextResponse.json({ 
      success: true, 
      userId: docRef.id
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')
    const userData: Partial<User> = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }
    
    // Get document reference
    const userDocRef = firestoreDb.collection('users').doc(userId)
    
    // Check if document exists
    const userDoc = await userDocRef.get()
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Update document with userData and updatedAt timestamp
    await userDocRef.update({
      ...userData,
      updatedAt: new Date()
    })
    
    // Fetch updated document
    const updatedDoc = await userDocRef.get()
    
    return NextResponse.json({ 
      success: true,
      user: {
        id: updatedDoc.id,
        ...updatedDoc.data()
      }
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

