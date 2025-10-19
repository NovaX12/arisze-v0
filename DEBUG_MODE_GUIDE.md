# 🐛 DEBUG MODE ACTIVATED - Event Creation Troubleshooting

## ✅ What I've Added

### 1. **Live Debug Panel** (NEW!)
- Floating debug button in bottom-right corner (purple/pink gradient with bug icon)
- Real-time diagnostics panel
- Shows database connection, session status, and API health
- Test event creation directly from panel
- Copy logs to clipboard

### 2. **Comprehensive Console Logging**
Every step of event creation now logs to browser console with emojis:
- 🔵 Info/Start
- ✅ Success
- ❌ Error
- 📋/📦 Data
- 📤/📥 Network
- 🏁 Complete

### 3. **Enhanced API Endpoints**
- `/api/test-connection` - Test MongoDB connection
- `/api/events` POST - With detailed server logs
- All endpoints now have comprehensive error reporting

---

## 🚀 How to Use Debug Mode

### Step 1: Open the Debug Panel
1. Go to http://localhost:3000/events
2. Look for the floating **purple/pink bug icon** in bottom-right corner
3. Click it to open the debug panel

### Step 2: Run Diagnostics
The panel will automatically:
- ✅ Check if you're logged in (Session Status)
- ✅ Check database connection (Database Status)
- ✅ Check API health (API Status)

All three should show **green checkmarks** for everything to work.

### Step 3: Test Event Creation
Click the **"🧪 Test Event Creation API"** button in the debug panel.

This will:
1. Send a real POST request to `/api/events`
2. Show the complete request data
3. Show the complete response
4. Log every step in the activity log

**If this works** = Your API is fine, problem is in the form  
**If this fails** = Problem is in the API/database

---

## 🔍 Reading the Logs

### Browser Console (Press F12)
You'll see logs like this:

```
🔵 [EVENT CREATION] Form submission started
📋 [EVENT CREATION] Current form data: {...}
✅ [EVENT CREATION] Session validated: {...}
✅ [EVENT CREATION] All required fields validated
📦 [EVENT CREATION] Prepared event data: {...}
📤 [EVENT CREATION] Sending POST request to /api/events
📥 [EVENT CREATION] Response received: {...}
📄 [EVENT CREATION] Raw response text: {...}
```

### Server Terminal
You'll see logs like this:

```
🔵 POST /api/events - Event creation request received
✅ User authenticated: user@example.com
📝 Creating event with data: {...}
🔌 Connecting to database...
✅ Database connected
💾 Inserting event into database...
✅ Event inserted with ID: 673...
```

---

## 🎯 Common Error Patterns & Solutions

### Error Pattern 1: "Failed to fetch"

**What you'll see:**
```
❌ [EVENT CREATION] Error caught: TypeError: Failed to fetch
```

**Causes:**
1. Dev server not running
2. CORS issue
3. Network problem
4. Browser blocking request

**Solution:**
- Check terminal shows `✓ Ready in X.Xs`
- Try in incognito mode
- Check browser console for CORS errors
- Restart dev server

---

### Error Pattern 2: "Unauthorized"

**What you'll see:**
```
❌ [EVENT CREATION] No session found
OR
❌ Unauthorized: No session found (in server logs)
```

**Causes:**
- Not logged in
- Session expired
- NextAuth issue

**Solution:**
1. Check debug panel → Session Status should be "authenticated"
2. If not, log out and log back in
3. Check browser cookies (F12 → Application → Cookies)
4. Look for `next-auth.session-token`

---

### Error Pattern 3: Database Connection Failed

**What you'll see:**
```
❌ [TEST-CONNECTION] Database connection failed
OR
❌ Failed to connect to MongoDB Atlas
```

**Causes:**
- MongoDB Atlas down
- Wrong connection string
- IP not whitelisted
- Network issue

**Solution:**
1. Click "Test Event Creation API" in debug panel
2. Check server logs for database errors
3. Verify .env.local has correct MONGODB_URI
4. Check MongoDB Atlas dashboard

---

### Error Pattern 4: Validation Failed

**What you'll see:**
```
❌ [EVENT CREATION] Validation failed - missing fields: {...}
OR
❌ [SERVER] Missing fields: title, description, ...
```

**Causes:**
- Required field not filled
- Field name mismatch
- Data type wrong

**Solution:**
1. Check browser console for which fields are missing
2. Ensure all required fields are filled
3. Check form data log shows all fields

---

### Error Pattern 5: Invalid JSON Response

**What you'll see:**
```
❌ [EVENT CREATION] Failed to parse response JSON
📄 [EVENT CREATION] Response was: <html>...
```

**Causes:**
- Server returned HTML error page instead of JSON
- Server crashed
- NextAuth redirecting

**Solution:**
1. Check server terminal for crash logs
2. Check response status code
3. Look at raw response text in logs
4. Might be a 500 server error

---

## 📊 Debug Panel Status Guide

### Database Status

| Status | Icon | Meaning | Action |
|--------|------|---------|--------|
| connected | ✅ Green | MongoDB working | All good! |
| disconnected | ❌ Red | MongoDB down | Check connection string |
| unknown | ⚠️ Yellow | Not tested yet | Click "Refresh" |

### Session Status

| Status | Icon | Meaning | Action |
|--------|------|---------|--------|
| authenticated | ✅ Green | Logged in | All good! |
| unauthenticated | ❌ Red | Not logged in | Log in at /login |
| unknown | ⚠️ Yellow | Not checked yet | Click "Refresh" |

### API Status

| Status | Icon | Meaning | Action |
|--------|------|---------|--------|
| healthy | ✅ Green | API responding | All good! |
| unhealthy | ❌ Red | API not responding | Restart dev server |
| unknown | ⚠️ Yellow | Not tested yet | Click "Refresh" |

---

## 🧪 Manual Testing Steps

### Test 1: Database Connection
```
1. Open debug panel
2. Click "Refresh"
3. Database status should be "connected"
4. Activity log should show: "Database connected successfully"
```

**If fails:** Database issue - check `.env.local` and MongoDB Atlas

### Test 2: Authentication
```
1. Open debug panel
2. Click "Refresh"
3. Session status should be "authenticated"
4. Activity log should show your email
```

**If fails:** Not logged in - go to `/login`

### Test 3: API Test
```
1. Open debug panel
2. Click "🧪 Test Event Creation API"
3. Watch activity log
4. Should see "Event creation API test PASSED"
```

**If fails:** API issue - check server logs

### Test 4: Form Submission
```
1. Fill out event creation form
2. Open browser console (F12)
3. Click "Create Event"
4. Watch console logs
5. Should see all ✅ symbols
```

**If fails:** Check which step has ❌

---

## 🔧 Quick Fixes

### Fix 1: Clear Everything and Start Fresh
```powershell
# Stop dev server (Ctrl+C)
cd "c:\Users\admin\OneDrive - Vilnius University\ARISZE_FINAL\arisze-app"
# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
pnpm install
# Restart
pnpm dev
```

### Fix 2: Reset Browser
```
1. Open incognito window
2. Go to http://localhost:3000
3. Log in fresh
4. Try creating event
```

### Fix 3: Check Environment Variables
```powershell
cd "c:\Users\admin\OneDrive - Vilnius University\ARISZE_FINAL\arisze-app"
Get-Content .env.local
```

Should show:
```
MONGODB_URI=mongodb+srv://...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...
```

NO `USE_MOCK_DB` variable should exist!

---

## 📋 Diagnostic Checklist

Before reporting an error, check:

- [ ] Dev server is running (`✓ Ready` in terminal)
- [ ] Logged in (check debug panel)
- [ ] Database connected (check debug panel)
- [ ] API healthy (check debug panel)
- [ ] Tried test button in debug panel
- [ ] Checked browser console for logs
- [ ] Checked server terminal for logs
- [ ] Tried in incognito mode
- [ ] Restarted dev server
- [ ] `.env.local` file exists and is correct

---

## 🎯 Next Steps

1. **Open http://localhost:3000/events**
2. **Click the debug button (bottom-right)**
3. **Run diagnostics**
4. **Try the API test button**
5. **Check all three statuses are green**
6. **Try creating an event**
7. **Watch the logs in browser console**
8. **Report exact error message if fails**

---

## 💡 Understanding the Flow

```
User fills form
    ↓
🔵 Form submission starts (logs form data)
    ↓
✅ Session validation (logs user info)
    ↓
✅ Field validation (logs field status)
    ↓
📦 Prepare event data (logs prepared data)
    ↓
📤 Send POST to /api/events (logs request)
    ↓
[SERVER RECEIVES]
    ↓
🔵 POST /api/events received (server log)
    ↓
✅ Authenticate user (server log)
    ↓
📝 Validate fields (server log)
    ↓
🔌 Connect to database (server log)
    ↓
💾 Insert event (server log)
    ↓
✅ Return success (server log)
    ↓
[CLIENT RECEIVES]
    ↓
📥 Response received (logs status)
    ↓
📄 Parse JSON (logs parsed data)
    ↓
✅ Success! (shows toast)
    ↓
🏁 Complete
```

**Every step is logged!** Find where it fails and we know the exact problem.

---

## 🆘 Emergency Debugging Commands

### Check if MongoDB is reachable
```powershell
curl http://localhost:3000/api/test-connection
```

### Check if session works
```powershell
curl http://localhost:3000/api/auth/session
```

### Check if API is alive
```powershell
curl http://localhost:3000/api/simple-test
```

### Check environment
```powershell
cd "c:\Users\admin\OneDrive - Vilnius University\ARISZE_FINAL\arisze-app"
Get-Content .env.local
```

---

**You now have FULL visibility into what's happening!** 🎉

Use the debug panel and console logs to pinpoint exactly where the error occurs, then we can fix it precisely.
