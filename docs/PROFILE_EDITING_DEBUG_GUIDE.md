# Profile Editing Debug & Fix Guide

**Date**: ${new Date().toISOString()}  
**Issue**: Profile editing "Save Changes" button not responding, profile picture upload not working

---

## 🔧 Changes Made

### 1. Added Comprehensive Debug Logging

#### Frontend (`components/sections/profile-section.tsx`)
- ✅ Added console logs to `handleSave()` function (lines ~112-170)
- ✅ Added console logs to `handleAvatarUpload()` function (lines ~175-255)
- Logs include:
  - Function trigger confirmation
  - Current editData state
  - Session user ID
  - Request/response status
  - Error details

#### Backend Profile API (`app/api/users/profile/route.ts`)
- ✅ Added detailed logging to PUT endpoint
- Logs include:
  - Request received confirmation
  - Session details (email, ID)
  - Update data received
  - Database connection status
  - MongoDB update results (matchedCount, modifiedCount)
  - Final success/error status

#### Backend Avatar Upload API (`app/api/users/avatar-upload/route.ts`)
- ✅ Added detailed logging to POST endpoint
- Logs include:
  - Request received confirmation
  - Avatar URL length
  - Validation results
  - Database update results
  - Success/error status

---

## 🧪 Testing Instructions

### Prerequisites
1. **Server Running**: Dev server is running on port 3001 (port 3000 was in use)
   ```
   Terminal: powershell
   URL: http://localhost:3001
   Status: RUNNING ✅
   ```

2. **Browser Setup**:
   - Open Chrome/Edge DevTools (F12)
   - Go to Console tab
   - Open Network tab
   - Enable "Preserve log"

### Test 1: Profile Information Editing

#### Steps:
1. Navigate to `http://localhost:3001/dashboard`
2. Login if not authenticated
3. Go to Profile section
4. Click the Edit button (pencil icon)
5. Modify fields:
   - Name: Change to something new
   - Year: Enter "2024" or "3rd Year"
   - Major: Enter "Computer Science"
   - Bio: Enter "Test bio information"
6. Click "Save Changes" button

#### What to Watch:

**Browser Console Should Show:**
```javascript
🔵 handleSave triggered
📝 Current editData: {name: "...", year: "...", major: "...", bio: "..."}
👤 Session user ID: 673abc...
🌐 Sending PUT request to /api/users/profile...
📡 Response status: 200
📦 Response data: {message: "Profile updated successfully", user: {...}}
✅ Profile update successful!
🔄 Updating session with new name...
✅ Toast notification shown
```

**Terminal/Server Logs Should Show:**
```
🔵 PUT /api/users/profile - Profile update request received
👤 Session: user@email.com ID: 673abc...
📝 Update data received: {name: "...", year: "...", major: "...", bio: "..."}
🔌 Connecting to database...
✅ Database connected
💾 Update data prepared: {...}
🔍 Updating user with ID: 673abc...
📊 Update result: { matchedCount: 1, modifiedCount: 1 }
✅ Profile updated successfully
👤 Updated user: New Name user@email.com
```

**UI Should Show:**
- ✅ Toast notification: "Profile Updated!"
- ✅ Edit form closes
- ✅ Updated information displays on profile card
- ✅ Name updates in header/navbar (if changed)

#### If It Fails:

**Scenario A: No console logs at all**
- Issue: `handleSave` not being called
- Check: Is button `onClick` event bound correctly?
- Solution: Verify button has `onClick={handleSave}`

**Scenario B: Console shows error "401 Unauthorized"**
- Issue: Session expired or not authenticated
- Solution: Logout and login again

**Scenario C: Console shows error "404 User not found"**
- Issue: User ID in session doesn't match database
- Check terminal logs for the user ID being searched
- Solution: Check MongoDB users collection for correct ID format

**Scenario D: modifiedCount: 0 (but matchedCount: 1)**
- Issue: Data is identical to existing data (no change detected)
- Solution: This is normal - MongoDB doesn't modify if data is same

---

### Test 2: Profile Picture Upload

#### Steps:
1. Stay on Dashboard → Profile section
2. Click the camera icon on the profile picture
3. Select an image file (JPG, PNG, etc.)
   - **Important**: File must be < 5MB
   - **Important**: Must be an actual image file

#### What to Watch:

**Browser Console Should Show:**
```javascript
📸 Avatar upload triggered
📁 File details: {name: "profile.jpg", size: 12345, type: "image/jpeg"}
🔄 Converting file to base64...
✅ File converted to base64 (length: 50000)
🌐 Uploading avatar to /api/users/avatar-upload...
📡 Avatar upload response status: 200
📦 Avatar upload result: {message: "Avatar updated successfully", avatarUrl: "data:image/jpeg;base64..."}
✅ Avatar updated successfully!
🔄 Updating session with new avatar...
```

**Terminal/Server Logs Should Show:**
```
🔵 POST /api/users/avatar-upload - Avatar upload request received
👤 Session: user@email.com ID: 673abc...
📸 Avatar URL length: 50000
🔌 Connecting to database...
✅ Database connected
💾 Updating user avatar for ID: 673abc...
📊 Update result: { matchedCount: 1, modifiedCount: 1 }
✅ Avatar updated successfully
```

**UI Should Show:**
- ✅ Loading spinner while uploading
- ✅ Toast notification: "Avatar Updated!"
- ✅ Profile picture changes immediately
- ✅ Header avatar updates (synced via session)

#### If It Fails:

**Scenario A: "Invalid File Type" error**
- Issue: Selected file is not an image
- Solution: Choose a .jpg, .png, or .gif file

**Scenario B: "File Too Large" error**
- Issue: Image file > 5MB
- Solution: Resize image or choose smaller file

**Scenario C: Upload hangs/freezes**
- Issue: Large base64 string causing memory issues
- Check: File size in console logs
- Solution: Use smaller image (recommend < 1MB for testing)

**Scenario D: "Invalid avatar URL format" in terminal**
- Issue: Base64 conversion failed
- Check: Console logs for base64 string format
- Solution: Try different image format

---

### Test 3: Persistence Check

#### Steps:
1. After successful profile update
2. Refresh the page (F5)
3. Navigate away and come back to dashboard
4. Logout and login again

#### Expected Result:
- ✅ All changes should persist
- ✅ Name, bio, year, major stay updated
- ✅ Profile picture remains changed
- ✅ Profile completion percentage updates

#### If Changes Don't Persist:

**Check MongoDB Directly:**
```powershell
# In terminal, check database
cd "c:\Users\admin\OneDrive - Vilnius University\ARISZE_FINAL\arisze-app"
node test-mongo-direct.js
```

**Look for:**
- User document in `users` collection
- Check if fields are actually updated
- Verify `updatedAt` timestamp changed

---

## 🐛 Common Issues & Solutions

### Issue 1: Toast Doesn't Appear
**Symptoms**: Save seems to work but no notification
**Cause**: Toast provider not configured or import issue
**Solution**: 
- Check if `<Toaster />` component is in layout
- Verify `useToast()` import is correct
- Try using `console.log` instead to confirm save works

### Issue 2: Session Update Fails
**Symptoms**: Profile saves but name doesn't update in navbar
**Cause**: `update()` function from useSession not working
**Solution**: 
- Session update is async - wait for it
- Check if NextAuth configured properly
- Manually refresh page as workaround

### Issue 3: Button Click Does Nothing
**Symptoms**: No console logs, nothing happens
**Cause**: Button might be disabled or event not bound
**Solution**:
```tsx
// Check if button has onClick
<Button onClick={handleSave}> // ✅ Correct
<Button onClick={() => handleSave()}> // ✅ Also correct
<Button> // ❌ Wrong - no handler
```

### Issue 4: Network Error
**Symptoms**: Console shows "Failed to fetch" or network error
**Cause**: Server not running or wrong URL
**Solution**:
- Verify server is running on port 3001
- Check browser console Network tab for actual URL called
- Ensure no CORS issues

---

## 📊 Expected Database Changes

### Before Update:
```json
{
  "_id": "673abc123...",
  "name": "Old Name",
  "email": "user@email.com",
  "year": "",
  "major": "",
  "bio": "",
  "avatar": "",
  "updatedAt": "2025-10-19T..."
}
```

### After Update:
```json
{
  "_id": "673abc123...",
  "name": "New Name",
  "email": "user@email.com",
  "year": "2024",
  "major": "Computer Science",
  "bio": "Test bio information",
  "avatar": "data:image/jpeg;base64,/9j/4AAQ...",
  "updatedAt": "2025-10-20T..." // <- Updated timestamp
}
```

---

## 🔍 Debugging Checklist

### If Save Button Doesn't Work:
- [ ] Check browser console for logs starting with "🔵 handleSave triggered"
- [ ] If no logs: Button onClick not working - check React DevTools
- [ ] Check terminal logs for "PUT /api/users/profile"
- [ ] Verify session user ID exists
- [ ] Check Network tab for 200/400/401/500 status codes
- [ ] Verify MongoDB connection is working

### If Avatar Upload Doesn't Work:
- [ ] Check browser console for "📸 Avatar upload triggered"
- [ ] Verify file is actually selected (check file details log)
- [ ] Check file type and size in console
- [ ] Verify base64 conversion completed
- [ ] Check terminal logs for "POST /api/users/avatar-upload"
- [ ] Verify MongoDB update result shows modifiedCount: 1

### If Changes Don't Persist:
- [ ] Verify MongoDB update result: modifiedCount should be 1
- [ ] Check database directly with test-mongo-direct.js
- [ ] Verify `updatedAt` timestamp changed
- [ ] Clear browser cache and hard refresh
- [ ] Check if correct user document is being updated

---

## 🎯 Success Criteria

### Profile Editing Works When:
1. ✅ Click "Save Changes" triggers console logs
2. ✅ API returns 200 status with success message
3. ✅ MongoDB shows modifiedCount: 1
4. ✅ Toast notification appears
5. ✅ UI updates immediately
6. ✅ Changes persist after page refresh
7. ✅ Name updates in navbar (if changed)

### Avatar Upload Works When:
1. ✅ File selection triggers console logs
2. ✅ Base64 conversion completes
3. ✅ API returns 200 status
4. ✅ MongoDB shows modifiedCount: 1
5. ✅ Profile picture updates immediately
6. ✅ Avatar persists after page refresh
7. ✅ Avatar syncs to header

---

## 📝 Next Steps After Testing

### If Everything Works:
1. ✅ Mark todo items as complete
2. ✅ Remove debug console.log statements (optional - can keep for production debugging)
3. ✅ Test with multiple user accounts
4. ✅ Test edge cases (empty fields, special characters, etc.)
5. ✅ Consider adding loading spinners for better UX

### If Issues Persist:
1. ❌ Screenshot browser console
2. ❌ Copy terminal logs
3. ❌ Note exact steps to reproduce
4. ❌ Check MongoDB Atlas directly
5. ❌ Provide error details for further debugging

---

## 🚀 Production Recommendations

### After Confirming It Works:

1. **Avatar Storage**: Replace base64 with cloud storage (Cloudinary, AWS S3)
2. **Image Optimization**: Compress images before upload
3. **Progress Indicators**: Add loading spinners
4. **Validation**: Add client-side validation before API calls
5. **Rate Limiting**: Prevent spam profile updates
6. **Audit Log**: Track profile change history
7. **Remove Debug Logs**: Clean up console.log statements (or keep for monitoring)

---

*Generated: ${new Date().toISOString()}*  
*Status: READY FOR TESTING ✅*  
*Server: Running on port 3001*
