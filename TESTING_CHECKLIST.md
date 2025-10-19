# 🚀 Quick Testing Checklist

## Before Testing
- [ ] Dev server is running (`pnpm dev` in terminal)
- [ ] Server shows: `✓ Ready in X.Xs` 
- [ ] Browser can access http://localhost:3000
- [ ] You are logged in (check session in header)

## Test 1: Event Creation Form Access
- [ ] Navigate to http://localhost:3000/events
- [ ] Click "Create Event" tab
- [ ] Form loads without errors
- [ ] All form fields are visible

## Test 2: Form Validation
Try submitting empty form:
- [ ] Click "Create Event" button
- [ ] Should see error: "Please fill in all required fields..."

Fill only title and submit:
- [ ] Should still see missing fields error

## Test 3: Successful Event Creation
Fill out completely:
- [ ] Title: "Test Event 1"
- [ ] Description: "This is a test event"
- [ ] Date: Choose tomorrow
- [ ] Time: "14:00"
- [ ] Venue: "Test Cafe"
- [ ] Address: "123 Test St"
- [ ] University: Select any
- [ ] Max Attendees: "10"
- [ ] Contact: "test@example.com"
- [ ] Select at least one tag

Submit and verify:
- [ ] Loading spinner appears
- [ ] Success toast notification shows
- [ ] Form clears or redirects
- [ ] No error in console

## Test 4: Check Server Logs
Open terminal running `pnpm dev`:
- [ ] See: `🔵 POST /api/events - Event creation request received`
- [ ] See: `✅ User authenticated: your@email.com`
- [ ] See: `📝 Creating event with data:`
- [ ] See: `✅ Database connected`
- [ ] See: `✅ Event inserted with ID:`
- [ ] No ❌ error messages

## Test 5: Verify Event in Database
Open MongoDB Compass or Atlas:
- [ ] Connect to your database
- [ ] Open `arisze` database
- [ ] Open `events` collection
- [ ] Your test event should be there
- [ ] Check all fields are present

## Test 6: Event Appears in Browse Tab
- [ ] Click "Book Events" tab
- [ ] Your created event should appear
- [ ] Event card shows correct info
- [ ] Can click to view details

## Test 7: Event Booking Works
- [ ] Click "Book Event" on your event
- [ ] Booking modal opens
- [ ] Fill in phone and university
- [ ] Submit booking
- [ ] Success message appears
- [ ] Attendee count increases

## Test 8: Check Browser Console (F12)
- [ ] No red errors in console
- [ ] Network tab shows POST to `/api/events` 
- [ ] Response status is 201 Created
- [ ] Response body has `success: true`

## 🐛 If Any Test Fails

### Error: "Failed to fetch"
1. Check dev server is running
2. Check you're on http://localhost:3000
3. Check browser console for CORS errors
4. Try hard refresh (Ctrl+Shift+R)

### Error: "Unauthorized"
1. Log out and log back in
2. Check session in browser DevTools → Application → Cookies
3. Verify NextAuth cookies exist

### Error: "Missing required fields"
1. Double-check all form fields are filled
2. Check venue field specifically
3. Check date is valid format

### No server logs appearing
1. Dev server might not be running
2. Check terminal for errors
3. Restart dev server with `pnpm dev`

### Event doesn't appear after creation
1. Check database for the event
2. Try refreshing the browse events tab
3. Check filter/search isn't hiding it
4. Check browser console for fetch errors

## ✅ Success Criteria
All items checked = Event creation is working! 🎉

## 📝 Notes
- Take screenshots if you encounter errors
- Copy error messages from console
- Note which step fails for easier debugging
