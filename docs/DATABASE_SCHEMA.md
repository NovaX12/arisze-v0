# ARISZE Database Schema Documentation

## Overview
This document provides comprehensive documentation of the ARISZE MongoDB database schema. The database consists of 9 main collections with well-defined relationships and data structures.

## Collections Overview

| Collection | Purpose | Key Features |
|------------|---------|--------------|
| `users` | User profiles and authentication | Profile management, social features |
| `events` | Event listings and management | System and user-generated events |
| `cafes` | Venue information | Study spaces and event venues |
| `posts` | Community content | Social feed with comments |
| `bookings` | Event registrations | User event participation |
| `badges` | Gamification system | Achievement tracking |
| `user_badges` | User achievements | Badge ownership records |
| `event_participants` | Event attendance | Detailed participation tracking |

---

## Collection Schemas

### 1. Users Collection (`users`)

**Purpose**: Stores user profiles, authentication data, and social features.

```typescript
interface User {
  _id?: string              // MongoDB ObjectId
  name: string             // Full name (required)
  email: string            // Unique email address (required)
  year: string            // Academic year (e.g., "1st Year", "2nd Year")
  major: string           // Field of study (required)
  bio: string             // User biography/description
  avatar?: string         // Profile picture URL (optional)
  createdAt: Date         // Account creation timestamp
  updatedAt: Date         // Last profile update timestamp
}
```

**Key Relationships**:
- `_id` → Referenced by `events.createdBy`, `posts.author`, `bookings.userId`

**Indexes**:
- `email` (unique)
- `createdAt`

---

### 2. Events Collection (`events`)

**Purpose**: Manages both system-generated and user-created events.

```typescript
interface Event {
  _id?: string                    // MongoDB ObjectId
  title: string                  // Event title (required)
  description: string            // Detailed event description
  cafe: string                   // Venue name (required)
  image: string                  // Event banner/thumbnail URL
  date: Date                     // Event date (required)
  time: string                   // Event time (e.g., "14:00-16:00")
  tags: string[]                 // Event categories/tags
  attendees: number              // Current attendee count
  maxAttendees: number           // Maximum capacity
  university: string             // Associated university
  contact: string                // Contact information
  address: string                // Venue address
  createdBy: string              // Creator ID ('system' or userId)
  createdByName?: string         // Creator's display name
  createdByEmail?: string        // Creator's email
  eventType: 'system' | 'user-generated'  // Event origin type
  isPublic: boolean              // Visibility flag
  createdAt: Date               // Creation timestamp
  updatedAt: Date               // Last modification timestamp
}
```

**Key Relationships**:
- `cafe` → References `cafes.name`
- `university` → References `universities.name`
- `createdBy` → References `users._id` (when not 'system')

**Indexes**:
- `date`
- `university`
- `eventType`
- `isPublic`
- `tags`

---

### 3. Cafes Collection (`cafes`)

**Purpose**: Stores information about study venues and event locations.

```typescript
interface Cafe {
  _id?: string              // MongoDB ObjectId
  name: string             // Cafe/venue name (required)
  thumbnail: string        // Venue image URL
  phone: string           // Contact phone number
  email: string           // Contact email address
  activities: string[]    // Available activities/amenities
  address: string         // Physical address
  university: string      // Associated university
  createdAt: Date        // Record creation timestamp
  updatedAt: Date        // Last update timestamp
}
```

**Key Relationships**:
- `university` → References `universities.name`
- `name` → Referenced by `events.cafe`

**Indexes**:
- `name`

---

### 4. Posts Collection (`posts`)

**Purpose**: Manages community feed content and social interactions.

```typescript
interface Post {
  _id?: string              // MongoDB ObjectId
  content: string          // Post text content (required)
  author: string           // Author user ID (required)
  authorName: string       // Author display name
  authorAvatar?: string    // Author profile picture URL
  image?: string           // Optional post image URL
  likes: number           // Like count
  comments: Comment[]     // Embedded comments array
  createdAt: Date        // Post creation timestamp
  updatedAt: Date        // Last modification timestamp
}
```

**Embedded Comment Schema**:
```typescript
interface Comment {
  _id?: string              // Comment ID
  content: string          // Comment text (required)
  author: string           // Commenter user ID
  authorName: string       // Commenter display name
  authorAvatar?: string    // Commenter profile picture
  createdAt: Date         // Comment timestamp
}
```

**Key Relationships**:
- `author` → References `users._id`
- `comments.author` → References `users._id`

**Indexes**:
- `author`
- `createdAt`

---

### 6. Bookings Collection (`bookings`)

**Purpose**: Tracks event registrations and participant information.

```typescript
interface Booking {
  _id?: string              // MongoDB ObjectId
  eventId: string          // Associated event ID (required)
  userId: string           // Booking user ID (required)
  userName: string         // User display name
  userEmail: string        // User email address
  userPhone?: string       // Optional phone number
  userUniversity?: string  // User's university
  userYear?: string        // User's academic year
  userMajor?: string       // User's field of study
  groupSize: number        // Number of attendees in booking
  hasGuest: boolean        // Whether booking includes guests
  guestInfo?: {            // Optional guest information
    name: string
    email: string
  }
  date: Date              // Booking date
  time: string            // Booking time slot
  status: 'pending' | 'confirmed' | 'cancelled'  // Booking status
  venueId?: string        // Legacy venue ID (backward compatibility)
  venueName?: string      // Legacy venue name (backward compatibility)
  createdAt: Date        // Booking creation timestamp
  updatedAt: Date        // Last status update timestamp
}
```

**Key Relationships**:
- `eventId` → References `events._id`
- `userId` → References `users._id`

**Indexes**:
- `eventId`
- `userId`
- `status`
- `date`

---

### 7. Badges Collection (`badges`)

**Purpose**: Defines achievement badges for the gamification system.

```typescript
interface Badge {
  _id?: string              // MongoDB ObjectId
  name: string             // Badge name (required)
  description: string      // Badge description
  icon: string            // Badge icon/image URL
  color: string           // Badge color theme
  requirements: {         // Achievement requirements
    type: 'events_attended' | 'posts_created' | 'profile_complete' | 'custom'
    value: number         // Required threshold value
  }
  createdAt: Date        // Badge creation timestamp
}
```

**Badge Types**:
- `events_attended`: Based on event participation count
- `posts_created`: Based on community post count
- `profile_complete`: Profile completion milestone
- `custom`: Special achievement criteria

**Indexes**:
- `name`
- `requirements.type`

---

### 8. User Badges Collection (`user_badges`)

**Purpose**: Tracks which badges users have earned.

```typescript
interface UserBadge {
  _id?: string              // MongoDB ObjectId
  userId: string           // Badge owner ID (required)
  badgeId: string         // Badge ID (required)
  earnedAt: Date          // Achievement timestamp
}
```

**Key Relationships**:
- `userId` → References `users._id`
- `badgeId` → References `badges._id`

**Indexes**:
- `userId`
- `badgeId`
- Compound: `userId + badgeId` (unique)

---

### 9. Event Participants Collection (`event_participants`)

**Purpose**: Detailed tracking of event attendance and participation.

```typescript
interface EventParticipant {
  _id?: string              // MongoDB ObjectId
  eventId: string          // Event ID (required)
  userId: string           // Participant user ID (required)
  userName: string         // Participant display name
  userEmail: string        // Participant email
  userPhone?: string       // Optional phone number
  userUniversity?: string  // Participant's university
  groupSize: number        // Size of participant's group
  hasGuest: boolean        // Whether participant has guests
  guestInfo?: {            // Optional guest details
    name: string
    email: string
  }
  joinedAt: Date          // Registration timestamp
  status: 'registered' | 'attended' | 'no-show'  // Participation status
}
```

**Key Relationships**:
- `eventId` → References `events._id`
- `userId` → References `users._id`

**Indexes**:
- `eventId`
- `userId`
- `status`
- Compound: `eventId + userId` (unique)

---

## Additional Interfaces

### User Created Events (`user_created_events`)
```typescript
interface UserCreatedEvent {
  _id?: string              // MongoDB ObjectId
  userId: string           // Creator user ID
  eventId: string         // Created event ID
  createdAt: Date         // Creation timestamp
}
```

### User Event Profile (`user_event_profiles`)
```typescript
interface UserEventProfile {
  _id?: string                    // MongoDB ObjectId
  userId: string                 // User ID (required)
  eventsCreated: number          // Total events created by user
  eventsAttended: number         // Total events attended by user
  totalParticipantsHosted: number // Total participants in user's events
  lastEventCreated?: Date        // Most recent event creation
  lastEventAttended?: Date       // Most recent event attendance
  updatedAt: Date               // Last profile update
}
```

---

## Database Relationships Diagram

```
Users ──┐
        ├── Events (createdBy)
        ├── Posts (author)
        ├── Bookings (userId)
        ├── UserBadges (userId)
        └── EventParticipants (userId)

Universities ──┐
               ├── Users (university)
               ├── Events (university)
               └── Cafes (university)

Events ──┐
         ├── Bookings (eventId)
         └── EventParticipants (eventId)

Cafes ── Events (cafe)

Badges ── UserBadges (badgeId)
```

---

## Data Validation Rules

### Required Fields
- **Users**: name, email, university, year, major, bio
- **Events**: title, description, cafe, date, university, eventType
- **Cafes**: name, university
- **Universities**: name
- **Posts**: content, author
- **Bookings**: eventId, userId, groupSize
- **Badges**: name, description, requirements
- **UserBadges**: userId, badgeId

### Unique Constraints
- `users.email`
- `universities.name`
- `user_badges.userId + badgeId`
- `event_participants.eventId + userId`

### Data Types
- All `_id` fields: MongoDB ObjectId
- All `Date` fields: ISO 8601 DateTime
- Arrays: `tags[]`, `activities[]`, `comments[]`
- Numbers: `attendees`, `maxAttendees`, `likes`, `groupSize`
- Booleans: `hasGuest`, `isPublic`

---

## Performance Considerations

### Indexing Strategy
1. **Primary Indexes**: All `_id` fields (automatic)
2. **Unique Indexes**: `users.email`, `universities.name`
3. **Query Indexes**: `events.date`, `events.university`, `posts.createdAt`
4. **Compound Indexes**: `user_badges.userId + badgeId`

### Query Optimization
- Use projection to limit returned fields
- Implement pagination for large result sets
- Cache frequently accessed data (universities, badges)
- Use aggregation pipelines for complex queries

### Data Integrity
- Validate foreign key references in application layer
- Implement cascade delete policies for related records
- Use transactions for multi-collection operations
- Regular data consistency checks

---

## Migration Notes

### Schema Evolution
- All timestamps use consistent Date format
- Legacy fields (`venueId`, `venueName`) maintained for backward compatibility
- Event types distinguish between system and user-generated content
- Badge system designed for extensibility

### Version History
- v1.0: Initial schema design
- v1.1: Added event types and user-generated events
- v1.2: Enhanced badge system with requirements
- v1.3: Added event participants tracking
- Current: v1.3 (Stable)

---

*Last Updated: January 2025*
*For technical questions, refer to the main ARISZE documentation or contact the development team.*