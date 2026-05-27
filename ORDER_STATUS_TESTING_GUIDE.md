# Order Status Notifications - Testing Guide

## Pre-Testing Checklist

- [ ] MongoDB connection is working
- [ ] Resend API key is set in `.env.local` or `.env.production`
- [ ] Admin is logged in to `/admin`
- [ ] At least one order exists in the database
- [ ] Email service is configured

## Test 1: Basic Status Update

### Objective
Verify that admin can update order status and see confirmation.

### Steps

1. **Navigate to Admin Orders**
   - Go to `/admin/orders`
   - Verify orders are displayed

2. **Open an Order**
   - Click on any order
   - Verify order details load (ID, customer, items, etc.)

3. **Update Status**
   - Scroll to "Update Order" section
   - Select status: `processing`
   - Click "Save Changes"

4. **Verify Success**
   - ✅ Success message appears: "✓ Saved successfully"
   - ✅ Status badge updates to "processing"
   - ✅ Tracking history shows new event

### Expected Result
Status updates successfully without errors.

---

## Test 2: Email Notification - Processing

### Objective
Verify that customer receives email when order status changes to "processing".

### Steps

1. **Enable Notifications**
   - Go to `/admin/settings`
   - Verify "Order Notifications" toggle is ON
   - If OFF, turn it ON and save

2. **Update Order Status**
   - Go to `/admin/orders`
   - Open an order with status "confirmed"
   - Change status to "processing"
   - Click "Save Changes"

3. **Check Email**
   - Check customer email inbox
   - Look for email from "Make My Memory"
   - Subject should be: "We're Preparing Your Order"

4. **Verify Email Content**
   - ✅ Email contains order ID
   - ✅ Email contains customer name
   - ✅ Email says "Order is being prepared"
   - ✅ Email has Make My Memory branding

### Expected Result
Customer receives processing email within 1-2 minutes.

---

## Test 3: Email Notification - Shipped with Tracking

### Objective
Verify that customer receives email with tracking information when order is shipped.

### Steps

1. **Update to Shipped Status**
   - Go to `/admin/orders`
   - Open an order with status "processing"
   - Change status to "shipped"
   - Fill in tracking details:
     - Courier Name: `Delhivery`
     - Tracking ID: `AWB123456789`
     - Tracking URL: `https://track.delhivery.com/AWB123456789`
   - Click "Save Changes"

2. **Check Email**
   - Check customer email inbox
   - Subject should be: "Your Order is On Its Way!"

3. **Verify Email Content**
   - ✅ Email contains order ID
   - ✅ Email contains tracking ID: `AWB123456789`
   - ✅ Email contains courier name: `Delhivery`
   - ✅ Email shows estimated delivery time
   - ✅ Email has tracking information

### Expected Result
Customer receives shipped email with tracking details.

---

## Test 4: Email Notification - Delivered

### Objective
Verify that customer receives email when order is delivered.

### Steps

1. **Update to Delivered Status**
   - Go to `/admin/orders`
   - Open an order with status "shipped"
   - Change status to "delivered"
   - Click "Save Changes"

2. **Check Email**
   - Check customer email inbox
   - Subject should be: "Your Order Has Been Delivered!"

3. **Verify Email Content**
   - ✅ Email contains order ID
   - ✅ Email congratulates customer
   - ✅ Email invites customer to leave review
   - ✅ Email has link to reviews page

### Expected Result
Customer receives delivery email with review invitation.

---

## Test 5: Email Notification - Cancelled

### Objective
Verify that customer receives email when order is cancelled.

### Steps

1. **Update to Cancelled Status**
   - Go to `/admin/orders`
   - Open an order with status "confirmed" or "processing"
   - Change status to "cancelled"
   - Click "Save Changes"

2. **Check Email**
   - Check customer email inbox
   - Subject should be: "Your Order Has Been Cancelled"

3. **Verify Email Content**
   - ✅ Email contains order ID
   - ✅ Email explains cancellation
   - ✅ Email mentions refund process
   - ✅ Email shows refund timeline (5-7 business days)

### Expected Result
Customer receives cancellation email with refund information.

---

## Test 6: Disable Email Notifications

### Objective
Verify that emails are NOT sent when notifications are disabled.

### Steps

1. **Disable Notifications**
   - Go to `/admin/settings`
   - Find "Order Notifications" toggle
   - Turn it OFF
   - Click "Save Changes"

2. **Update Order Status**
   - Go to `/admin/orders`
   - Open an order
   - Change status to "processing"
   - Click "Save Changes"

3. **Verify Success Message**
   - ✅ Success message appears
   - ✅ Status updates in database

4. **Check Email**
   - Check customer email inbox
   - ✅ NO email should be received

5. **Re-enable Notifications**
   - Go to `/admin/settings`
   - Turn "Order Notifications" ON
   - Click "Save Changes"

### Expected Result
Status updates successfully but no email is sent when notifications are disabled.

---

## Test 7: Tracking History Display

### Objective
Verify that tracking history displays correctly in admin and user account.

### Steps

1. **Admin View**
   - Go to `/admin/orders`
   - Open an order that has been updated multiple times
   - Scroll to "Tracking History" section
   - Verify all status updates are listed in reverse chronological order
   - ✅ Each event shows: status, description, timestamp

2. **Customer View**
   - Go to `/account` (as customer)
   - Click on an order to expand it
   - Scroll to "Order Timeline" section
   - Verify all status updates are displayed
   - ✅ Each event shows: status, description, timestamp

### Expected Result
Tracking history displays correctly in both admin and customer views.

---

## Test 8: Courier Tracking Link

### Objective
Verify that customer can click tracking link to track shipment.

### Steps

1. **Update Order with Tracking URL**
   - Go to `/admin/orders`
   - Open an order
   - Change status to "shipped"
   - Fill in:
     - Courier Name: `Delhivery`
     - Tracking ID: `AWB123456789`
     - Tracking URL: `https://track.delhivery.com/AWB123456789`
   - Click "Save Changes"

2. **Customer View**
   - Go to `/account` (as customer)
   - Expand the order
   - Look for "Track Shipment" button
   - ✅ Button should be visible

3. **Click Tracking Link**
   - Click "Track Shipment" button
   - ✅ Should open courier tracking page in new tab
   - ✅ URL should match the tracking URL you entered

### Expected Result
Tracking link works and opens courier tracking page.

---

## Test 9: Error Handling - Invalid Status

### Objective
Verify that API rejects invalid status values.

### Steps

1. **Attempt Invalid Status Update**
   - Open browser developer tools (F12)
   - Go to `/admin/orders`
   - Open an order
   - Manually modify the status dropdown value to something invalid
   - Try to save

2. **Verify Error**
   - ✅ Error message should appear
   - ✅ Status should NOT update in database

### Expected Result
Invalid status is rejected with error message.

---

## Test 10: Error Handling - Unauthorized Access

### Objective
Verify that non-admin users cannot update order status.

### Steps

1. **Logout from Admin**
   - Go to `/admin`
   - Click "Logout"

2. **Try to Access Admin Orders**
   - Try to navigate to `/admin/orders`
   - ✅ Should redirect to `/admin/login`

3. **Try Direct API Call**
   - Open browser console
   - Run:
     ```javascript
     fetch('/api/admin/orders/update-status', {
       method: 'PUT',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         orderId: 'MMM-ABC123',
         status: 'processing'
       })
     }).then(r => r.json()).then(console.log)
     ```
   - ✅ Should return 401 "Unauthorized"

### Expected Result
Non-admin users cannot access admin endpoints.

---

## Test 11: Mobile Responsiveness

### Objective
Verify that order status update works on mobile devices.

### Steps

1. **Open on Mobile**
   - Open `/admin/orders` on mobile device or use browser dev tools (F12)
   - Toggle device toolbar to mobile view
   - Open an order

2. **Update Status**
   - Scroll to "Update Order" section
   - Select new status
   - Fill in tracking fields
   - Click "Save Changes"

3. **Verify**
   - ✅ All fields are accessible on mobile
   - ✅ Buttons are easy to tap
   - ✅ Success message displays
   - ✅ Status updates correctly

### Expected Result
Order status update works smoothly on mobile devices.

---

## Test 12: Concurrent Updates

### Objective
Verify that system handles multiple status updates correctly.

### Steps

1. **Open Two Admin Sessions**
   - Open `/admin/orders` in two browser tabs
   - Open the same order in both tabs

2. **Update Status in Tab 1**
   - Change status to "processing"
   - Click "Save Changes"
   - ✅ Success message appears

3. **Update Status in Tab 2**
   - Change status to "shipped"
   - Click "Save Changes"
   - ✅ Success message appears

4. **Verify Final State**
   - Refresh both tabs
   - ✅ Both should show status "shipped" (last update wins)
   - ✅ Tracking history shows both updates

### Expected Result
System handles concurrent updates correctly.

---

## Test 13: Database Verification

### Objective
Verify that order data is correctly stored in MongoDB.

### Steps

1. **Connect to MongoDB**
   - Use MongoDB Compass or Atlas UI
   - Navigate to `make-my-memory` database
   - Open `orders` collection

2. **Find Test Order**
   - Search for order by ID
   - Verify order document contains:
     - ✅ `status` field with correct value
     - ✅ `trackingEvents` array with all updates
     - ✅ `courierName`, `courierTrackingId`, `courierTrackingUrl` fields
     - ✅ `updatedAt` timestamp is recent

3. **Check Settings**
   - Open `settings` collection
   - Verify document contains:
     - ✅ `orderNotifications` boolean field
     - ✅ Value matches admin settings

### Expected Result
Database contains correct order and settings data.

---

## Test 14: Email Service Verification

### Objective
Verify that Resend email service is working.

### Steps

1. **Check Resend Dashboard**
   - Go to https://resend.com/emails
   - Log in with your account
   - Look for recent emails

2. **Verify Email Details**
   - ✅ Email was sent to correct recipient
   - ✅ Email subject is correct
   - ✅ Email status is "delivered" or "opened"
   - ✅ Email contains correct content

3. **Check Email Headers**
   - Click on email in Resend dashboard
   - Verify:
     - ✅ From: Make My Memory
     - ✅ To: customer email
     - ✅ Subject: status-specific subject

### Expected Result
Emails are sent through Resend service correctly.

---

## Test 15: Full Order Lifecycle

### Objective
Test complete order journey from creation to delivery.

### Steps

1. **Create Test Order**
   - Go to `/shop`
   - Add product to cart
   - Go to checkout
   - Complete payment (use test card if available)
   - Note the order ID

2. **Update Status: Processing**
   - Go to `/admin/orders`
   - Find the test order
   - Change status to "processing"
   - Save
   - ✅ Email sent

3. **Update Status: Shipped**
   - Change status to "shipped"
   - Add tracking info
   - Save
   - ✅ Email sent with tracking

4. **Update Status: Out for Delivery**
   - Change status to "out_for_delivery"
   - Save
   - ✅ Email sent

5. **Update Status: Delivered**
   - Change status to "delivered"
   - Save
   - ✅ Email sent

6. **Verify Customer View**
   - Log in as customer
   - Go to `/account`
   - Expand order
   - ✅ See all status updates
   - ✅ See tracking history
   - ✅ See final status "delivered"

### Expected Result
Complete order lifecycle works end-to-end.

---

## Troubleshooting

### Emails Not Received

1. **Check Settings**
   - Go to `/admin/settings`
   - Verify "Order Notifications" is ON

2. **Check Email Configuration**
   - Verify Resend API key in `.env.local`
   - Check Resend dashboard for errors

3. **Check Customer Email**
   - Verify order has valid email address
   - Check spam/junk folder

4. **Check Logs**
   - Look for errors in server console
   - Check Resend dashboard for failed sends

### Status Not Updating

1. **Check Admin Session**
   - Verify you're logged in
   - Check browser cookies

2. **Check Network**
   - Open browser dev tools (F12)
   - Check Network tab for API response
   - Look for error messages

3. **Check Database**
   - Verify MongoDB connection
   - Check order exists in database

### Tracking History Not Showing

1. **Refresh Page**
   - Refresh `/admin/orders/[id]`
   - Refresh `/account`

2. **Check Database**
   - Verify `trackingEvents` array exists
   - Verify events have correct structure

---

## Performance Testing

### Objective
Verify system performance under normal load.

### Steps

1. **Measure API Response Time**
   - Open browser dev tools (F12)
   - Go to Network tab
   - Update order status
   - Check response time
   - ✅ Should be < 200ms

2. **Measure Email Delivery Time**
   - Note time of status update
   - Check email received time
   - ✅ Should be < 2 minutes

3. **Measure Page Load Time**
   - Go to `/admin/orders`
   - Check page load time
   - ✅ Should be < 2 seconds

---

## Regression Testing

After any code changes, run these tests:

- [ ] Test 1: Basic Status Update
- [ ] Test 2: Email Notification - Processing
- [ ] Test 3: Email Notification - Shipped
- [ ] Test 4: Email Notification - Delivered
- [ ] Test 6: Disable Email Notifications
- [ ] Test 7: Tracking History Display
- [ ] Test 10: Error Handling - Unauthorized Access

---

## Test Report Template

```
Date: _______________
Tester: _______________
Build: _______________

Test Results:
- Test 1: ✅ PASS / ❌ FAIL
- Test 2: ✅ PASS / ❌ FAIL
- Test 3: ✅ PASS / ❌ FAIL
- Test 4: ✅ PASS / ❌ FAIL
- Test 5: ✅ PASS / ❌ FAIL
- Test 6: ✅ PASS / ❌ FAIL
- Test 7: ✅ PASS / ❌ FAIL
- Test 8: ✅ PASS / ❌ FAIL
- Test 9: ✅ PASS / ❌ FAIL
- Test 10: ✅ PASS / ❌ FAIL
- Test 11: ✅ PASS / ❌ FAIL
- Test 12: ✅ PASS / ❌ FAIL
- Test 13: ✅ PASS / ❌ FAIL
- Test 14: ✅ PASS / ❌ FAIL
- Test 15: ✅ PASS / ❌ FAIL

Issues Found:
1. _______________
2. _______________
3. _______________

Notes:
_______________
_______________
```

---

**Last Updated**: May 28, 2026
**Version**: 1.0
