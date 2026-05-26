# Email Notification System - Make My Memory

## Setup Instructions

### 1. Environment Variables

Add these to your `.env.local` (development) and Vercel environment variables (production):

```env
# Resend API Key
RESEND_API_KEY=re_EwTRupNX_NELvnF3av9zqgpW4TcQNNsrU

# Admin Email (receives notifications)
ADMIN_EMAIL=your-admin-email@example.com
```

### 2. Install Dependencies

```bash
npm install resend
```

### 3. Email Types

#### USER → ADMIN Notifications
- ✅ New order placed
- ✅ New contact form submission
- ✅ New user signup
- ✅ New review submitted

#### ADMIN → USER Notifications
- ✅ Order confirmation (immediately after order)
- ✅ Order processing started
- ✅ Order shipped (with tracking)
- ✅ Order delivered
- ✅ Order cancelled (with reason)
- ✅ Welcome email (after signup)
- ✅ Password reset email
- ✅ Coupon email (WELCOME15 - 15% off, 30 days)

### 4. Email Templates

All templates include:
- Gold (#C9A84C) header with "Make My Memory" branding
- Cream (#FAF8F4) background
- Ink (#1A1A1A) text
- Mira Road, Thane address in footer
- "Crafted for Lifetime" tagline
- Unsubscribe link

### 5. Trigger Points

| Event | File | Function |
|-------|------|----------|
| Order created | `/api/orders/route.ts` | POST - sends confirmation + admin notification |
| Order status updated | `/api/orders/[id]/route.ts` | PATCH - sends status email based on new status |
| User signup | `/api/auth/signup/route.ts` | POST - sends welcome email + admin notification |
| Contact form | `/api/contact/route.ts` | POST - sends admin notification |
| Review submitted | `/api/reviews/route.ts` | POST - sends admin notification |
| Password reset | `/api/auth/forgot-password/route.ts` | POST - sends reset link |
| First order complete | `/api/orders/[id]/route.ts` | PATCH (delivered) - sends coupon |

### 6. Testing

Test emails in development:
```bash
npm run dev
```

Then trigger events:
1. Create an order → Check for confirmation email
2. Update order status → Check for status email
3. Submit contact form → Check admin email
4. Create account → Check welcome email

### 7. Production Deployment

1. Add environment variables to Vercel:
   - `RESEND_API_KEY`
   - `ADMIN_EMAIL`

2. Deploy:
```bash
git push origin main
```

3. Verify emails are being sent by checking Resend dashboard

### 8. Resend Dashboard

Monitor email delivery at: https://resend.com/emails

- View sent emails
- Check delivery status
- Monitor bounce rates
- View email analytics

## Email Functions

All email functions are in `/lib/email/`:
- `resend.ts` - Resend client and send function
- `templates.ts` - All email HTML templates

## Notes

- Emails are sent asynchronously (don't block API responses)
- Failed emails are logged but don't fail the request
- All emails use responsive HTML templates
- Unsubscribe functionality can be added later
