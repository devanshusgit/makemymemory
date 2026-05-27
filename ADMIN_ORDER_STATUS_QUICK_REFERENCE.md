# Admin Order Status Update - Quick Reference

## Quick Start

### How to Update an Order Status

1. Go to **Admin Panel** → **Orders**
2. Click on the order you want to update
3. Scroll to **"Update Order"** section
4. Select new status from dropdown
5. (Optional) Add courier details:
   - **Courier Name**: e.g., "Delhivery", "BlueDart", "FedEx"
   - **Tracking ID**: e.g., "AWB123456789"
   - **Tracking URL**: e.g., "https://track.delhivery.com/..."
6. Click **"Save Changes"**
7. Wait for success message: **"✓ Saved successfully"**

## Status Guide

| Status | When to Use | What Customer Sees |
|--------|------------|-------------------|
| **confirmed** | Order just placed | Order confirmed, payment received |
| **processing** | You're preparing the order | Order is being prepared |
| **shipped** | Order left your warehouse | Order on its way with tracking info |
| **out_for_delivery** | Order with delivery partner | Order arriving today/tomorrow |
| **delivered** | Order reached customer | Order delivered, invite to review |
| **cancelled** | Order cancelled | Cancellation reason, refund info |
| **payment_failed** | Payment didn't go through | Payment failed, retry instructions |

## Courier Names (Examples)

- Delhivery
- BlueDart
- FedEx
- DPL
- Ecom Express
- DTDC
- Gati
- XpressBees
- Shiprocket

## Tracking ID Format

- **Delhivery**: AWB followed by numbers (e.g., AWB123456789)
- **BlueDart**: C-number (e.g., C123456789)
- **FedEx**: 12-digit number (e.g., 123456789012)
- **Others**: Check courier website for format

## Tracking URL Format

- **Delhivery**: `https://track.delhivery.com/[tracking-id]`
- **BlueDart**: `https://www.bluedart.com/tracking/[tracking-id]`
- **FedEx**: `https://tracking.fedex.com/en/tracking/[tracking-id]`

## What Happens When You Update Status

✅ **Automatically:**
- Order status updates in database
- Tracking event is recorded with timestamp
- Email is sent to customer (if notifications enabled)
- Customer can see update in their account

## Email Notifications

### When Emails Are Sent

| Status | Email Sent? | Email Content |
|--------|------------|---------------|
| confirmed | ❌ No | (sent at checkout) |
| processing | ✅ Yes | "We're preparing your order" |
| shipped | ✅ Yes | Tracking info + estimated delivery |
| out_for_delivery | ✅ Yes | "Order arriving today/tomorrow" |
| delivered | ✅ Yes | "Order delivered, leave a review" |
| cancelled | ✅ Yes | Cancellation reason + refund info |
| payment_failed | ✅ Yes | "Payment failed, please retry" |

### Disable Email Notifications

1. Go to **Admin Panel** → **Settings**
2. Find **"Order Notifications"** toggle
3. Turn it **OFF**
4. Now status updates won't send emails (but status still updates)

## Common Workflows

### Workflow 1: Standard Order Fulfillment

```
confirmed → processing → shipped → out_for_delivery → delivered
```

**Timeline:**
1. Order placed → Status: confirmed
2. Start preparing → Status: processing
3. Hand to courier → Status: shipped (add tracking info)
4. Courier picks up → Status: out_for_delivery
5. Delivered → Status: delivered

### Workflow 2: Order Cancellation

```
confirmed → cancelled
```

**Steps:**
1. Select status: **cancelled**
2. Click "Save Changes"
3. Customer receives cancellation email with refund info

### Workflow 3: Payment Failed

```
confirmed → payment_failed
```

**Steps:**
1. Select status: **payment_failed**
2. Click "Save Changes"
3. Customer receives email to retry payment

## Tips & Best Practices

✅ **DO:**
- Update status as soon as order moves to next stage
- Add tracking info when shipping (helps customer track)
- Use correct courier name (customer recognizes it)
- Check tracking URL works before saving
- Disable notifications only if needed (e.g., testing)

❌ **DON'T:**
- Skip status updates (customer won't know order status)
- Use wrong courier name (confuses customer)
- Leave tracking URL blank if you have it
- Update status multiple times for same stage
- Forget to enable notifications after testing

## Tracking History

Every order shows **"Tracking History"** at bottom:
- Lists all status updates in reverse chronological order
- Shows timestamp for each update
- Shows location (if provided)
- Helps you see order journey

## Troubleshooting

### "Save Changes" button doesn't work
- Check you're logged in to admin panel
- Refresh page and try again
- Check browser console for errors

### Email not received by customer
- Check "Order Notifications" is enabled in Settings
- Verify customer email is correct in order
- Check spam/junk folder
- Wait a few minutes (email delivery can be slow)

### Tracking info not showing in email
- Make sure you filled in tracking ID and courier name
- Check tracking URL is valid
- Try updating status again

### Can't find order
- Use search/filter on orders page
- Check order ID is correct
- Verify order exists in database

## Support

For issues or questions:
1. Check this guide first
2. Check [ORDER_STATUS_NOTIFICATIONS_GUIDE.md](./ORDER_STATUS_NOTIFICATIONS_GUIDE.md) for detailed info
3. Check server logs for errors
4. Contact support

## Keyboard Shortcuts

- **Tab**: Move between fields
- **Enter**: Save changes (when focused on button)
- **Escape**: Close any open modals

## Mobile Admin

The admin panel is mobile-responsive:
- Status dropdown works on mobile
- Tracking fields are touch-friendly
- Save button is easy to tap
- Tracking history scrolls horizontally if needed

---

**Last Updated**: May 28, 2026
**Version**: 1.0
