export interface User {
  _id?: string
  name: string
  email: string
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
  venue: string
  image: string
  date: Date
  time: string
  tags: string[]
  attendees: number
  maxAttendees: number
  contact: string
  address: string
  createdBy: string // 'system' for admin events, userId for user-generated events
  createdByName?: string // Name of the user who created the event
  createdByEmail?: string // Email of the user who created the event
  eventType: 'system' | 'user-generated' // Distinguish between system and user events
  isPublic: boolean // Whether the event is visible to all users
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
  userPhone?: string
  userYear?: string
  userMajor?: string
  groupSize: number
  hasGuest: boolean
  guestInfo?: {
    name: string
    email: string
  }
  date: Date
  time: string
  status: 'pending' | 'confirmed' | 'cancelled'
  specialRequirements?: string
  createdAt: Date
  updatedAt: Date
}

export interface EventParticipant {
  _id?: string
  userId: string
  userName: string
  userEmail: string
  userPhone?: string
  groupSize: number
  hasGuest: boolean
  guestInfo?: {
    name: string
    email: string
  }
  joinedAt: Date
  status: 'registered' | 'attended' | 'no-show'
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  color: string
  criteria: {
    type: 'events_attended' | 'events_created' | 'profile_completion' | 'social_interaction'
    threshold: number
  }
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface UserBadge {
  badgeId: string
  earnedAt: Date
  progress?: number
}

export interface UserProfile extends User {
  earnedBadges?: UserBadge[]
  showcaseBadges?: string[] // Badge IDs to display on profile
  eventsAttended?: number
  eventsCreated?: number
  connections?: string[] // User IDs
  preferences?: {
    notifications: boolean
    privacy: 'public' | 'private'
    theme: 'light' | 'dark' | 'system'
  }
}

export interface UserCreatedEvent {
  _id?: string
  userId: string
  eventId: string
  createdAt: Date
}

export interface UserEventProfile {
  _id?: string
  userId: string
  eventsCreated: number
  eventsAttended: number
  totalBookings: number
  createdAt: Date
  updatedAt: Date
}

