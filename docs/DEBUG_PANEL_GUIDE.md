# Global Debug Panel - Complete Feature Tracking

**Date**: ${new Date().toISOString()}  
**Status**: ✅ ACTIVE ON ALL PAGES

---

## 🎯 Overview

The Debug Panel is now **globally enabled across the entire application** and automatically tracks **every single feature**:

- ✅ Profile editing (name, bio, year, major)
- ✅ Avatar/profile picture uploads
- ✅ Event creation
- ✅ Event booking
- ✅ Event cancellation
- ✅ Booking cancellation
- ✅ Dashboard changes
- ✅ Authentication/session management
- ✅ Database operations
- ✅ API calls

---

## 🚀 How to Access

### On ANY Page:
1. Look for the **purple bug icon** in the bottom-right corner
2. Click it to open the debug panel
3. Panel slides in from the right side

### Available On:
- ✅ Home page (`/`)
- ✅ Events page (`/events`)
- ✅ Dashboard (`/dashboard`)
- ✅ Profile section
- ✅ Login/Signup pages
- ✅ All other pages

---

## 🎨 Features

### 1. **Real-Time Status Indicators**

Three status cards at the top show:

| Indicator | States | Meaning |
|-----------|--------|---------|
| **Database** | Connected ✅ / Disconnected ❌ / Unknown ⚠️ | MongoDB Atlas connection status |
| **Session** | Authenticated ✅ / Unauthenticated ❌ / Unknown ⚠️ | NextAuth session status |
| **API** | Healthy ✅ / Unhealthy ❌ / Unknown ⚠️ | API endpoints responding |

### 2. **Quick Test Buttons**

Run instant tests for specific features:

| Button | What It Tests | API Called |
|--------|---------------|------------|
| **Run All Tests** | All systems | Multiple endpoints |
| **Event Create** | Event creation API | POST /api/events |
| **Profile Edit** | Profile update | PUT /api/users/profile |
| **Avatar Upload** | Image upload | GET /api/users/avatar-upload |
| **Booking System** | Booking retrieval | GET /api/user/bookings |

### 3. **Category Filtering**

Filter logs by category to focus on specific features:

- **All** - Show everything
- **Profile** - Profile edits, avatar uploads
- **Events** - Event creation, deletion
- **Bookings** - Event bookings, cancellations
- **Auth** - Login, logout, session changes
- **System** - Database, API health checks

### 4. **Automatic Log Capture**

The debug panel automatically captures:

#### Console Logs:
```javascript
console.log("Profile update successful") 
// → Appears in debug panel as INFO log
```

#### Console Errors:
```javascript
console.error("Failed to save")
// → Appears as ERROR log
```

#### Console Warnings:
```javascript
console.warn("Session expiring soon")
// → Appears as WARNING log
```

### 5. **Smart Categorization**

Logs are automatically categorized based on keywords:

| Keywords Detected | Category Assigned |
|-------------------|-------------------|
| "Profile", "profile", "👤" | Profile |
| "Event", "event", "📅" | Event |
| "Booking", "booking", "🎫" | Booking |
| "Session", "Auth", "🔐" | Auth |
| Everything else | System |

---

## 📊 What Gets Tracked

### Profile Features:
```
✅ Profile edit form opening
✅ Field changes (name, bio, year, major)
✅ Save button click
✅ API request to /api/users/profile
✅ Response status (200/400/500)
✅ Database update result
✅ Session update for navbar
✅ Toast notification
```

### Avatar Upload:
```
✅ File selection
✅ File validation (type, size)
✅ Base64 conversion
✅ API request to /api/users/avatar-upload
✅ Database update
✅ Session image update
✅ UI refresh
```

### Event Creation:
```
✅ Form submission
✅ Validation checks
✅ API request to /api/events
✅ Database insertion
✅ Event ID generation
✅ Success/error response
```

### Event Booking:
```
✅ Book event button click
✅ Booking form submission
✅ API request to /api/events/[id]/book
✅ Attendee count update
✅ Participant list update
✅ Confirmation display
```

### Event Cancellation:
```
✅ Cancel button click
✅ Confirmation dialog
✅ DELETE request to /api/events/[id]
✅ Booking cleanup
✅ Participant notification
✅ UI update
```

### Dashboard Changes:
```
✅ Tab switching (Profile → Events → Badges)
✅ Data loading
✅ API calls for each section
✅ Error handling
```

---

## 🔍 Log Format

Each log entry shows:

```
[Timestamp] [TYPE] [CATEGORY]: Message
├─ Timestamp: HH:MM:SS format
├─ Type: INFO/SUCCESS/ERROR/WARNING
├─ Category: profile/event/booking/auth/system
└─ Details: Expandable JSON data
```

### Example Logs:

**Profile Edit Success:**
```
[14:23:45] SUCCESS [PROFILE]: ✅ Profile update API test PASSED
Details: { message: "Profile updated successfully", user: {...} }
```

**Event Creation:**
```
[14:25:12] INFO [EVENT]: 🧪 Testing event creation API...
[14:25:13] SUCCESS [EVENT]: ✅ Event creation API test PASSED
```

**Error Example:**
```
[14:30:22] ERROR [AUTH]: ❌ Session expired
Details: { error: "Unauthorized - Please log in" }
```

---

## 🛠️ Advanced Features

### Copy Logs to Clipboard:
1. Click "Copy Logs" button
2. All logs copied in formatted text
3. Paste into bug reports, documentation, or support tickets

### Log Persistence:
- Keeps last **100 log entries**
- Older entries automatically removed
- Clear logs by clicking "Run All Tests"

### Expandable Details:
- Click "Show details" on any log
- See full JSON data
- Copy specific values for debugging

---

## 💡 Usage Examples

### Example 1: Debug Profile Editing Issue

**Steps:**
1. Open debug panel
2. Click "Profile Edit" test button
3. Watch the logs:
   ```
   🔵 PUT /api/users/profile - Profile update request received
   👤 Session: user@email.com ID: 673abc...
   📝 Update data received: {...}
   ✅ Database connected
   📊 Update result: { matchedCount: 1, modifiedCount: 1 }
   ✅ Profile updated successfully
   ```
4. If it fails, the exact error appears in logs

### Example 2: Track Event Creation Flow

**Steps:**
1. Open debug panel
2. Go to Events page → Create Event tab
3. Fill form and submit
4. Debug panel automatically captures:
   ```
   📝 Creating event with data: {...}
   🔌 Connecting to database...
   ✅ Database connected
   💾 Inserting event into database...
   ✅ Event inserted with ID: 673xyz...
   ```

### Example 3: Monitor Booking Process

**Steps:**
1. Open debug panel
2. Filter by "Bookings" category
3. Book an event
4. Watch real-time tracking:
   ```
   🎫 Booking event: Study Session
   ✅ Booking created successfully
   👥 Participant list updated
   📧 Confirmation sent
   ```

---

## 🎯 Best Practices

### For Development:
1. **Keep panel open** while working on features
2. **Filter by category** to reduce noise
3. **Copy logs** before reporting bugs
4. **Run tests** after code changes

### For Testing:
1. **Run All Tests** first to check system health
2. **Test specific features** with quick buttons
3. **Check all 3 status indicators** are green
4. **Watch for errors** in real-time

### For Debugging:
1. **Reproduce the issue** with panel open
2. **Note the exact log messages**
3. **Expand details** for error context
4. **Copy logs** for documentation

---

## 🔧 Technical Details

### Implementation:

**Location**: `components/ui/debug-panel.tsx`  
**Global Import**: `app/layout.tsx`  
**Availability**: All pages automatically

### Console Interception:

```typescript
// Original console.log
console.log("Profile updated")

// Automatically captured and logged to debug panel
// Category auto-detected from message content
// Displayed with timestamp and type
```

### Global Logging API:

```typescript
import { globalDebugLog } from "@/components/ui/debug-panel"

// Manual logging from any component
globalDebugLog.log('success', 'Custom event', { data: '...' }, 'event')
```

### Auto-Categorization Logic:

```typescript
if (message.includes('Profile') || message.includes('👤')) {
  category = 'profile'
} else if (message.includes('Event') || message.includes('📅')) {
  category = 'event'
} else if (message.includes('Booking') || message.includes('🎫')) {
  category = 'booking'
}
// ... etc
```

---

## 📈 Monitoring Dashboard Changes

### What's Tracked in Dashboard:

#### Profile Section:
- Edit button clicks
- Form field changes
- Save/Cancel actions
- API requests
- Session updates
- Toast notifications

#### Events Tab (My Events):
- Booked events loading
- Created events loading
- Participant viewing
- Event cancellation
- Booking cancellation

#### Badges Section:
- Badge loading
- Showcase updates
- Drag-and-drop actions

---

## 🚨 Troubleshooting

### Issue: Debug panel doesn't appear
**Solution**: Hard refresh (Ctrl+Shift+R) - panel is in global layout

### Issue: No logs appearing
**Solution**: 
1. Click "Run All Tests" to generate logs
2. Perform actions in the app (edit profile, create event, etc.)
3. Console logs are automatically captured

### Issue: Too many logs
**Solution**: 
1. Use category filters to focus
2. Logs auto-limited to 100 entries
3. Click "Run All Tests" to clear and restart

### Issue: Status shows "Unknown"
**Solution**: Click "Run All Tests" or individual test buttons

---

## 🎓 What You'll See

### Successful Profile Edit:
```
[14:23:40] INFO [PROFILE]: 🔵 handleSave triggered
[14:23:40] INFO [PROFILE]: 📝 Current editData: {...}
[14:23:40] INFO [PROFILE]: 🌐 Sending PUT request to /api/users/profile...
[14:23:41] INFO [PROFILE]: 📡 Response status: 200
[14:23:41] SUCCESS [PROFILE]: ✅ Profile update successful!
[14:23:41] SUCCESS [PROFILE]: ✅ Toast notification shown
```

### Successful Avatar Upload:
```
[14:25:10] INFO [PROFILE]: 📸 Avatar upload triggered
[14:25:10] INFO [PROFILE]: 📁 File details: {name: "avatar.jpg", size: 52341, type: "image/jpeg"}
[14:25:10] INFO [PROFILE]: 🔄 Converting file to base64...
[14:25:11] INFO [PROFILE]: ✅ File converted to base64 (length: 70000)
[14:25:11] SUCCESS [PROFILE]: 📸 Avatar updated successfully!
```

### Event Creation:
```
[14:30:00] INFO [EVENT]: 📝 Creating event with data: {...}
[14:30:00] INFO [EVENT]: ✅ User authenticated: user@email.com
[14:30:01] INFO [EVENT]: 🔌 Connecting to database...
[14:30:01] INFO [EVENT]: ✅ Database connected
[14:30:02] SUCCESS [EVENT]: ✅ Event inserted with ID: 673xyz...
```

---

## ✨ Summary

The debug panel now provides **complete visibility** into:
- ✅ Every user action
- ✅ Every API call
- ✅ Every database operation
- ✅ Every success/error
- ✅ Every feature interaction

**No more guessing** - you can now see exactly what's happening in real-time across the entire application!

---

*Debug Panel Version: 2.0 - Global Edition*  
*Last Updated: ${new Date().toISOString()}*  
*Status: Active on all pages ✅*
