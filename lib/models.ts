export interface User {
  _id?: string
  name: string
  email: string
  university: string
  year: string
  major: string
  bio: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface Event {
  _id?: string
  title: string
  description: string
  cafe: string
  image: string
  date: Date
  time: string
  tags: string[]
  attendees: number
  maxAttendees: number
  university: string
  contact: string
  address: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface Cafe {
  _id?: string
  name: string
  thumbnail: string
  phone: string
  email: string
  activities: string[]
  address: string
  university: string
  createdAt: Date
  updatedAt: Date
}

export interface University {
  _id?: string
  name: string
  thumbnail: string
  phone: string
  email: string
  website: string
  address: string
  createdAt: Date
  updatedAt: Date
}

export interface Post {
  _id?: string
  content: string
  author: string
  authorName: string
  authorAvatar?: string
  image?: string
  likes: number
  comments: Comment[]
  createdAt: Date
  updatedAt: Date
}

export interface Comment {
  _id?: string
  content: string
  author: string
  authorName: string
  authorAvatar?: string
  createdAt: Date
}

export interface Booking {
  _id?: string
  eventId: string
  userId: string
  userName: string
  userEmail: string
  groupSize: number
  date: Date
  time: string
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

export interface Badge {
  _id?: string
  name: string
  description: string
  icon: string
  color: string
  requirements: {
    type: 'events_attended' | 'posts_created' | 'profile_complete' | 'custom'
    value: number
  }
  createdAt: Date
}

export interface UserBadge {
  _id?: string
  userId: string
  badgeId: string
  earnedAt: Date
}

