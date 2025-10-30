# 🔥 MONGODB DECOMMISSIONING - MANDATORY MANUAL TO-DO LIST

**Date:** October 29, 2025  
**Status:** ⚠️ **REQUIRES IMMEDIATE ACTION**  
**Goal:** 100% MongoDB Removal & Firebase Security Configuration

---

## ⚠️ CRITICAL: WHY YOU NEED TO COMPLETE THIS

Your terminal output shows:
```
✅ MongoDB connection monitoring enabled
```

This means MongoDB is **still connecting** even though you're using Firebase. You must complete ALL steps below to fully decommission MongoDB and fix Firebase security rules.

---

## 📋 SECTION 1: TERMINAL CLEANUP - UNINSTALL MONGODB DEPENDENCIES

### Step 1.1: Remove MongoDB Packages
Open PowerShell in your project directory and run:

```powershell
cd "c:\Users\admin\OneDrive - Vilnius University\ARISZE_FINAL\arisze-app"
pnpm remove mongodb mongoose
```

### Step 1.2: Verify Removal
After uninstalling, check that MongoDB packages are gone:

```powershell
pnpm list mongodb
pnpm list mongoose
```

**Expected Result:** Both commands should show "not found" or empty results.

### Step 1.3: Clean Package Lock
```powershell
pnpm install
```

This will update your lock file and remove any lingering MongoDB references.

---

## 📋 SECTION 2: FILE DELETION - REMOVE MONGODB FILES

### Step 2.1: Delete MongoDB Connection File
**⚠️ CRITICAL:** Navigate to your project folder in File Explorer and DELETE:

```
c:\Users\admin\OneDrive - Vilnius University\ARISZE_FINAL\arisze-app\lib\mongodb.ts
```

**Why:** This file establishes the MongoDB connection that appears in your terminal output.

### Step 2.2: Delete Migration Scripts
Delete ALL migration-related files:

```
c:\Users\admin\OneDrive - Vilnius University\ARISZE_FINAL\arisze-app\migrate.js
c:\Users\admin\OneDrive - Vilnius University\ARISZE_FINAL\arisze-app\migrate-to-firestore.js
c:\Users\admin\OneDrive - Vilnius University\ARISZE_FINAL\arisze-app\firestore-examples.js
c:\Users\admin\OneDrive - Vilnius University\ARISZE_FINAL\arisze-app\firestore-events-list.js
c:\Users\admin\OneDrive - Vilnius University\ARISZE_FINAL\arisze-app\firestore-user-fetch.js
c:\Users\admin\OneDrive - Vilnius University\ARISZE_FINAL\arisze-app\firestore-user-update.js
c:\Users\admin\OneDrive - Vilnius University\ARISZE_FINAL\arisze-app\debug-user-id.js
c:\Users\admin\OneDrive - Vilnius University\ARISZE_FINAL\arisze-app\test-mongo-direct.js
c:\Users\admin\OneDrive - Vilnius University\ARISZE_FINAL\arisze-app\test-firestore-events-list.js
c:\Users\admin\OneDrive - Vilnius University\ARISZE_FINAL\arisze-app\test-firestore-fetch.js
c:\Users\admin\OneDrive - Vilnius University\ARISZE_FINAL\arisze-app\test-firestore-update.js
```

**Why:** These were only needed for migration. They're no longer useful.

### Step 2.3: Delete Old MongoDB Helper Files
```
c:\Users\admin\OneDrive - Vilnius University\ARISZE_FINAL\arisze-app\lib\db-helpers.ts
```

**Why:** This likely contains MongoDB-specific helper functions.

### Step 2.4: Optional - Delete Old Documentation
These migration docs are no longer needed (keep for reference if desired):
```
c:\Users\admin\OneDrive - Vilnius University\ARISZE_FINAL\arisze-app\DATABASE_FIX_REPORT.md
c:\Users\admin\OneDrive - Vilnius University\ARISZE_FINAL\arisze-app\FIRESTORE_EVENTS_LIST_SUMMARY.md
c:\Users\admin\OneDrive - Vilnius University\ARISZE_FINAL\arisze-app\FIRESTORE_UPDATE_SUMMARY.md
```

---

## 📋 SECTION 3: API IMPORT VERIFICATION - CLEAN ALL ROUTE FILES

### Step 3.1: Files That Still Need MongoDB Cleanup

The following files **MUST** be manually cleaned to remove MongoDB imports:

#### 🔴 **CRITICAL - Participants Route**
**File:** `app/api/events/[id]/participants/route.ts`

**Remove:**
```typescript
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
```

**Replace all MongoDB code with Firestore:**
- Replace `getDatabase()` calls with `firestoreDb`
- Replace `ObjectId.isValid()` checks (Firestore accepts any string)
- Replace `new ObjectId(id)` with just `id`
- Replace `db.collection().findOne({ _id: new ObjectId() })` with `firestoreDb.collection().doc(id).get()`

#### 🔴 **CRITICAL - User Profile Route**
**File:** `app/api/users/profile/route.ts`

**Remove:**
```typescript
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
```

**Replace all MongoDB code with Firestore:**
- Replace `getDatabase()` with `firestoreDb`
- Remove all `ObjectId` handling logic
- Replace `db.collection().findOne()` with `firestoreDb.collection().doc(userId).get()`
- Replace `db.collection().updateOne()` with `firestoreDb.collection().doc(userId).update()`

#### 🔴 **CRITICAL - Users Online Route**
**File:** `app/api/users/online/route.ts`

**Remove:**
```typescript
import { getDatabase } from '@/lib/mongodb'
```

**Replace all MongoDB code with Firestore:**
- Replace `getDatabase()` with `firestoreDb`
- Replace `db.collection().find()` with Firestore queries
- Use `where()` and `get()` for querying online users

### Step 3.2: Other Files to Check

Run this search in VS Code to find any remaining MongoDB imports:

**Search:** `getDatabase|ObjectId|mongodb`  
**In:** `app/api/**/*.ts`

Clean up **ALL** files that appear in the search results.

---

## 📋 SECTION 4: FIREBASE SECURITY RULES FIX - ENABLE LOCAL TESTING

### Problem
Your Firestore security rules are currently **BLOCKING ALL ACCESS**. This is why API calls may fail.

### Step 4.1: Open Firebase Console
1. Go to: https://console.firebase.google.com/project/ariszze-4c18f
2. Navigate to: **Firestore Database** → **Rules** tab

### Step 4.2: Temporary Testing Rules
Replace your current rules with this (TEMPORARY - for local testing only):

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // ⚠️ TEMPORARY: Allow all read/write for local testing
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Step 4.3: Publish Rules
Click **"Publish"** in the Firebase Console.

### ⚠️ SECURITY WARNING
These rules allow **ANYONE** to read/write your database. This is **ONLY** for local testing.

### Step 4.4: Production Security Rules (After Testing)
Once local testing is complete, replace with proper authentication rules:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - authenticated users only
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Events collection - public read, authenticated write
    match /events/{eventId} {
      allow read: if true; // Public events
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        resource.data.createdBy == request.auth.uid;
    }
    
    // Bookings - only event participants and creators
    match /bookings/{bookingId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         get(/databases/$(database)/documents/events/$(resource.data.eventId)).data.createdBy == request.auth.uid);
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Event Participants - authenticated users
    match /eventParticipants/{participantId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // User Event Profiles - owner only
    match /userEventProfiles/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // User Created Events Tracking - authenticated users
    match /userCreatedEvents/{trackingId} {
      allow read: if request.auth != null;
      allow create, delete: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## 📋 SECTION 5: INSTRUMENTATION.TS CLEANUP

### Problem
Your terminal shows: `✅ MongoDB connection monitoring enabled`

This message comes from `instrumentation.ts`.

### Step 5.1: Edit instrumentation.ts
Open: `c:\Users\admin\OneDrive - Vilnius University\ARISZE_FINAL\arisze-app\instrumentation.ts`

### Step 5.2: Remove MongoDB Monitoring
Find and **DELETE** or **COMMENT OUT** any code that:
- Imports from `@/lib/mongodb`
- Calls `getDatabase()`
- Logs MongoDB connection messages

### Example - Remove lines like:
```typescript
import { getDatabase } from '@/lib/mongodb'
// ...
await getDatabase() // MongoDB connection check
console.log('✅ MongoDB connection monitoring enabled')
```

---

## 📋 SECTION 6: ENVIRONMENT VARIABLES CLEANUP

### Step 6.1: Check .env.local
Open: `c:\Users\admin\OneDrive - Vilnius University\ARISZE_FINAL\arisze-app\.env.local`

### Step 6.2: Remove MongoDB Variables
Delete or comment out:
```
MONGODB_URI=mongodb+srv://...
MONGODB_DB=arisze
```

### Step 6.3: Ensure Firebase Variables Exist
Make sure you have:
```
FIREBASE_PROJECT_ID=ariszze-4c18f
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@ariszze-4c18f.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**OR** rely on `serviceAccountKey.json.json` (current setup).

---

## 📋 SECTION 7: RESTART AND VERIFY

### Step 7.1: Stop All Servers
Press `Ctrl+C` in all terminal windows running `pnpm dev`.

### Step 7.2: Clear Next.js Cache
```powershell
cd "c:\Users\admin\OneDrive - Vilnius University\ARISZE_FINAL\arisze-app"
Remove-Item -Recurse -Force .next
```

### Step 7.3: Restart Development Server
```powershell
pnpm dev
```

### Step 7.4: Verify Clean Startup
Check terminal output. You should **NOT** see:
- ❌ `MongoDB connection monitoring enabled`
- ❌ Any MongoDB connection messages

You **SHOULD** see:
- ✅ `Firebase Admin SDK initialized successfully`
- ✅ Server running on http://localhost:3000

---

## 📋 SECTION 8: TESTING CHECKLIST

After completing all steps above, test these endpoints:

### Test 1: List Events
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/events" -UseBasicParsing
```
**Expected:** JSON with events array

### Test 2: List Users
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/users" -UseBasicParsing
```
**Expected:** JSON with users array

### Test 3: Get Single Event
```powershell
# Replace {eventId} with actual event ID from Test 1
Invoke-WebRequest -Uri "http://localhost:3000/api/events/{eventId}" -UseBasicParsing
```
**Expected:** JSON with single event object

### Test 4: Check Firebase Console
1. Go to Firebase Console: https://console.firebase.google.com/project/ariszze-4c18f/firestore
2. Verify you can see your collections: `users`, `events`, `bookings`

---

## 📋 COMPLETION CHECKLIST

Mark each item as complete:

### Dependencies & Files:
- [ ] MongoDB packages uninstalled (`pnpm remove mongodb mongoose`)
- [ ] `lib/mongodb.ts` deleted
- [ ] All migration scripts deleted
- [ ] `instrumentation.ts` cleaned of MongoDB references

### API Routes:
- [ ] `app/api/users/route.ts` - ✅ ALREADY CLEANED
- [ ] `app/api/events/route.ts` - ✅ ALREADY CLEANED
- [ ] `app/api/events/[id]/route.ts` - ✅ ALREADY CLEANED
- [ ] `app/api/events/[id]/participants/route.ts` - ⚠️ NEEDS MANUAL CLEANUP
- [ ] `app/api/users/profile/route.ts` - ⚠️ NEEDS MANUAL CLEANUP
- [ ] `app/api/users/online/route.ts` - ⚠️ NEEDS MANUAL CLEANUP
- [ ] All other route files verified (no MongoDB imports)

### Firebase Configuration:
- [ ] Firestore security rules set to `allow read, write: if true` (temporary)
- [ ] Firebase Console accessible
- [ ] Can view data in Firestore Database tab

### Testing:
- [ ] Server starts without MongoDB messages
- [ ] GET /api/events works
- [ ] GET /api/users works
- [ ] GET /api/events/[id] works
- [ ] Firebase Console shows activity

### Security (After Testing):
- [ ] Production security rules implemented
- [ ] Authentication tested
- [ ] Unauthorized access blocked

---

## 🚨 TROUBLESHOOTING

### Issue: "MongoDB connection monitoring enabled" still appears
**Solution:** Check `instrumentation.ts` and remove all MongoDB imports/calls.

### Issue: API calls return 403 Forbidden
**Solution:** Check Firebase security rules - set to `allow read, write: if true` for testing.

### Issue: "Cannot find module '@/lib/mongodb'"
**Solution:** You have a file still importing from `lib/mongodb.ts`. Search entire codebase for `@/lib/mongodb` and remove.

### Issue: TypeScript errors about ObjectId
**Solution:** Remove all `import { ObjectId } from 'mongodb'` statements.

---

## 📞 SUPPORT

If you encounter issues:

1. **Check Firebase Console Logs:** 
   https://console.firebase.google.com/project/ariszze-4c18f/firestore/logs

2. **Check Browser Console:** 
   Press F12 in browser when testing APIs

3. **Check Terminal Output:** 
   Look for error messages when server starts

---

## ✅ SUCCESS CRITERIA

You'll know MongoDB is fully decommissioned when:

1. ✅ Terminal shows NO MongoDB connection messages
2. ✅ `pnpm list mongodb` returns "not found"
3. ✅ All API endpoints return data successfully
4. ✅ Firebase Console shows query activity
5. ✅ No TypeScript errors about MongoDB or ObjectId
6. ✅ Server starts in under 5 seconds with only Firebase messages

---

**🎯 FINAL GOAL:** Complete 100% migration to Firebase with ZERO MongoDB dependencies or connections.

**⏰ ESTIMATED TIME:** 30-60 minutes to complete all manual tasks.

---

**Generated:** October 29, 2025  
**Project:** ARISZE Web Application  
**Migration Status:** Awaiting Manual Decommissioning Completion
