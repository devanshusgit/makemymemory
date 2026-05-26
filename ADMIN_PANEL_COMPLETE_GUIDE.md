# Admin Panel - Complete Guide

## Overview
The admin panel is a comprehensive dashboard for managing all aspects of the Make My Memory e-commerce platform. Every user interaction is captured, stored in the backend, and accessible through the admin portal.

## Access
- **URL:** `https://yourdomain.com/admin/login`
- **Credentials:** Set via `ADMIN_PASSWORD` environment variable
- **Session:** Cookie-based authentication

## Admin Panel Structure

### 1. **Dashboard** (`/admin`)
- Overview of key metrics
- Recent orders
- Quick stats
- System health

### 2. **Submissions** (`/admin/submissions`) ⭐ NEW
**Unified view of ALL user submissions**

#### Features:
- **All-in-one dashboard** for contacts, reviews, orders, and signups
- **Real-time stats cards** showing counts for each type
- **Advanced filtering:**
  - By type: All, Contact, Review, Order, Signup
  - By status: All, Pending, Read, Processed
- **Quick actions:** View details, mark as read, process
- **Chronological sorting:** Newest first

#### What's Included:
1. **Contact Messages**
   - Name, email, phone, subject, message
   - Status: Pending → Read
   - Direct link to contact inbox

2. **Reviews**
   - Customer name, email, rating, review text
   - Status: Pending → Processed (approved/rejected)
   - Direct link to reviews management

3. **Orders**
   - Order ID, customer name, email
   - Order total, item count
   - Status: Confirmed → Processing → Shipped → Delivered
   - Direct link to order details

4. **User Signups** (Last 30 days)
   - New user registrations
   - Name, email, join date
   - Direct link to user management

#### Stats Display:
```
┌─────────┬─────────┬─────────┬─────────┬─────────┐
│ Contact │ Reviews │ Orders  │ Signups │ Pending │
│   12    │   8     │   45    │   23    │   5     │
└─────────┴─────────┴─────────┴─────────┴─────────┘
```

### 3. **Orders** (`/admin/orders`)
**Complete order management system**

#### Features:
- View all orders with filtering
- Order status management
- Shipping tracking
- Customer details
- **Customization data display** (NEW)

#### Order Details Page (`/admin/orders/[id]`):
- Customer information
- Shipping address
- Order items with **customization fields**
- Payment details
- Status timeline
- Update status
- Add tracking information

#### Customization Display:
```
Product: Custom Photo Frame
  Name: John Doe
  Date: 2026-01-15
  Time: 14:30
  Weight: 500g
Price: ₹999 × 1
```

### 4. **Products** (`/admin/products`)
**Product catalog management**

#### Features:
- Create/Edit/Delete products
- Upload images and videos
- Set pricing and discounts
- Manage inventory
- **Customization fields management** (NEW)
- Reorder products
- Category assignment

#### Customization Fields:
- Add dynamic fields to products
- Support for 6 field types:
  - Text
  - Textarea
  - Number
  - Date
  - Time
  - Select (dropdown)
- Set required/optional
- Reorder fields
- Preview on frontend

### 5. **Gallery** (`/admin/gallery`)
**Image gallery management**

#### Features:
- Upload gallery images
- Reorder images
- Delete images
- Bulk operations

### 6. **Contact** (`/admin/contact`)
**Contact form submissions**

#### Features:
- View all contact messages
- Filter: All / Unread / Read
- Mark as read/unread
- Delete messages
- Reply via email
- **Unread badge** in sidebar

#### Message Details:
- Name, email, phone
- Subject and message
- Timestamp
- Read status

### 7. **Reviews** (`/admin/reviews`)
**Customer review moderation**

#### Features:
- View all reviews
- Filter: All / Pending / Approved / Rejected
- Approve/Reject reviews
- Delete reviews
- View customer details
- See product association
- View uploaded media

#### Review Information:
- Customer name and email
- Star rating (1-5)
- Review title and content
- Product name
- Submission date
- Approval status

### 8. **Users** (`/admin/users`)
**User account management**

#### Features:
- View all registered users
- User details (name, email, join date)
- Account status
- Order history per user
- Delete users

### 9. **Policies** (`/admin/policies`)
**Legal pages management**

#### Features:
- Edit Privacy Policy
- Edit Terms of Service
- Edit Shipping Policy
- Edit Returns Policy
- Rich text editor
- Preview changes

### 10. **Analytics** (`/admin/analytics`)
**Business insights**

#### Features:
- Sales analytics
- Revenue charts
- Top products
- Customer insights
- Order trends

### 11. **Settings** (`/admin/settings`)
**System configuration**

#### Features:
- Site settings
- Email configuration
- Payment gateway settings
- Shipping settings
- Stats configuration

## Backend Integration

### Database Models

All user submissions are stored in MongoDB:

#### 1. **ContactMessage**
```typescript
{
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}
```

#### 2. **Review**
```typescript
{
  name: string;
  email: string;
  rating: number;
  title: string;
  content: string;
  product?: string;
  mediaUrls?: string[];
  approved: boolean;
  rejected: boolean;
  verified: boolean;
  createdAt: Date;
}
```

#### 3. **Order**
```typescript
{
  orderId: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  items: [{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    customization: Record<string, string>; // NEW: Object format
  }];
  shippingAddress: Address;
  total: number;
  trackingEvents: TrackingEvent[];
  createdAt: Date;
}
```

#### 4. **User**
```typescript
{
  name: string;
  email: string;
  password: string; // hashed
  isAdmin: boolean;
  createdAt: Date;
}
```

#### 5. **Product**
```typescript
{
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  customizationFields: [{
    id: string;
    label: string;
    type: FieldType;
    placeholder?: string;
    required: boolean;
    options?: string[];
    order: number;
  }];
  createdAt: Date;
}
```

### API Endpoints

#### Contact
- `GET /api/admin/contact` - Fetch all messages
- `PATCH /api/admin/contact/[id]` - Mark as read/unread
- `DELETE /api/admin/contact/[id]` - Delete message

#### Reviews
- `GET /api/admin/reviews` - Fetch all reviews
- `PATCH /api/admin/reviews/[id]` - Approve/reject
- `DELETE /api/admin/reviews/[id]` - Delete review

#### Orders
- `GET /api/admin/orders` - Fetch all orders
- `GET /api/admin/orders/[id]` - Fetch order details
- `PATCH /api/admin/orders/[id]` - Update status/tracking

#### Products
- `GET /api/admin/products` - Fetch all products
- `POST /api/admin/products` - Create product
- `PATCH /api/admin/products/[id]` - Update product
- `DELETE /api/admin/products/[id]` - Delete product
- `POST /api/admin/products/auto-generate-fields` - Bulk add fields

#### Users
- `GET /api/admin/users` - Fetch all users
- `PATCH /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user

## Email Notifications

Admin receives email notifications for:

1. **New Contact Message**
   - Sender details
   - Subject and message
   - Link to admin panel

2. **New Review Submitted**
   - Reviewer details
   - Rating and review text
   - Product name
   - Link to approve/reject

3. **New Order Placed**
   - Order ID and total
   - Customer details
   - Items ordered
   - Link to order details

4. **New Product Added**
   - Product details
   - Images
   - Customization fields count
   - Link to admin panel

5. **New User Signup**
   - User name and email
   - Join date
   - Link to user management

## User Flow → Admin Panel

### Contact Form Submission
```
User fills contact form
    ↓
POST /api/contact
    ↓
Saved to ContactMessage collection
    ↓
Email sent to admin
    ↓
Visible in /admin/contact
    ↓
Visible in /admin/submissions
    ↓
Admin marks as read
    ↓
Status updated in database
```

### Review Submission
```
User submits review
    ↓
POST /api/reviews
    ↓
Saved to Review collection (pending)
    ↓
Email sent to admin
    ↓
Visible in /admin/reviews (pending)
    ↓
Visible in /admin/submissions (pending)
    ↓
Admin approves/rejects
    ↓
Status updated
    ↓
If approved: Shows on frontend
```

### Order Placement
```
User completes checkout
    ↓
POST /api/orders
    ↓
Saved to Order collection
    ↓
Email sent to admin & customer
    ↓
Visible in /admin/orders
    ↓
Visible in /admin/submissions
    ↓
Admin updates status
    ↓
Customer receives status email
    ↓
Tracking info added
    ↓
Customer can track order
```

### Product with Customization
```
Admin creates product with fields
    ↓
Saved to Product collection
    ↓
Email sent to admin (confirmation)
    ↓
Frontend fetches product
    ↓
DynamicCustomizationFields renders
    ↓
User fills customization
    ↓
Added to cart with customization
    ↓
Order placed with customization
    ↓
Admin sees customization in order details
```

## Customization Data Flow

### Frontend → Backend → Admin

1. **Product Page:**
   - User sees dynamic fields based on `product.customizationFields`
   - Fills in: Name, Date, Time, etc.

2. **Cart:**
   - Customization stored with cart item
   - Displayed in cart drawer and cart page

3. **Checkout:**
   - Customization included in order payload
   - Sent to `/api/orders`

4. **Order Storage:**
   ```json
   {
     "items": [{
       "productId": "...",
       "name": "Custom Frame",
       "customization": {
         "name": "John Doe",
         "date": "2026-01-15",
         "time": "14:30"
       }
     }]
   }
   ```

5. **Admin View:**
   - Order details show customization as key-value pairs
   - Easy to read and process
   - Can be exported/printed

## Security

### Authentication
- Cookie-based session
- Password comparison with env variable
- No JWT complexity needed

### Authorization
- All admin routes check `admin_session` cookie
- Unauthorized requests return 401
- Frontend redirects to login

### Data Protection
- Passwords hashed with bcrypt
- Email addresses lowercase
- Input validation on all forms
- SQL injection prevention (MongoDB)

## Performance

### Optimizations
- Database indexes on frequently queried fields
- Lean queries (no Mongoose overhead)
- Pagination for large lists
- Image optimization
- Lazy loading

### Caching
- Static pages cached
- API responses cached where appropriate
- Browser caching for assets

## Troubleshooting

### Admin Can't Login
1. Check `ADMIN_PASSWORD` in environment variables
2. Clear browser cookies
3. Check server logs for errors

### Submissions Not Showing
1. Verify database connection
2. Check API endpoints are working
3. Look for console errors
4. Verify data exists in MongoDB

### Customization Not Displaying
1. Check Order model has `customization` field
2. Verify data format (should be object, not string)
3. Check AdminOrderDetailClient component
4. Look for type errors in console

### Email Notifications Not Sending
1. Verify `RESEND_API_KEY` is set
2. Check `ADMIN_EMAIL` is configured
3. Look for email errors in server logs
4. Verify Resend API key is valid

## Best Practices

### For Admins
1. **Check submissions daily** - Use `/admin/submissions` for quick overview
2. **Respond to contacts within 24 hours**
3. **Approve/reject reviews promptly**
4. **Update order status regularly**
5. **Keep product customization fields updated**

### For Developers
1. **Always validate input** on both frontend and backend
2. **Use TypeScript types** for type safety
3. **Handle errors gracefully** with user-friendly messages
4. **Log important events** for debugging
5. **Test email notifications** before deploying

## Future Enhancements

- [ ] Bulk actions (approve multiple reviews, delete multiple contacts)
- [ ] Export data to CSV/Excel
- [ ] Advanced analytics dashboard
- [ ] Email templates editor
- [ ] Automated responses
- [ ] Multi-admin support with roles
- [ ] Activity log/audit trail
- [ ] Real-time notifications (WebSocket)
- [ ] Mobile app for admin
- [ ] Voice notes for orders

---

**Status:** ✅ Fully Functional
**Last Updated:** May 26, 2026
**Version:** 3.0.0
