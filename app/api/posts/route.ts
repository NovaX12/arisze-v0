import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { Post } from '@/lib/models'

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    const posts = await db.collection('posts')
      .find({})
      .sort({ createdAt: -1 })
      .toArray()
    
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const postData: Omit<Post, '_id'> = await request.json()
    
    const db = await getDatabase()
    const result = await db.collection('posts').insertOne({
      ...postData,
      likes: 0,
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    return NextResponse.json({ 
      success: true, 
      postId: result.insertedId 
    })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}

