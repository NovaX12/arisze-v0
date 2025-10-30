import { NextRequest, NextResponse } from 'next/server'
import { firestoreDb } from '@/lib/firebase'
import { Post } from '@/lib/models'

export async function GET(request: NextRequest) {
  try {
    const postsSnapshot = await firestoreDb.collection('posts')
      .orderBy('createdAt', 'desc')
      .get()
    
    const posts = postsSnapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }))
    
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const postData: Omit<Post, '_id'> = await request.json()
    
    const docRef = await firestoreDb.collection('posts').add({
      ...postData,
      likes: 0,
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    return NextResponse.json({ 
      success: true, 
      postId: docRef.id 
    })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}

