# Arisze - Student Connection Platform

A Next.js-based social platform designed to connect university students in Kaunas, Lithuania. Discover events, meet fellow students, and build lasting connections.

## 🚀 Current Status

**Last Updated:** January 2025  
**Version:** 0.1.0  
**Status:** Development - Core Features Implemented

## 🌟 Live Application

- **Local Development:** http://localhost:3000
- **Contact Page with Crown Animation:** http://localhost:3000/contact
- **Events & Booking:** http://localhost:3000/events
- **Dashboard:** http://localhost:3000/dashboard (requires authentication)

## ✅ Implemented Features

### 🎨 **UI/UX Components**
- ✅ **Responsive Design** - Mobile, tablet, and desktop optimized
- ✅ **Dark/Light Theme** - Theme switching with system preference detection
- ✅ **Glassmorphism Effects** - Modern glass-like UI elements
- ✅ **Framer Motion Animations** - Smooth page transitions and micro-interactions
- ✅ **Crown 3D Animation** - Stunning rotating crown on contact page with:
  - Infinite rotation (10-second cycle)
  - Golden gradients and precious gems
  - Sparkle effects and floating particles
  - Hardware-accelerated rendering

### 🔐 **Authentication System**
- ✅ **NextAuth.js Integration** - Secure authentication framework
- ✅ **Email/Password Login** - Traditional authentication
- ✅ **Google OAuth** - Social login (requires Google client setup)
- ✅ **Protected Routes** - Dashboard and user-specific pages
- ✅ **Session Management** - Persistent login state
- ✅ **User Registration** - Account creation with validation

### 🎓 **Event Management System**
- ✅ **Event Booking API** - Full CRUD operations with MongoDB
  - `POST /api/bookings` - Create new bookings
  - `GET /api/bookings` - Fetch user's bookings
  - `DELETE /api/bookings` - Cancel bookings
- ✅ **Booking Modal** - Interactive event booking form with:
  - Calendar date picker
  - Time slot selection
  - Group size configuration
  - Real-time validation
- ✅ **My Events Dashboard** - Personal booking management
- ✅ **Toast Notifications** - Success/error feedback using Sonner
- ✅ **Real-time UI Updates** - Immediate reflection of booking changes

### 🏆 **Badge System**
- ✅ **Badge Components** - Visual badge display system
- ✅ **Drag & Drop Interface** - Interactive badge management
- ✅ **Badge Categories** - Multiple badge types (academic, social, achievement)
- ✅ **Showcase System** - Display selected badges on profile

### 👤 **User Profile System**
- ✅ **Profile Management** - User data CRUD operations
- ✅ **Avatar Upload System** - Profile picture management
- ✅ **University Information** - Academic details storage
- ✅ **Profile Sections** - Organized user information display

### 📧 **Contact System**
- ✅ **Contact Form** - Functional contact form with validation
- ✅ **Email Logging** - Server-side email logging (development mode)
- ✅ **Form Validation** - Client-side and server-side validation
- ✅ **Success Feedback** - User confirmation of message submission

### 🏛️ **University Integration**
- ✅ **University Cards** - Display university information
- ✅ **Student Verification Forms** - Academic status verification
- ✅ **University API** - Data fetching from MongoDB

## 🚧 Incomplete/Broken Features

### ⚠️ **Database Connection Issues**
- **Status:** Intermittent MongoDB Atlas connectivity
- **Error:** `getaddrinfo ENOTFOUND ac-jeqvtfv-shard-00-02.y20yxd7.mongodb.net`
- **Impact:** 
  - User profile data may not persist
  - Event bookings may fail to save
  - University data loading issues
- **Workaround:** Application continues to function with fallback data

### 🔧 **Partially Implemented Features**

#### **Badge Persistence**
- **Status:** Backend implemented, frontend connection incomplete
- **Issues:**
  - Drag-and-drop state not fully persisted
  - Badge showcase may reset on page refresh
  - Database sync inconsistent

#### **Avatar Synchronization**
- **Status:** Upload works, header sync incomplete
- **Issues:**
  - Header avatar doesn't update immediately after upload
  - Session refresh required for avatar sync
  - Base64 storage may cause performance issues

#### **Student Verification**
- **Status:** Form functional, profile sync incomplete
- **Issues:**
  - Verification data doesn't automatically update main profile
  - Manual refresh required to see changes
  - Verification status not displayed properly

### 📧 **Email System Limitations**
- **Status:** Development mode only
- **Issues:**
  - Emails logged to console, not actually sent
  - Resend API key not configured
  - No email delivery confirmation

## 🔗 Dead Links & Non-functional Elements

### **Navigation Links**
- ❌ **Community Page** - `/community` (placeholder content)
- ❌ **About Page** - Not implemented
- ❌ **Help/Support** - No help system

### **Social Features**
- ❌ **User Connections** - Friend/follow system not implemented
- ❌ **Event Comments** - No comment system on events
- ❌ **Event Reviews** - No rating/review system
- ❌ **Social Sharing** - No share functionality

### **Advanced Features**
- ❌ **Real-time Chat** - No messaging system
- ❌ **Notifications** - No push notification system
- ❌ **Event Calendar** - No calendar integration
- ❌ **Location Services** - No map integration
- ❌ **Payment System** - No payment processing for paid events

## 🛠️ Technical Stack

### **Frontend**
- **Framework:** Next.js 14.2.16 (App Router)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **UI Components:** Custom components with Radix UI primitives
- **Icons:** Lucide React
- **Notifications:** Sonner

### **Backend**
- **Runtime:** Node.js 23.11.0
- **Database:** MongoDB Atlas
- **Authentication:** NextAuth.js v4
- **API:** Next.js API Routes
- **Validation:** Zod

### **Development Tools**
- **Package Manager:** npm
- **TypeScript:** Full type safety
- **Linting:** ESLint
- **Testing:** Cypress (configured, not fully implemented)

## 🗄️ Database Schema

### **Users Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  university: String,
  year: String,
  major: String,
  bio: String,
  avatar: String (base64),
  showcaseBadges: [String],
  earnedBadges: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### **Bookings Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  venueId: String,
  venueName: String,
  date: Date,
  time: String,
  groupSize: Number,
  status: String,
  createdAt: Date,
  updatedAt: Date
}
```

### **Verifications Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  universityId: String,
  universityName: String,
  studentName: String,
  studentId: String,
  universityEmail: String,
  status: String,
  submittedAt: Date,
  verifiedAt: Date
}
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- MongoDB Atlas account

### **Installation**

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd arisze-app
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Environment Setup**
   Create `.env.local` file:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/arisze?retryWrites=true&w=majority
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   RESEND_API_KEY=your-resend-api-key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Open http://localhost:3000
   - Visit /contact to see the crown animation
   - Visit /events to test booking functionality

## 🧪 Testing

### **Manual Testing Checklist**
- [ ] Homepage loads correctly
- [ ] Crown animation visible on contact page
- [ ] Contact form submits successfully
- [ ] User registration/login works
- [ ] Event booking flow completes
- [ ] Dashboard displays user data
- [ ] Badge system functions
- [ ] Avatar upload works

### **Automated Testing**
- **Framework:** Cypress (configured)
- **Test Files:** `cypress/e2e/core_features.cy.ts`
- **Status:** Test suite created but not fully implemented
- **Run Tests:** `npm run cypress:open`

## 🔧 Known Issues & Fixes Needed

### **High Priority**
1. **MongoDB Connection Stability**
   - Fix intermittent connection drops
   - Implement connection retry logic
   - Add fallback data handling

2. **Avatar Synchronization**
   - Fix header avatar not updating after upload
   - Implement proper session refresh mechanism

3. **Badge Persistence**
   - Complete drag-and-drop state persistence
   - Fix showcase badge database sync

### **Medium Priority**
1. **Email System**
   - Configure Resend API for actual email sending
   - Add email templates
   - Implement delivery confirmation

2. **Error Handling**
   - Improve user-facing error messages
   - Add retry mechanisms for failed operations
   - Implement offline mode handling

### **Low Priority**
1. **Performance Optimization**
   - Optimize image loading
   - Implement lazy loading for components
   - Add caching strategies

2. **SEO & Accessibility**
   - Add meta tags and structured data
   - Improve keyboard navigation
   - Add ARIA labels

## 📈 Development Roadmap

### **Phase 1 - Stability (Current)**
- [ ] Fix MongoDB connection issues
- [ ] Complete avatar synchronization
- [ ] Implement proper badge persistence
- [ ] Configure email system

### **Phase 2 - Core Features**
- [ ] Add real-time notifications
- [ ] Implement user connections
- [ ] Add event calendar view
- [ ] Create admin dashboard

### **Phase 3 - Advanced Features**
- [ ] Real-time chat system
- [ ] Location-based event discovery
- [ ] Payment integration
- [ ] Mobile app (React Native)

## 🤝 Contributing

This is currently a private development project. For issues or feature requests, please contact the development team.

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

For technical issues or questions:
- **Development Team:** Contact through the contact form at `/contact`
- **Email Issues:** Logged to server console (check terminal output)
- **Database Issues:** Check MongoDB Atlas dashboard

---

**Note:** This application is in active development. Some features may be incomplete or subject to change. Always check this README for the most current status information.

