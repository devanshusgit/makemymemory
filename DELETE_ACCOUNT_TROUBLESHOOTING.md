# Delete Account - Complete Troubleshooting Guide

**Issue**: "Failed to delete account" error when attempting to delete user account  
**Status**: Enhanced with detailed error logging and debugging tools  
**Latest Commit**: b3c8285  
**Last Updated**: June 2, 2026

---

## ⚡ Quick Start - Test Your Account Deletion

### Step 1: Check If You're Logged In
```javascript
// Paste in browser console (F12 → Console)
fetch('/api/user/session-debug', { method: 'POST' })
  .then(r => r.json())
  .then(r => {
    console.log('Session Status:', r.sessionExists ? '✓ Logged In' : '❌ Not Logged In');
    if (r.parsedSession) console.log('User:', r.parsedSession);
    if (r.parseError) console.error('Parse Error:', r.parseError);
    console.log('Full Response:', r);
  });
```

**Expected Output (if logged in)**:
```json
{
  "sessionExists": true,
  "parsedSession": { "name": "Your Name", "email": "you@example.com" },
  "parseError": null
}
```

**If NOT logged in**: Login first, then try delete account

---

### Step 2: Attempt Delete and Check Error
1. Go to `/settings`
2. Click "Danger Zone" tab
3. Click "Delete My Account"
4. Confirm the warning
5. **Watch the screen** for error message
6. **Open browser console** (F12 → Console)
7. Look for logs like:
   - `Sending delete account request...`
   - `Delete account response status: 200` or `500`
   - `Delete account response: {...}`

---

## 🔍 Detailed Debugging

### Check Browser Console (F12)

#### Success Scenario
```
Sending delete account request...
Delete account response status: 200
Delete account response: {success: true, deleted: {user: "test@example.com", orders: 3, reviews: 1}}
Account deleted successfully, Redirecting...
```
↓ You'll be redirected to homepage ✓

#### Error Scenario
```
Sending delete account request...
Delete account response status: 500
Delete account response: {error: "...", type: "MongoError"}
Delete failed: MongoError
```
↓ Error message shown on page, check details below

---

## 🐛 Common Errors & Solutions

### Error 1: "Not authenticated" (401)
**Cause**: Session cookie is missing or not being sent  
**Solution**:
1. Check if you're logged in (test session first)
2. Clear cookies and login again:
   - Go to DevTools (F12)
   - Application → Cookies → Delete `user_session`
   - Go back to login page
   - Login with your credentials
   - Try delete account again

---

### Error 2: "Invalid session" or "Invalid session data" (401)
**Cause**: Session JSON is corrupted or not in expected format  
**Solution**:
1. Logout: `/api/auth/logout` (POST)
2. Clear all cookies:
   - DevTools → Application → Cookies → Delete all
   - Close browser tab
3. Login again
4. Check session: Use the test from "Step 1" above
5. Try delete account

---

### Error 3: "User not found" (404)
**Cause**: User account doesn't exist in database  
**Solution** (Very unusual):
1. Verify you're using the correct account
2. Logout and login again
3. Contact support with:
   - Your email address
   - Full error message
   - Browser console output

---

### Error 4: "MongoError" or Database Connection Error (500)
**Cause**: Database connection issue  
**Solution**:
1. Check your internet connection
2. Wait a moment (server might be restarting)
3. Try again
4. If still failing:
   - Check MongoDB Atlas status
   - Verify `.env` has correct `MONGODB_URI`
   - Contact support

---

### Error 5: Generic "Failed to delete account" (500)
**Cause**: Unknown server error  
**Solution**:
1. Open DevTools (F12 → Network tab)
2. Click "Delete My Account"
3. Find the `delete-account` POST request
4. Click it and check:
   - **Request**: Headers should have Cookie
   - **Response**: Body should show error details
5. Copy the error message and try one of solutions above
6. If still stuck:
   - Check server logs (if running locally)
   - Try a different browser
   - Try in Incognito/Private mode

---

## 🧪 Verification Steps

### Verify Session Format
```javascript
// Get the raw session value
fetch('/api/user/session-debug', { method: 'POST' })
  .then(r => r.json())
  .then(r => {
    console.log('Session Value:', r.sessionValue);
    console.log('Parsed Session:', r.parsedSession);
  });
```

Should return:
```json
{
  "sessionValue": "{\"name\":\"John Doe\",\"email\":\"john@example.com\"}",
  "parsedSession": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Verify Delete Request Headers
1. Open DevTools (F12)
2. Go to Network tab
3. Click "Delete My Account"
4. Find `delete-account` request
5. Check:
   - **General**: Method should be `POST`, Status should be `200` (success) or `4xx/5xx` (error)
   - **Headers**: Should have `Cookie: user_session=...` in Request Headers
   - **Response**: Should show JSON with `success` or `error`

---

## 🚀 Testing Locally

### Full Test Scenario
```bash
# 1. Start dev server
npm run dev

# 2. In browser:
#    - Create account: test@example.com / password123
#    - Place an order (add any product)
#    - Write a review
#    - Go to /settings
#    - Click Danger Zone
#    - Delete account

# 3. Verify deletion in MongoDB:
# mongosh  # or mongo in older versions
# use make_my_memory  # or your database name
# db.users.findOne({email: "test@example.com"})  # Should be null
# db.orders.findOne({"shippingAddress.email": "test@example.com"})  # Should be null
# db.reviews.findOne({email: "test@example.com"})  # Should be null
```

---

## 📊 Expected Behavior by Status Code

| Status | Meaning | Action |
|--------|---------|--------|
| **200** | Success ✓ | Account deleted, redirect to home |
| **400** | Bad Request | Missing or invalid data (shouldn't happen) |
| **401** | Unauthorized | Not logged in - check session |
| **404** | Not Found | User account not found in DB |
| **500** | Server Error | Database/connection issue - retry |

---

## 🔧 Enhanced Error Information

**Updated in commit b3c8285**:

The error response now includes:

```json
{
  "error": "Main error message",
  "type": "ErrorType",
  "details": "Additional details (dev mode only)"
}
```

**In Frontend**, error message shows:
```
ErrorType - error message details
```

This helps identify what exactly went wrong.

---

## 📋 What Gets Deleted

When account deletion succeeds:

### ✓ User Account
- Name, email, password hash
- Phone number (if set)
- Password reset tokens
- All personal data

### ✓ Orders
- All orders linked to user email
- Order history and tracking
- Shipping addresses (order-specific)

### ✓ Reviews
- All product reviews written by user
- Ratings and comments
- Media/images in reviews

### ✓ Coupon Tracking
- User removed from "usedByUsers" lists
- Can re-use coupons after account recreation

### ⚠️ NOT Deleted
- Order history visible in admin (data retention)
- Review content visible publicly (if already approved)
- Analytics data

---

## 🆘 Troubleshooting Checklist

When delete account fails, check in this order:

- [ ] **1. Session Test**
  ```javascript
  fetch('/api/user/session-debug', {method: 'POST'})
    .then(r => r.json()).then(console.log)
  ```
  - Should show `sessionExists: true`
  - Should show `parsedSession` with name and email

- [ ] **2. Browser Console** (F12 → Console)
  - Look for error logs
  - Copy exact error message

- [ ] **3. Network Tab** (F12 → Network)
  - Find `delete-account` request
  - Check response status and body
  - Verify Cookie header present

- [ ] **4. Clear & Retry**
  - Logout completely
  - Clear cookies
  - Clear browser cache
  - Login again
  - Try delete

- [ ] **5. Different Browser**
  - Try Chrome, Firefox, Safari, Edge
  - Try Incognito/Private mode
  - Try different device

- [ ] **6. Server Logs** (if running locally)
  - Look for `=== Delete account request START ===`
  - Find first ❌ or error log
  - Search above that point for root cause

---

## 📝 Sample Error Responses

### Success Response (200)
```json
{
  "success": true,
  "message": "Account deleted successfully",
  "deleted": {
    "user": "test@example.com",
    "orders": 5,
    "reviews": 2
  }
}
```

### Not Authenticated (401)
```json
{
  "error": "Not authenticated"
}
```

### Invalid Session (401)
```json
{
  "error": "Invalid session",
  "type": "SyntaxError"
}
```

### User Not Found (404)
```json
{
  "error": "User not found"
}
```

### Server Error (500)
```json
{
  "error": "Database connection failed",
  "type": "MongoError",
  "details": "querySrv ECONNREFUSED"
}
```

---

## 🎯 When to Contact Support

Include these details:

1. **Screenshot** of error message
2. **Full browser console output** (copy/paste)
3. **Network tab response** (the delete-account request)
4. **Steps to reproduce**:
   - What you did before clicking delete
   - What happened when you clicked delete
5. **Your email** used for the account
6. **Browser** and OS you're using

---

## 💡 Pro Tips

### Tip 1: Check Session Regularly
If using the app for many days, session might expire. Keep checking:
```javascript
fetch('/api/user/session-debug', {method:'POST'}).then(r=>r.json()).then(r=>console.log(r.sessionExists ? 'LOGGED IN' : 'LOGGED OUT'))
```

### Tip 2: Always Clear Cache When Debugging
- DevTools → Application → Cache Storage
- DevTools → Application → Service Workers → Unregister
- DevTools → Application → Cookies → Delete all

### Tip 3: Test Different Networks
- Home WiFi
- Mobile hotspot
- Corporate WiFi
- VPN (if available)

Some networks might block certain operations.

### Tip 4: Use Console for Debugging
Always open console (F12 → Console) BEFORE clicking delete account so you see all logs from the start.

---

## 🆔 File Structure Reference

**Related files**:
- Frontend: `components/settings/SettingsClient.tsx`
- Delete endpoint: `app/api/user/delete-account/route.ts`
- Session debug: `app/api/user/session-debug/route.ts`
- Models: `lib/db/models/User.ts`, `Order.ts`, `Review.ts`, `Coupon.ts`

---

## 📅 Recent Updates

**Commit b3c8285** - Enhanced error logging:
- ✓ Better error messages in frontend
- ✓ Detailed error responses from API
- ✓ Session debug POST endpoint added
- ✓ Stack traces in development mode
- ✓ Error type and details included

---

**Status**: ✅ Ready for production  
**Build**: ✅ Succeeds with no errors  
**Tested**: ✅ Endpoint verified  
**Last Updated**: June 2, 2026
