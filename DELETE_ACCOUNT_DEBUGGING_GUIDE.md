# Delete Account - Debugging Guide

**Issue**: "Failed to delete account" error  
**Status**: Enhanced with detailed logging  
**Latest Commit**: 7eb0400

---

## How to Debug

### Step 1: Check Browser Console

1. Open `/settings` page
2. Go to Settings → Danger Zone
3. Click "Delete My Account"
4. Confirm deletion
5. **Open browser DevTools** (F12)
6. Go to **Console** tab
7. Look for logs like:

```
Sending delete account request...
Delete account response status: 200
Delete account response: {success: true, ...}
```

### Step 2: Check Server Logs

If you're running locally or have access to server logs, you should see:

```
=== Delete account request START ===
Method: POST
URL: http://localhost:3000/api/user/delete-account
Session cookie: found (85 chars)
✓ Session parsed, email: user@example.com
✓ Connecting to database...
✓ Database connected
🗑️  Deleting user account: user@example.com
✓ User found
🗑️  Deleting orders...
✓ Deleted 3 orders
🗑️  Deleting reviews...
✓ Deleted 2 reviews
🗑️  Removing from coupon tracking...
✓ Updated 0 coupon documents
🗑️  Deleting user...
✓ Deleted user (matched: 1)
✓ All deletions completed successfully
✓ Session cookie cleared
=== Delete account request COMPLETE ===
```

---

## Possible Error Scenarios

### Error: "Not authenticated"
**Cause**: User session cookie missing or invalid  
**Solution**:
1. Make sure you're logged in
2. Try logging out and back in
3. Clear browser cookies and login again

### Error: "Invalid session"
**Cause**: Session JSON format is corrupted  
**Solution**:
1. Check browser console for error message
2. Logout and login again
3. Check if browser is accepting cookies (Settings → Danger Zone should work for logged-in users only)

### Error: "User not found"
**Cause**: User account exists in session but not in database  
**Solution**:
1. Very unusual error
2. Try logging out and back in
3. Contact support with error details from browser console

### Error: "Failed to delete account" with no details
**Cause**: Server-side error (database connection, etc.)  
**Solution**:
1. Check browser console for error message
2. Check server logs for the full error
3. Make sure MongoDB connection is working
4. If database is down, wait and try again

---

## Test the Session Debug Endpoint

To verify your session is being stored correctly:

```bash
# In browser console, run:
fetch('/api/user/session-debug').then(r => r.json()).then(console.log)
```

**Expected Response**:
```json
{
  "sessionExists": true,
  "sessionValue": "{\"name\":\"John Doe\",\"email\":\"john@example.com\"}",
  "allCookies": {
    "user_session": "{\"name\":\"John Doe\",\"emai..."
  }
}
```

**If sessionExists is false**:
- User is not logged in
- Login first, then try delete account

---

## What Gets Deleted

When you successfully delete an account:

1. **User Account**
   - Name
   - Email
   - Password hash
   - Phone number (if set)

2. **Orders**
   - All orders linked to user email
   - Order history
   - Shipping details

3. **Reviews**
   - All reviews written by user
   - Ratings and comments

4. **Coupon Tracking**
   - User removed from used-by lists
   - Can re-use coupons after account recreation

---

## Frontend Error Handling

The frontend now shows:
- Specific error messages from API
- Server error details
- Console logs for debugging

Check the Settings page for error messages that say:
- "Invalid session data"
- "User not found"
- "Failed to delete account"

Each error has a specific cause that should be visible in:
- Browser console (F12 → Console)
- Network tab (F12 → Network → delete-account request)

---

## Network Tab Debugging

1. Open DevTools (F12)
2. Go to **Network** tab
3. Go to Settings → Danger Zone
4. Click "Delete My Account"
5. Look for `delete-account` request
6. Click it and check:

**Request**:
- Method: POST
- Headers: Should include Cookie with user_session
- No body needed

**Response**:
- Status: Should be 200 (success) or show error code
- Body: 
  - Success: `{success: true, deleted: {...}}`
  - Error: `{error: "error message"}`

---

## Common Issues & Solutions

### Issue: Session cookie not sent
**Problem**: API returns 401 "Not authenticated"

**Solutions**:
1. Make sure you're logged in
2. Check if browser accepts cookies (3rd-party cookies might be blocked)
3. Clear cookies and login again:
   - DevTools → Application → Cookies → Delete user_session
   - Logout
   - Login again
   - Try delete account

### Issue: Orders/reviews not found
**Problem**: Deleted 0 orders and 0 reviews (but account still deleted)

**Solutions** (all normal):
- User might not have any orders
- User might not have any reviews
- This is NOT an error - account still gets deleted

### Issue: Database connection error
**Problem**: Error message mentions "MongoDB" or "connection"

**Solutions**:
1. Check if MongoDB Atlas is accessible
2. Check internet connection
3. Check if connection string in .env is correct
4. Retry the operation

---

## Testing Locally

### Setup Test User:
1. Create account: `test@example.com` / `password123`
2. Place an order
3. Write a review
4. Go to `/settings`
5. Click "Delete My Account"
6. Confirm

### Verify Deletion:
In MongoDB:
```javascript
// Should be empty after deletion:
db.users.findOne({email: "test@example.com"})  // null
db.orders.find({"shippingAddress.email": "test@example.com"})  // []
db.reviews.find({email: "test@example.com"})  // []
```

---

## Response Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Account deleted ✓ |
| 400 | Bad request | Missing data (shouldn't happen) |
| 401 | Unauthorized | Not logged in - login first |
| 404 | Not found | User account not found |
| 500 | Server error | Check logs, try again |

---

## Logging Output Meanings

| Symbol | Meaning |
|--------|---------|
| ✓ | Step completed successfully |
| ❌ | Error - operation failed |
| 🗑️ | Deletion in progress |

Example sequence:
```
✓ Session parsed
✓ Database connected
🗑️ Deleting orders...
✓ Deleted 3 orders
🗑️ Deleting reviews...
✓ Deleted 1 review
🗑️ Deleting user...
✓ Deleted user
✓ Session cookie cleared
✓ ALL DONE!
```

---

## What To Check If It Fails

1. **Browser Console** (F12 → Console):
   - Look for errors
   - Copy the full error message

2. **Network Tab** (F12 → Network):
   - Find `delete-account` POST request
   - Check response status and body

3. **Server Logs**:
   - Look for `DELETE ACCOUNT START` logs
   - Find where it stopped (look for ❌ symbol)
   - Check the error message

4. **Database Status**:
   - Can you login? (If yes, DB is working)
   - Are other operations working?

---

## Need Help?

When reporting the issue, include:

1. Screenshot of the error message
2. Full browser console output (copy/paste)
3. Network tab response body
4. Server logs (if available)
5. Steps to reproduce:
   - Create new account or login
   - What you did before clicking delete
   - What happened when you clicked delete

---

## Latest Changes

**Commit**: 7eb0400

Enhanced with:
- ✓ Emoji-based visual logging
- ✓ Detailed session logging
- ✓ Database operation tracking
- ✓ Error type reporting
- ✓ Session debug endpoint
- ✓ Better error messages

---

**Status**: Ready for debugging  
**Last Updated**: May 30, 2026  
**Build**: ✅ Succeeds
