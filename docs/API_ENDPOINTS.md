# ARISZE API Endpoints Documentation

## Overview
This document provides comprehensive documentation for all API endpoints in the ARISZE web application. All endpoints are built using Next.js 14 App Router and follow RESTful conventions.

## Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://arisze.vercel.app/api`

## Authentication
Most endpoints require authentication using NextAuth.js sessions. Protected endpoints return `401 Unauthorized` if not authenticated.

---

## 🔐 Authentication Endpoints

### POST `/api/auth/[...nextauth]`
NextAuth.js authentication handler for login/logout/session management.

**Providers:**
- Credentials (email/password)

**Example Login Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

---

## 📅 Event Endpoints

### GET `/api/events`
Retrieve all events with optional filtering.

**Query Parameters:**
- `type` (optional): `'all'`, `'system'`, `'user-generated'`
- `userId` (optional): Filter events by creator ID

**Example Request:**
```
GET /api/events?type=system
```

**Example Response:**
```json
[
  {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "title": "Coffee & Code Meetup",
    "description": "Weekly coding meetup for students",
    "date": "2024-01-15",
    "time": "18:00",
    "cafe": "Central Perk",
    "address": "123 Main St, Vilnius",
    "eventType": "system",
    "createdBy": "admin",
    "createdAt": "2024-01-01T10:00:00.000Z"
  }
]
```

### GET `/api/events-simple`
Simplified endpoint for basic event data retrieval.

**Example Response:**
```json
{
  "success": true,
  "count": 5,
  "events": [...]
}
```

### GET `/api/events/[id]/book`
Check if current user has booked a specific event.

**Authentication:** Required

**Example Response:**
```json
{
  "hasBooked": true,
  "booking": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
    "eventId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "userId": "user123",
    "userPhone": "+37060000000",
    "university": "Vilnius University"
  }
}
```

### POST `/api/events/[id]/book`
Book an event for the current user.

**Authentication:** Required

**Request Body:**
```json
{
  "userPhone": "+37060000000",
  "university": "Vilnius University",
  "hasGuest": false,
  "guestInfo": null
}
```

### GET `/api/events/[id]/participants`
Get all participants for an event (only for event creators).

**Authentication:** Required (Event Creator Only)

**Example Response:**
```json
[
  {
    "userId": "user123",
    "userName": "John Doe",
    "userEmail": "john@vu.lt",
    "userPhone": "+37060000000",
    "university": "Vilnius University",
    "hasGuest": false,
    "bookedAt": "2024-01-10T15:30:00.000Z"
  }
]
```

---

## 👤 User Endpoints

### GET `/api/users`
Retrieve users with optional email filtering.

**Query Parameters:**
- `email` (optional): Filter by specific email

**Example Request:**
```
GET /api/users?email=user@example.com
```

### PUT `/api/users`
Update user information.

**Query Parameters:**
- `id` (required): User ID to update

**Request Body:**
```json
{
  "name": "Updated Name",
  "university": "New University",
  "phone": "+37060000001"
}
```

### GET `/api/users/profile`
Get current user's profile information.

**Authentication:** Required

### GET `/api/user/events`
Get current user's events (booked and created).

**Authentication:** Required

**Query Parameters:**
- `type` (optional): `'booked'`, `'created'`, `'all'`

**Example Response:**
```json
{
  "bookedEvents": [...],
  "createdEvents": [...]
}
```

### GET `/api/user/created-events`
Get events created by the current user with participant details.

**Authentication:** Required

### GET `/api/user/bookings`
Get current user's event bookings with event details.

**Authentication:** Required

---

## 🏢 University Endpoints

### GET `/api/universities`
Retrieve all universities.

**Example Response:**
```json
[
  {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
    "name": "Vilnius University",
    "code": "VU",
    "domain": "vu.lt",
    "location": "Vilnius, Lithuania",
    "createdAt": "2024-01-01T10:00:00.000Z"
  }
]
```

### POST `/api/universities`
Create a new university.

**Request Body:**
```json
{
  "name": "New University",
  "code": "NU",
  "domain": "nu.lt",
  "location": "City, Country"
}
```

### POST `/api/universities/verify`
Submit university verification for current user.

**Authentication:** Required

**Request Body:**
```json
{
  "universityId": "64f8a1b2c3d4e5f6a7b8c9d2",
  "universityName": "Vilnius University",
  "studentName": "John Doe",
  "studentId": "ST123456",
  "universityEmail": "john.doe@vu.lt"
}
```

---

## ☕ Cafe Endpoints

### GET `/api/cafes`
Retrieve all cafes.

**Example Response:**
```json
[
  {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
    "name": "Central Perk",
    "address": "123 Main St, Vilnius",
    "description": "Cozy coffee shop perfect for studying",
    "amenities": ["WiFi", "Power Outlets", "Quiet Environment"],
    "createdAt": "2024-01-01T10:00:00.000Z"
  }
]
```

### POST `/api/cafes`
Create a new cafe.

**Request Body:**
```json
{
  "name": "New Cafe",
  "address": "456 Side St, Vilnius",
  "description": "Modern workspace cafe",
  "amenities": ["WiFi", "Meeting Rooms"]
}
```

---

## 🏆 Badge Endpoints

### GET `/api/badges`
Retrieve all available badges.

**Example Response:**
```json
[
  {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
    "name": "Event Organizer",
    "description": "Created your first event",
    "icon": "🎯",
    "criteria": "Create 1 event",
    "createdAt": "2024-01-01T10:00:00.000Z"
  }
]
```

---

## 📝 Post Endpoints

### GET `/api/posts`
Retrieve all posts sorted by creation date (newest first).

**Example Response:**
```json
[
  {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
    "title": "Study Tips for Finals",
    "content": "Here are some effective study strategies...",
    "author": "user123",
    "likes": 15,
    "comments": [],
    "createdAt": "2024-01-10T14:30:00.000Z"
  }
]
```

### POST `/api/posts`
Create a new post.

**Request Body:**
```json
{
  "title": "New Post Title",
  "content": "Post content here...",
  "author": "user123",
  "tags": ["study", "tips"]
}
```

---

## 🔧 Database Initialization Endpoints

### GET `/api/init-db`
Initialize database with sample data (development only).

**Example Response:**
```json
{
  "message": "Database initialized successfully",
  "collections": ["users", "events", "cafes", "universities", "badges"]
}
```

---

## 📞 Contact Endpoints

### POST `/api/contact`
Submit contact form.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Feature Request",
  "message": "I would like to suggest..."
}
```

---

## 🧪 Test Endpoints

### GET `/api/test`
Health check endpoint for API testing.

**Example Response:**
```json
{
  "message": "API is working correctly",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Error Handling

All endpoints follow consistent error response format:

```json
{
  "error": "Error message description",
  "details": "Additional error details (optional)"
}
```

### Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting
Currently no rate limiting is implemented, but it's recommended for production deployment.

## CORS
CORS is configured to allow requests from the frontend domain in production.

---

## Development Notes

### Adding New Endpoints
1. Create route file in `app/api/[endpoint]/route.ts`
2. Implement HTTP methods (GET, POST, PUT, DELETE)
3. Add authentication checks if required
4. Update this documentation

### Testing Endpoints
Use tools like Postman, curl, or the built-in test endpoints to verify functionality.

### Security Considerations
- All user inputs are validated
- Authentication is required for sensitive operations
- Database queries use parameterized queries to prevent injection
- Sensitive data is not exposed in responses

---

*Last Updated: January 2024*
*Version: 1.0.0*