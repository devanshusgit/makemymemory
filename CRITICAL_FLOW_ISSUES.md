# Critical Flow Issues - Priority Fix List

## 🔴 CRITICAL (Breaks Core User Experience)

### 1. **Logout Functionality Missing**
- Status: ❌ **NOT IMPLEMENTED**
- Impact: Users can't log out, session persists 7 days
- Fix: Create `/api/auth/logout` route to clear cookies

### 2. **PayPal Integration Returns 501**
- Status: ❌ **STUB ONLY**
- Impact: PayPal payment option not functional
- Fix: Either implement full SDK or disable PayPal option

### 3. **Cart Not Synced to User Account**
- Status: ❌ **BROKEN**
- Impact: Users lose cart after login/logout or device switch
- Fix: Add cart sync endpoint and restore on login

### 4. **Coupon Not Applied to Order**
- Status: ⚠️ **INCOMPLETE**
- Impact: Users can't claim discount benefits
- Fix: Persist coupon code to order after validation

### 5. **No Real-time Order Status Updates**
- Status: ❌ **BROKEN**
- Impact: Order tracking shows stale data, no email notifications on status change
- Fix: Implement async status update notifications

### 6. **COD Payment Collection Missing**
- Status: ❌ **BROKEN**
- Impact: No way to collect payment from COD customers
- Fix: Add COD payment collection endpoint

---

## 🟠 HIGH (Breaks Admin Operations or Data Integrity)

### 7. **Product Slug Race Condition**
- Status: ⚠️ **RACE CONDITION**
- Impact: Two admins could create products with same slug simultaneously
- Fix: Use unique database constraint on slug field

### 8. **Admin Password Not Hashed, Stored in .env**
- Status: 🔓 **SECURITY ISSUE**
- Impact: Admin account vulnerable, plaintext password in code
- Fix: Hash password with bcrypt, compare hashes

### 9. **No Admin Logout Endpoint**
- Status: ❌ **NOT IMPLEMENTED**
- Impact: Admin can't log out, session persists 7 days
- Fix: Create `/api/admin/logout` to clear admin session

### 10. **No Status Validation on Order Updates**
- Status: ❌ **BROKEN**
- Impact: Admin can set invalid order state transitions (e.g., delivered → shipped)
- Fix: Add state machine validation

### 11. **Inventory Not Deducted After Order**
- Status: ❌ **BROKEN**
- Impact: Stock counts remain incorrect, overselling possible
- Fix: Deduct inventory when order is confirmed

### 12. **OTP Email/SMS Not Working**
- Status: ❌ **INCOMPLETE**
- Impact: OTP authentication flow broken (no verification possible)
- Fix: Test and enable Twilio SMS and Resend email sending

---

## 🟡 MEDIUM (Feature Gaps or Poor UX)

### 13. **No Account Deletion Confirmation**
- Status: ❌ **BROKEN**
- Impact: Users can accidentally delete account
- Fix: Require OTP/email verification before deletion

### 14. **Session Stored Only in Cookies**
- Status: ⚠️ **INCOMPLETE**
- Impact: No server-side session tracking, can't revoke sessions
- Fix: Add MongoDB session store

### 15. **No Review Moderation**
- Status: ❌ **BROKEN**
- Impact: Spam/fake reviews published immediately
- Fix: Add admin approval workflow

### 16. **No User Address Book**
- Status: ❌ **MISSING**
- Impact: Users enter full address every checkout
- Fix: Add address management endpoint

### 17. **Wishlist Not Database-Persisted**
- Status: ❌ **BROKEN**
- Impact: Wishlist lost on logout/device switch
- Fix: Add wishlist persistence endpoint

### 18. **No Coupon Category Validation**
- Status: ⚠️ **INCOMPLETE**
- Impact: Category-specific coupons applied to all products
- Fix: Validate coupon categories against order items

---

## Implementation Priority

**Phase 1 (Today)** - Must fix before any user traffic:
1. ✅ Logout endpoints (user + admin)
2. ✅ Cart sync to database
3. ✅ Coupon → Order persistence
4. ✅ PayPal disable or implement
5. ✅ Admin password hashing

**Phase 2 (This week)**:
6. Order status validation
7. Email OTP sending
8. Inventory deduction
9. Account deletion confirmation
10. COD payment collection

**Phase 3 (Next week)**:
11. Review moderation
12. User address book
13. Wishlist persistence
14. Coupon category validation
15. Session store

---

## Configuration Required

These must be set in `.env`:
```
# Critical for functionality
MONGODB_URI=<your-mongodb-uri>
ADMIN_PASSWORD=<secure-password>
RAZORPAY_KEY_ID=<key>
RAZORPAY_KEY_SECRET=<secret>

# For email/OTP
SMTP_HOST=<smtp-host>
SMTP_PORT=587
SMTP_USER=<email>
SMTP_PASS=<password>
RESEND_API_KEY=<key>
TWILIO_ACCOUNT_SID=<sid>
TWILIO_AUTH_TOKEN=<token>

# For file uploads
CLOUDINARY_URL=<cloudinary-url>

# For security
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## Testing Checklist

- [ ] User can signup → receive welcome email → login → browse products
- [ ] User can add items to cart → cart persists after logout/login
- [ ] User can checkout with Razorpay → order created
- [ ] User can checkout with COD → order created
- [ ] Admin can login → manage products → logout → can't access without re-login
- [ ] Admin can update order status → customer receives email
- [ ] User can apply coupon → discount applied to order
- [ ] User can track order → status updates in real-time
