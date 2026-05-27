# Order Status Notifications System - Complete Guide

## Overview

The order status notification system allows admins to update order statuses from the admin panel, automatically sending email notifications to customers. The system is fully integrated with the database and email service.

## System Architecture

### Backend Components

#### 1. **Order Status Update API** (`/api/admin/orders/update-status`)
- **Method**: PUT
- **Authentication**: Requires admin session cookie
- **Purpose**: Updates order status and sends email notifications

**Request Body:**
```json
{
  "orderId": "MMM-ABC123",
  "status": "shipped",
  "trackingId": "AWB123456789",
  "courierName": "Delhivery",
  "courierTrackingUrl": "https://track.delhivery.com/...",
  "reason": "Optional reason for cancellation"
}
```

**Valid Status Values:**
- `confirmed` - Order confirmed and payment received
- `processing` - Order is being prepared
- `shipped` - Order has been shipped
- `out_for_delivery` - Order is out for delivery
- `delivered` - Order has been delivered
- `cancelled` - Order has been cancelled
- `payment_failed` - Payment failed

**Response:**
```json
{
  "success": true,
  "message": "Order status updated to shipped",
  "order": {
    "orderId": "MMM-ABC123",
    "status": "shipped",
    "trackingEvents": [...]
  }
}
```

#### 2. **Email Notification Templates**
Located in `lib/email/templates.ts`, the following templates are used:

- `orderProcessingEmail()` - Sent when status changes to "processing"
- `orderShippedEmail()` - Sent when status changes to "shipped" or "out_for_delivery"
- `orderDeliveredEmail()` - Sent when status changes to "delivered"
- `orderCancelledEmail()` - Sent when status changes to "cancelled" or "payment_failed"

#### 3. **Settings Integration**
The `Settings` model includes an `orderNotifications` boolean field:
- When `true` (default): Emails are sent on status changes
- When `false`: No emails are sent (admin can disable notifications)

### Frontend Components

#### 1. **Admin Order Detail Page** (`app/admin/orders/[id]/page.tsx`)
- Server-side page that fetches order data
- Renders the `AdminOrderDetailClient` component

#### 2. **Admin Order Detail Client** (`components/admin/AdminOrderDetailClient.tsx`)
- Interactive component for updating order status
- Features:
  - Status dropdown with all valid statuses
  - Courier name input field
  - Tracking ID input field
  - Tracking URL input field
  - Save button with loading state
  - Success/error feedback messages
  - Displays tracking history

## User Flow

### Admin Workflow

1. **Navigate to Admin Orders**
   - Go to `/admin/orders`
   - Click on an order to view details

2. **Update Order Status**
   - Select new status from dropdown
   - (Optional) Enter courier name (e.g., "Delhivery", "BlueDart")
   - (Optional) Enter tracking ID (e.g., "AWB123456789")
   - (Optional) Enter tracking URL for customer tracking
   - Click "Save Changes"

3. **Confirmation**
   - Success message appears: "✓ Saved successfully"
   - Order status updates in real-time
   - Tracking event is added to order history
   - Email is sent to customer (if notifications enabled)

### Customer Workflow

1. **Receive Email Notification**
   - Customer receives email with order status update
   - Email includes:
     - Order ID
     - Current status
     - Tracking information (if applicable)
     - Estimated delivery time (for shipped status)

2. **Track Order**
   - Customer can view order status in their account
   - Tracking history shows all status updates with timestamps

## Email Notification Details

### Processing Email
- **Trigger**: Status changed to "processing"
- **Content**: Informs customer that order is being prepared
- **Includes**: Order ID, customer name

### Shipped Email
- **Trigger**: Status changed to "shipped" or "out_for_delivery"
- **Content**: Provides tracking information
- **Includes**: Order ID, tracking ID, courier name, estimated delivery time

### Delivered Email
- **Trigger**: Status changed to "delivered"
- **Content**: Confirms delivery and invites review
- **Includes**: Order ID, customer name, link to leave review

### Cancelled Email
- **Trigger**: Status changed to "cancelled" or "payment_failed"
- **Content**: Explains cancellation reason and refund process
- **Includes**: Order ID, reason, refund timeline

## Settings Control

### Admin Settings Page (`/admin/settings`)

The admin can toggle order notifications:

1. Navigate to `/admin/settings`
2. Find "Order Notifications" toggle
3. Enable/Disable as needed
4. Changes take effect immediately

When disabled:
- Order statuses can still be updated
- No emails are sent to customers
- Tracking events are still recorded

## Database Schema

### Order Model Updates

```typescript
interface IOrder {
  orderId: string;
  status: OrderStatus;
  
  // Tracking Information
  trackingEvents: Array<{
    status: string;
    description: string;
    location?: string;
    timestamp: Date;
  }>;
  
  courierName?: string;
  courierTrackingId?: string;
  courierTrackingUrl?: string;
  estimatedDelivery?: Date;
  
  // ... other fields
}
```

### Settings Model

```typescript
{
  orderNotifications: boolean; // Default: true
  // ... other settings
}
```

## API Integration

### Making Status Update Requests

**JavaScript/TypeScript Example:**

```typescript
const updateOrderStatus = async (
  orderId: string,
  status: string,
  trackingInfo?: {
    trackingId?: string;
    courierName?: string;
    courierTrackingUrl?: string;
  }
) => {
  const response = await fetch('/api/admin/orders/update-status', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId,
      status,
      trackingId: trackingInfo?.trackingId,
      courierName: trackingInfo?.courierName,
      courierTrackingUrl: trackingInfo?.courierTrackingUrl,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return response.json();
};
```

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Unauthorized" | No admin session | Log in to admin panel |
| "Missing required fields" | orderId or status not provided | Provide both fields |
| "Invalid status" | Status not in allowed list | Use valid status value |
| "Order not found" | Order ID doesn't exist | Verify order ID |
| "Internal server error" | Server error | Check server logs |

### Email Sending Failures

If email sending fails:
- Error is logged to console
- Order status is still updated
- Request returns success (email failure doesn't block status update)
- Admin can retry by updating status again

## Testing the System

### Manual Testing Steps

1. **Create a Test Order**
   - Place an order through the checkout process
   - Note the order ID

2. **Update Status from Admin**
   - Go to `/admin/orders`
   - Find the test order
   - Update status to "processing"
   - Verify success message appears

3. **Check Email**
   - Check customer email inbox
   - Verify email was received with correct status
   - Verify tracking information is included

4. **Test with Notifications Disabled**
   - Go to `/admin/settings`
   - Disable "Order Notifications"
   - Update order status again
   - Verify no email is sent

5. **Test All Status Transitions**
   - Test each status: confirmed → processing → shipped → delivered
   - Test cancellation flow
   - Test payment_failed status

## Troubleshooting

### Emails Not Sending

1. **Check Settings**
   - Verify `orderNotifications` is enabled in admin settings
   - Check `/api/settings` endpoint returns `orderNotifications: true`

2. **Check Email Configuration**
   - Verify Resend API key is set in `.env.local` or `.env.production`
   - Check email templates are properly formatted

3. **Check Order Data**
   - Verify order has valid `shippingAddress.email`
   - Verify order status is valid

4. **Check Logs**
   - Look for error messages in server console
   - Check Resend dashboard for failed sends

### Status Not Updating

1. **Check Admin Session**
   - Verify you're logged in to admin panel
   - Check browser cookies for `admin_session`

2. **Check Request**
   - Verify orderId is correct
   - Verify status is in valid list
   - Check network tab for request/response

3. **Check Database**
   - Verify MongoDB connection is working
   - Check order exists in database

## Performance Considerations

- Status updates are fast (< 100ms)
- Email sending is asynchronous (doesn't block response)
- Tracking events are appended to order (no full document rewrite)
- Settings are cached in memory (check on each request)

## Security

- All status updates require admin authentication
- Admin session is validated via cookies
- Email addresses are never exposed in API responses
- Tracking URLs are user-provided (validate before storing)

## Future Enhancements

Potential improvements:
- SMS notifications for order status
- Webhook notifications for third-party integrations
- Bulk status updates for multiple orders
- Scheduled status updates (e.g., auto-mark as delivered after X days)
- Customer notification preferences (email, SMS, push)
- Admin notification when order is delivered
- Automated status transitions based on courier API

## Related Documentation

- [Admin Settings Guide](./ADMIN_SETTINGS_GUIDE.md)
- [Coming Soon Features](./COMING_SOON_FEATURES_ACTIVATED.md)
- [Email Templates](./lib/email/templates.ts)
- [Order Model](./lib/db/models/Order.ts)
- [Settings Model](./lib/db/models/Settings.ts)
