# ARISZE Troubleshooting & Debugging Guide

## Overview
This guide provides comprehensive troubleshooting solutions for common issues encountered in the ARISZE application development and deployment process.

## 🚨 Critical Issues & Quick Fixes

### Database Connection Issues

#### MongoDB Atlas Connection Failed
**Symptoms:**
- "MongoNetworkError: failed to connect to server"
- "Authentication failed" errors
- Timeout errors during database operations

**Solutions:**
1. **Check Connection String:**
   ```bash
   # Verify MONGODB_URI in .env.local
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/arisze?retryWrites=true&w=majority
   ```

2. **IP Whitelist:**
   - Add `0.0.0.0/0` to MongoDB Atlas IP Access List for development
   - For production, use specific IP addresses

3. **Network Access:**
   ```bash
   # Test connection
   node test-db-connection.js
   ```

4. **Fallback to Mock Database:**
   ```typescript
   // In lib/mongodb.ts - Mock system activates automatically
   const useMockDatabase = !process.env.MONGODB_URI || connectionFailed
   ```

#### Collection Initialization Errors
**Symptoms:**
- "Collection does not exist" errors
- Empty database responses

**Solutions:**
1. **Run Database Initialization:**
   ```bash
   node init-collections.js
   ```

2. **Manual Collection Creation:**
   ```javascript
   // Access /api/init/collections endpoint
   POST /api/init/collections
   ```

### Authentication Issues

#### NextAuth.js Session Problems
**Symptoms:**
- Users not staying logged in
- "Session callback error" messages
- Redirect loops on protected pages

**Solutions:**
1. **Check Environment Variables:**
   ```bash
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   ```

2. **Clear Browser Storage:**
   ```javascript
   // Clear all auth-related storage
   localStorage.clear()
   sessionStorage.clear()
   // Clear cookies in browser dev tools
   ```

3. **Verify JWT Configuration:**
   ```typescript
   // In lib/auth.ts
   jwt: {
     strategy: "jwt",
     maxAge: 30 * 24 * 60 * 60, // 30 days
   }
   ```

#### User Registration Failures
**Symptoms:**
- "User already exists" for new emails
- Password hashing errors
- Database write failures

**Solutions:**
1. **Check Email Uniqueness:**
   ```typescript
   // Verify in users collection
   const existingUser = await User.findOne({ email })
   ```

2. **Password Validation:**
   ```typescript
   // Ensure password meets requirements
   const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
   ```

### API Route Errors

#### 500 Internal Server Error
**Symptoms:**
- API routes returning 500 status
- "Cannot read property" errors
- Database operation failures

**Solutions:**
1. **Check Request Validation:**
   ```typescript
   // Validate required fields
   if (!userId || !eventId) {
     return NextResponse.json(
       { error: "Missing required fields" },
       { status: 400 }
     )
   }
   ```

2. **Error Handling Wrapper:**
   ```typescript
   try {
     // API logic here
   } catch (error) {
     console.error("API Error:", error)
     return NextResponse.json(
       { error: "Internal server error" },
       { status: 500 }
     )
   }
   ```

#### CORS Issues
**Symptoms:**
- "Access-Control-Allow-Origin" errors
- Failed preflight requests
- Cross-origin request blocked

**Solutions:**
1. **Add CORS Headers:**
   ```typescript
   // In API routes
   const response = NextResponse.json(data)
   response.headers.set('Access-Control-Allow-Origin', '*')
   response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
   return response
   ```

### Component & UI Issues

#### Hydration Mismatches
**Symptoms:**
- "Hydration failed" warnings
- Content flashing on page load
- Server/client render differences

**Solutions:**
1. **Use Dynamic Imports:**
   ```typescript
   import dynamic from 'next/dynamic'
   
   const ClientOnlyComponent = dynamic(
     () => import('./ClientComponent'),
     { ssr: false }
   )
   ```

2. **Conditional Rendering:**
   ```typescript
   const [mounted, setMounted] = useState(false)
   
   useEffect(() => {
     setMounted(true)
   }, [])
   
   if (!mounted) return null
   ```

#### Animation Performance Issues
**Symptoms:**
- Laggy animations
- High CPU usage
- Frame drops during interactions

**Solutions:**
1. **Optimize Framer Motion:**
   ```typescript
   // Use transform properties for better performance
   <motion.div
     animate={{ x: 100, y: 100 }}
     transition={{ type: "spring", damping: 20 }}
   />
   ```

2. **Reduce Animation Complexity:**
   ```typescript
   // Prefer opacity and transform over layout changes
   const variants = {
     hidden: { opacity: 0, scale: 0.8 },
     visible: { opacity: 1, scale: 1 }
   }
   ```

### Build & Deployment Issues

#### Next.js Build Failures
**Symptoms:**
- TypeScript compilation errors
- Missing dependencies
- Build process hanging

**Solutions:**
1. **Clear Build Cache:**
   ```bash
   rm -rf .next
   npm run build
   ```

2. **Fix TypeScript Errors:**
   ```bash
   npx tsc --noEmit
   ```

3. **Update Dependencies:**
   ```bash
   npm update
   npm audit fix
   ```

#### Vercel Deployment Issues
**Symptoms:**
- Build failures on Vercel
- Environment variable issues
- Function timeout errors

**Solutions:**
1. **Check Build Logs:**
   - Review Vercel deployment logs
   - Identify specific error messages
   - Compare local vs. production builds

2. **Environment Variables:**
   ```bash
   # Ensure all required env vars are set in Vercel dashboard
   MONGODB_URI
   NEXTAUTH_URL
   NEXTAUTH_SECRET
   ```

3. **Function Timeout:**
   ```typescript
   // Optimize API routes for faster execution
   export const config = {
     maxDuration: 30, // seconds
   }
   ```

## 🔍 Debugging Tools & Techniques

### Database Debugging

#### MongoDB Compass
```bash
# Connect to view collections and documents
mongodb+srv://username:password@cluster.mongodb.net/arisze
```

#### Database Query Testing
```javascript
// Test queries in debug-api.js
const { MongoClient } = require('mongodb')

async function testQuery() {
  const client = new MongoClient(process.env.MONGODB_URI)
  await client.connect()
  const db = client.db('arisze')
  const result = await db.collection('users').findOne({ email: 'test@example.com' })
  // Check result in debugger or return for testing
  await client.close()
}
```

### API Testing

#### Using curl
```bash
# Test API endpoints
curl -X GET http://localhost:3000/api/events
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com"}'
```

#### Using Postman/Insomnia
- Import API collection from `docs/API_ENDPOINTS.md`
- Test all endpoints with sample data
- Verify response formats and status codes

### Frontend Debugging

#### React Developer Tools
- Install React DevTools browser extension
- Inspect component state and props
- Profile component performance

#### Browser Console Debugging
```javascript
// Use browser debugger instead of console logs
// Network tab for API calls
// Performance tab for rendering issues
```

### Performance Monitoring

#### Lighthouse Audits
```bash
# Run performance audits
npm install -g lighthouse
lighthouse http://localhost:3000 --view
```

#### Bundle Analysis
```bash
# Analyze bundle size
npm install -g @next/bundle-analyzer
ANALYZE=true npm run build
```

## 📊 Error Logging & Monitoring

### Console Logging Strategy
```typescript
// Structured logging approach for production
const logger = {
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[INFO] ${message}`, data)
    }
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error)
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data)
  }
}
```

### Error Boundaries
```typescript
// Implement error boundaries for better error handling
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>
    }
    return this.props.children
  }
}
```

## 🛠️ Development Environment Setup

### Required Tools
```bash
# Node.js version management
nvm install 18.17.0
nvm use 18.17.0

# Package manager
npm install -g pnpm

# Development dependencies
pnpm install
```

### Environment Configuration
```bash
# .env.local template
MONGODB_URI=mongodb+srv://...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
NODE_ENV=development
```

### IDE Configuration
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## 🚀 Performance Optimization

### Database Optimization
```javascript
// Index creation for better query performance
db.users.createIndex({ email: 1 })
db.events.createIndex({ date: 1, university: 1 })
db.bookings.createIndex({ userId: 1, eventId: 1 })
```

### Frontend Optimization
```typescript
// Code splitting and lazy loading
const LazyComponent = lazy(() => import('./HeavyComponent'))

// Image optimization
import Image from 'next/image'
<Image
  src="/image.jpg"
  alt="Description"
  width={500}
  height={300}
  priority={false}
  loading="lazy"
/>
```

### API Optimization
```typescript
// Response caching
export async function GET() {
  const data = await fetchData()
  
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
    }
  })
}
```

## 📝 Common Error Messages & Solutions

### "Cannot read property 'map' of undefined"
**Cause:** Trying to map over undefined array
**Solution:**
```typescript
// Use optional chaining and default values
{events?.map(event => <EventCard key={event.id} event={event} />)}
// or
{(events || []).map(event => <EventCard key={event.id} event={event} />)}
```

### "Module not found: Can't resolve '@/components/...'"
**Cause:** Path alias not configured properly
**Solution:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### "Warning: Each child in a list should have a unique 'key' prop"
**Cause:** Missing or duplicate keys in mapped components
**Solution:**
```typescript
// Use unique, stable keys
{events.map(event => (
  <EventCard key={event._id || event.id} event={event} />
))}
```

## 🔄 Recovery Procedures

### Database Recovery
1. **Backup Current State:**
   ```bash
   mongodump --uri="mongodb+srv://..." --out=backup/
   ```

2. **Restore from Backup:**
   ```bash
   mongorestore --uri="mongodb+srv://..." backup/
   ```

3. **Reinitialize Collections:**
   ```bash
   node init-collections.js
   ```

### Application Recovery
1. **Reset to Last Known Good State:**
   ```bash
   git reset --hard HEAD~1
   npm install
   npm run build
   ```

2. **Clear All Caches:**
   ```bash
   rm -rf .next node_modules package-lock.json
   npm install
   ```

## 📞 Support & Resources

### Internal Resources
- **[current-errors.md](./current-errors.md)** - Active issues tracking
- **[solved-errors.md](./solved-errors.md)** - Resolved issues archive
- **[API_ENDPOINTS.md](./API_ENDPOINTS.md)** - API documentation
- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Database structure

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Atlas Support](https://docs.atlas.mongodb.com/)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Vercel Support](https://vercel.com/docs)

### Emergency Contacts
- **Database Issues:** Check MongoDB Atlas dashboard
- **Deployment Issues:** Review Vercel deployment logs
- **Authentication Issues:** Verify NextAuth.js configuration

---

*Last Updated: December 2024*
*For additional support, check the current-errors.md file for active issues and solutions.*