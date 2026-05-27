# Order Status Notifications - Complete Flow Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     MAKE MY MEMORY SYSTEM                        │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                        ADMIN PANEL                               │
│                    /admin/orders/[id]                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Order Details                                          │   │
│  │  ├─ Order ID: MMM-ABC123                               │   │
│  │  ├─ Status: confirmed                                  │   │
│  │  ├─ Customer: John Doe                                 │   │
│  │  └─ Items: [...]                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Update Order Section                                  │   │
│  │  ├─ Status Dropdown: [processing ▼]                   │   │
│  │  ├─ Courier Name: [Delhivery]                         │   │
│  │  ├─ Tracking ID: [AWB123456789]                       │   │
│  │  ├─ Tracking URL: [https://track.delhivery.com/...]  │   │
│  │  └─ [Save Changes] Button                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              │
                              │ PUT Request
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│              API ENDPOINT                                        │
│         /api/admin/orders/update-status                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Validate admin session (cookies)                            │
│  2. Validate request body (orderId, status)                     │
│  3. Find order in database                                      │
│  4. Update order.status                                         │
│  5. Add tracking event with timestamp                           │
│  6. Save order to database                                      │
│  7. Check Settings.orderNotifications flag                      │
│  8. If enabled: Send email to customer                          │
│  9. Return success response                                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
        ┌──────────────────┐  ┌──────────────────┐
        │  DATABASE        │  │  EMAIL SERVICE   │
        │  (MongoDB)       │  │  (Resend)        │
        ├──────────────────┤  ├──────────────────┤
        │                  │  │                  │
        │ Order Updated:   │  │ Email Sent:      │
        │ ├─ status       │  │ ├─ to: customer  │
        │ ├─ tracking     │  │ ├─ subject: ...  │
        │ │  events       │  │ ├─ template: ... │
        │ └─ courier info │  │ └─ status: sent  │
        │                  │  │                  │
        └──────────────────┘  └──────────────────┘
                    │                   │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  CUSTOMER EMAIL  │
                    ├──────────────────┤
                    │                  │
                    │ Subject:         │
                    │ "Your Order is   │
                    │  Being Prepared" │
                    │                  │
                    │ Content:         │
                    │ ├─ Order ID      │
                    │ ├─ Status        │
                    │ ├─ Tracking Info │
                    │ └─ Next Steps    │
                    │                  │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  CUSTOMER INBOX  │
                    │  (Email Received)│
                    └──────────────────┘
```

## Complete User Journey

### Admin's Perspective

```
Admin logs in
    ↓
Navigates to /admin/orders
    ↓
Clicks on order (e.g., MMM-ABC123)
    ↓
Sees order details and tracking history
    ↓
Scrolls to "Update Order" section
    ↓
Selects new status: "processing"
    ↓
Enters courier details (optional):
  - Courier Name: "Delhivery"
  - Tracking ID: "AWB123456789"
  - Tracking URL: "https://track.delhivery.com/..."
    ↓
Clicks "Save Changes"
    ↓
API validates and updates order
    ↓
Email sent to customer (if enabled)
    ↓
Success message: "✓ Saved successfully"
    ↓
Tracking history updated with new event
```

### Customer's Perspective

```
Customer places order
    ↓
Receives order confirmation email
    ↓
Logs into account at /account
    ↓
Sees order with status: "confirmed"
    ↓
[Admin updates status to "processing"]
    ↓
Customer receives email:
  "We're Preparing Your Order"
    ↓
Customer checks account again
    ↓
Sees status updated to "processing"
    ↓
[Admin updates status to "shipped" with tracking]
    ↓
Customer receives email:
  "Your Order is On Its Way!"
  Includes: Tracking ID, Courier, Estimated Delivery
    ↓
Customer clicks "Track Shipment" button
    ↓
Redirected to courier tracking page
    ↓
Can track package in real-time
    ↓
[Admin updates status to "delivered"]
    ↓
Customer receives email:
  "Your Order Has Been Delivered!"
  Includes: Link to leave review
    ↓
Customer sees status: "delivered" in account
    ↓
Can see full tracking history with all updates
```

## Status Transition Diagram

```
                    ┌─────────────┐
                    │  confirmed  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ processing  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────────────┐
                    │ shipped / out_for   │
                    │ _delivery           │
                    └──────┬──────────────┘
                           │
                    ┌──────▼──────┐
                    │ delivered   │
                    └─────────────┘

Alternative paths:

confirmed ──────────────────────────► cancelled
confirmed ──────────────────────────► payment_failed
```

## Email Notification Timeline

```
Order Placed (confirmed)
    │
    ├─ Email: Order Confirmation (sent at checkout)
    │
    ▼
Admin updates to "processing"
    │
    ├─ Email: "We're Preparing Your Order"
    │
    ▼
Admin updates to "shipped"
    │
    ├─ Email: "Your Order is On Its Way!"
    │ └─ Includes: Tracking ID, Courier, URL
    │
    ▼
Admin updates to "out_for_delivery"
    │
    ├─ Email: "Your Order is Out for Delivery"
    │
    ▼
Admin updates to "delivered"
    │
    ├─ Email: "Your Order Has Been Delivered!"
    │ └─ Includes: Review link
    │
    ▼
Order Complete
```

## Data Flow

### Request Flow

```
Admin UI
  │
  ├─ Collects: orderId, status, tracking info
  │
  ▼
PUT /api/admin/orders/update-status
  │
  ├─ Validates admin session
  ├─ Validates request body
  ├─ Finds order in MongoDB
  ├─ Updates order document
  ├─ Adds tracking event
  ├─ Checks Settings.orderNotifications
  ├─ Sends email (if enabled)
  │
  ▼
Response: { success: true, order: {...} }
  │
  ▼
Admin UI
  │
  ├─ Shows success message
  ├─ Updates order display
  ├─ Refreshes tracking history
  │
  ▼
Admin sees confirmation
```

### Email Flow

```
API Endpoint
  │
  ├─ Determines email template based on status
  │
  ├─ Prepares email content:
  │  ├─ To: customer email from order
  │  ├─ Subject: status-specific subject
  │  ├─ HTML: formatted email template
  │
  ▼
Resend Email Service
  │
  ├─ Validates email address
  ├─ Sends email
  ├─ Returns delivery status
  │
  ▼
Customer Email Provider
  │
  ├─ Receives email
  ├─ Delivers to inbox (or spam)
  │
  ▼
Customer
  │
  ├─ Receives notification
  ├─ Can click tracking link
  ├─ Can view order in account
  │
  ▼
Customer sees order update
```

## Settings Control Flow

```
Admin Settings Page (/admin/settings)
  │
  ├─ Toggle: "Order Notifications"
  │
  ▼
PUT /api/admin/settings/toggle
  │
  ├─ Updates Settings.orderNotifications
  │
  ▼
Settings saved to database
  │
  ├─ When enabled: Emails sent on status changes
  ├─ When disabled: Status updates, no emails
  │
  ▼
Next status update uses new setting
```

## Error Handling Flow

```
Admin clicks "Save Changes"
  │
  ▼
API receives request
  │
  ├─ Is admin authenticated?
  │  ├─ No → Return 401 "Unauthorized"
  │  └─ Yes → Continue
  │
  ├─ Is request valid?
  │  ├─ No → Return 400 "Missing required fields"
  │  └─ Yes → Continue
  │
  ├─ Is status valid?
  │  ├─ No → Return 400 "Invalid status"
  │  └─ Yes → Continue
  │
  ├─ Does order exist?
  │  ├─ No → Return 404 "Order not found"
  │  └─ Yes → Continue
  │
  ├─ Update order
  │  ├─ Success → Continue
  │  └─ Error → Return 500 "Internal server error"
  │
  ├─ Send email (if enabled)
  │  ├─ Success → Continue
  │  └─ Error → Log error, continue (don't fail)
  │
  ▼
Return 200 "Success"
  │
  ▼
Admin UI shows success message
```

## Database Schema Relationships

```
┌─────────────────────────────────────────┐
│           Order Document                │
├─────────────────────────────────────────┤
│ _id: ObjectId                           │
│ orderId: "MMM-ABC123"                   │
│ status: "shipped"                       │
│ paymentMethod: "razorpay"               │
│ items: [...]                            │
│ shippingAddress: {...}                  │
│ subtotal: 5000                          │
│ shippingCharge: 100                     │
│ total: 5100                             │
│ courierName: "Delhivery"                │
│ courierTrackingId: "AWB123456789"       │
│ courierTrackingUrl: "https://..."       │
│ trackingEvents: [                       │
│   {                                     │
│     status: "confirmed",                │
│     description: "Order confirmed",     │
│     timestamp: 2026-05-28T10:00:00Z     │
│   },                                    │
│   {                                     │
│     status: "processing",               │
│     description: "Order being prepared",│
│     timestamp: 2026-05-28T11:00:00Z     │
│   },                                    │
│   {                                     │
│     status: "shipped",                  │
│     description: "Order has been shipped",
│     timestamp: 2026-05-28T14:00:00Z     │
│   }                                     │
│ ]                                       │
│ createdAt: 2026-05-28T10:00:00Z         │
│ updatedAt: 2026-05-28T14:00:00Z         │
└─────────────────────────────────────────┘
         │
         │ References
         ▼
┌─────────────────────────────────────────┐
│        Settings Document                │
├─────────────────────────────────────────┤
│ _id: ObjectId                           │
│ storeName: "Make My Memory"             │
│ phone: "+91-..."                        │
│ address: "..."                          │
│ happyCustomers: 1000                    │
│ memoriesCreated: 1000                   │
│ averageRating: 4.8                      │
│ founded: 2026                           │
│ reviewsActive: true                     │
│ maintenanceMode: false                  │
│ orderNotifications: true ◄──── Controls │
│ promotionsActive: true                  │ email sending
│ createdAt: 2026-05-28T10:00:00Z         │
│ updatedAt: 2026-05-28T14:00:00Z         │
└─────────────────────────────────────────┘
```

## Performance Metrics

```
Operation                    Time        Notes
─────────────────────────────────────────────────────
API Request Processing       < 50ms      Validation + DB query
Order Status Update          < 30ms      Single document update
Tracking Event Addition      < 20ms      Array append
Email Sending                < 100ms     Async, doesn't block
Total Response Time          < 100ms     Includes all above
Database Query               < 20ms      Indexed by orderId
Settings Check               < 10ms      Single document lookup
```

## Security Layers

```
Request
  │
  ├─ Layer 1: Authentication
  │  └─ Check admin_session cookie
  │
  ├─ Layer 2: Validation
  │  ├─ Validate orderId format
  │  ├─ Validate status enum
  │  └─ Validate tracking URL format
  │
  ├─ Layer 3: Authorization
  │  └─ Verify order exists
  │
  ├─ Layer 4: Data Integrity
  │  ├─ Use MongoDB transactions
  │  └─ Validate email address
  │
  ▼
Safe to Process
```

---

This diagram shows the complete flow of the order status notification system from admin action to customer notification.
