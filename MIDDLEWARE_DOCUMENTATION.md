# NextAuth Session Middleware Documentation

## Overview

The `verifyNextAuthSession` middleware ensures that Express.js routes are protected by verifying active NextAuth sessions. It extracts the user's ID from session cookies or Authorization headers and attaches it to the request object as `req.user.uid`.

---

## Installation

```bash
npm install express next-auth
```

---

## File Structure

```
arisze-app/
├── middleware/
│   └── verifyNextAuthSession.js    # Middleware implementation
├── test-middleware.js              # Test server demonstrating usage
└── .env.local                      # Contains NEXTAUTH_SECRET
```

---

## Middleware Function: `verifyNextAuthSession`

### Description

Verifies that a user has an active NextAuth session and extracts user information.

### Parameters

- `req` (Object) - Express request object
- `res` (Object) - Express response object  
- `next` (Function) - Express next middleware function

### Behavior

1. **Checks for NextAuth session cookie** (primary method)
2. **Falls back to Authorization header** with Bearer token
3. **Extracts user ID** from token (converts to string)
4. **Attaches user data** to `req.user` object
5. **Blocks request** if no valid session (returns 401)

### Attached User Object

```javascript
req.user = {
  uid: "user-id-string",     // User ID as string (always present)
  email: "user@example.com", // User email (nullable)
  name: "John Doe",          // User name (nullable)
  image: "https://..."       // User avatar URL (nullable)
}
```

---

## Usage Examples

### Basic Protected Route

```javascript
const express = require('express')
const { verifyNextAuthSession } = require('./middleware/verifyNextAuthSession')

const app = express()

// Protected endpoint - requires authentication
app.get('/api/protected', verifyNextAuthSession, (req, res) => {
  res.json({
    message: 'You are authenticated!',
    userId: req.user.uid,        // Always a string
    email: req.user.email
  })
})
```

### User-Specific Data Route

```javascript
// Fetch user's own data
app.get('/api/user/data', verifyNextAuthSession, async (req, res) => {
  const userId = req.user.uid  // String type guaranteed
  
  // Use userId to fetch from database
  const userData = await db.collection('users').findOne({ _id: userId })
  
  res.json({ success: true, data: userData })
})
```

### Protected POST Route

```javascript
// Create user-specific resource
app.post('/api/events/create', verifyNextAuthSession, async (req, res) => {
  const { title, description } = req.body
  
  const newEvent = {
    title,
    description,
    createdBy: req.user.uid,      // User ID as string
    createdByEmail: req.user.email,
    createdAt: new Date()
  }
  
  await db.collection('events').insertOne(newEvent)
  
  res.json({ success: true, event: newEvent })
})
```

---

## Optional Authentication

Use `optionalAuth` middleware for routes that work with or without authentication:

```javascript
const { optionalAuth } = require('./middleware/verifyNextAuthSession')

// Public route with optional user info
app.get('/api/posts', optionalAuth, async (req, res) => {
  const posts = await db.collection('posts').find({}).toArray()
  
  // Add user-specific data if authenticated
  if (req.user) {
    const userLikes = await db.collection('likes')
      .find({ userId: req.user.uid })
      .toArray()
    
    return res.json({ posts, userLikes })
  }
  
  // Public view without user data
  res.json({ posts })
})
```

---

## Testing with cURL

### Test Public Endpoint

```bash
curl http://localhost:3001/api/public
```

### Test Protected Endpoint (will fail without auth)

```bash
curl http://localhost:3001/api/protected
# Response: {"error":"Unauthorized","message":"No active session found. Please log in."}
```

### Test with Authorization Header

```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     http://localhost:3001/api/protected
```

### Test with Session Cookie

```bash
curl -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
     http://localhost:3001/api/protected
```

---

## Running the Test Server

```bash
# Start test server on port 3001
node test-middleware.js
```

### Available Test Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/health` | ❌ No | Health check |
| GET | `/api/public` | ❌ No | Public endpoint |
| GET | `/api/public-with-user` | ⚠️ Optional | Shows user if authenticated |
| GET | `/api/protected` | ✅ Yes | Protected endpoint |
| POST | `/api/protected/data` | ✅ Yes | Protected POST |
| GET | `/api/user/profile` | ✅ Yes | User profile |

---

## Error Responses

### 401 Unauthorized - No Session

```json
{
  "error": "Unauthorized",
  "message": "No active session found. Please log in.",
  "code": "NO_SESSION"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal Server Error",
  "message": "Failed to verify session",
  "code": "SESSION_VERIFICATION_FAILED"
}
```

---

## Integration with Next.js API Routes

You can also use this middleware in Next.js API routes:

```javascript
// pages/api/protected-route.js
import { verifyNextAuthSession } from '@/middleware/verifyNextAuthSession'

export default async function handler(req, res) {
  // Wrap in promise to use with Next.js
  await new Promise((resolve, reject) => {
    verifyNextAuthSession(req, res, (error) => {
      if (error) reject(error)
      else resolve()
    })
  })
  
  // req.user is now available
  return res.json({
    message: 'Protected data',
    userId: req.user.uid
  })
}
```

---

## Environment Variables Required

```env
# .env.local
NEXTAUTH_SECRET=your-secret-key-here
NODE_ENV=development  # or 'production'
```

---

## Type Safety (TypeScript)

For TypeScript projects, add this to your type definitions:

```typescript
// types/express.d.ts
declare namespace Express {
  interface Request {
    user?: {
      uid: string
      email: string | null
      name: string | null
      image: string | null
    }
  }
}
```

---

## Security Considerations

1. **Always verify NEXTAUTH_SECRET** is set and secure
2. **Use HTTPS in production** to protect session cookies
3. **Validate user permissions** after authentication
4. **Check req.user.uid** before database operations
5. **Sanitize user inputs** even after authentication

---

## Troubleshooting

### Issue: "No active session found"

**Cause:** Session cookie or token not present or invalid

**Solutions:**
- Ensure user is logged in via NextAuth
- Check that session cookie is being sent
- Verify NEXTAUTH_SECRET matches between apps
- Check cookie domain and path settings

### Issue: "Session verification failed"

**Cause:** Error decoding token or reading session

**Solutions:**
- Check NEXTAUTH_SECRET is correct
- Verify NextAuth version compatibility
- Check server logs for detailed error
- Ensure next-auth package is installed

---

## Complete Example: CRUD API with Authentication

```javascript
const express = require('express')
const { verifyNextAuthSession } = require('./middleware/verifyNextAuthSession')

const app = express()
app.use(express.json())

// Create - Protected
app.post('/api/items', verifyNextAuthSession, async (req, res) => {
  const item = {
    ...req.body,
    userId: req.user.uid,  // String type
    createdAt: new Date()
  }
  
  await db.collection('items').insertOne(item)
  res.json({ success: true, item })
})

// Read - Public with optional user context
app.get('/api/items', optionalAuth, async (req, res) => {
  const items = await db.collection('items').find({}).toArray()
  
  // Mark items owned by current user
  if (req.user) {
    items.forEach(item => {
      item.isOwner = item.userId === req.user.uid
    })
  }
  
  res.json({ items })
})

// Update - Protected, owner only
app.put('/api/items/:id', verifyNextAuthSession, async (req, res) => {
  const item = await db.collection('items').findOne({ _id: req.params.id })
  
  if (!item) {
    return res.status(404).json({ error: 'Item not found' })
  }
  
  if (item.userId !== req.user.uid) {
    return res.status(403).json({ error: 'Not authorized' })
  }
  
  await db.collection('items').updateOne(
    { _id: req.params.id },
    { $set: req.body }
  )
  
  res.json({ success: true })
})

// Delete - Protected, owner only
app.delete('/api/items/:id', verifyNextAuthSession, async (req, res) => {
  const item = await db.collection('items').findOne({ _id: req.params.id })
  
  if (!item) {
    return res.status(404).json({ error: 'Item not found' })
  }
  
  if (item.userId !== req.user.uid) {
    return res.status(403).json({ error: 'Not authorized' })
  }
  
  await db.collection('items').deleteOne({ _id: req.params.id })
  
  res.json({ success: true })
})

app.listen(3001)
```

---

## Summary

✅ **Created:** `verifyNextAuthSession` middleware  
✅ **Type:** User ID always returned as string (`req.user.uid`)  
✅ **Source:** Session cookie or Authorization Bearer token  
✅ **Behavior:** Blocks unauthorized requests with 401  
✅ **Bonus:** `optionalAuth` for public routes with user context  
✅ **Testing:** Complete test server with examples  

The middleware is production-ready and follows Express.js best practices! 🚀
