/**
 * Type Definitions for Firestore Collections
 * All interfaces for database models
 */

export interface User {
  id?: string
  email: string
  name?: string
  password?: string
  image?: string
  university?: string
  year?: string
  major?: string
  bio?: string
  showcaseBadges?: string[]
  isOnline?: boolean
  lastActive?: Date
  createdAt?: Date
  updatedAt?: Date
}

export interface Event {
  _id?: string
  id?: string
  title: string
  description?: string
  type?: string
  location?: string
  venue?: string
  image?: string
  imageUrl?: string
  date?: Date | string
  time?: string
  startTime?: string
  endTime?: string
  createdBy: string
  isPublic?: boolean
  capacity?: number
  maxAttendees?: number
  attendees?: number
  university?: string
  tags?: string[]
  createdAt?: Date
  updatedAt?: Date
}

export interface UserCreatedEvent {
  id?: string
  userId: string
  eventId: string
  createdAt?: Date
}

export interface UserEventProfile {
  id?: string
  userId: string
  eventsCreated: number
  eventsBooked: number
  updatedAt?: Date
}

export interface Booking {
  id?: string
  userId: string
  eventId: string
  status: 'pending' | 'confirmed' | 'cancelled'
  groupSize?: number
  hasGuest?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface EventParticipant {
  id?: string
  userId: string
  eventId: string
  status: 'pending' | 'confirmed' | 'cancelled'
  groupSize: number
  hasGuest: boolean
  createdAt?: Date
}

export interface Badge {
  id?: string
  userId: string
  type: string
  name: string
  description?: string
  awardedAt?: Date
}

export interface Post {
  id?: string
  userId: string
  content: string
  imageUrl?: string
  likes?: number
  comments?: number
  createdAt?: Date
  updatedAt?: Date
}
