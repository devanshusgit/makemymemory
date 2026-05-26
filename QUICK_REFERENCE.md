# Quick Reference Guide

**Last Updated**: May 26, 2026  
**Build Status**: ✅ Success

---

## 🚀 QUICK START

### Run Development Server
```bash
npm run dev
```
Then open http://localhost:3000

### Run Build
```bash
npm run build
```

### Run Tests
```bash
npm run test
```

---

## 📍 KEY PAGES

### User Pages
- **Shop**: `/shop` - Browse products
- **Product Detail**: `/shop/[slug]` - View product with customization
- **Cart**: `/cart` - View cart items
- **Checkout**: `/checkout` - Complete purchase
- **Account**: `/account` - User account

### Admin Pages
- **Dashboard**: `/admin` - Admin overview
- **Submissions**: `/admin/submissions` - All user submissions ⭐
- **Products**: `/admin/products` - Manage products
- **Orders**: `/admin/orders` - Manage orders
- **Contact**: `/admin/contact` - Contact messages
- **Reviews**: `/admin/reviews` - Product reviews
- **Users**: `/admin/users` - User management
- **Gallery**: `/admin/gallery` - Image gallery
- **Analytics**: `/admin/analytics` - Analytics

---

## 🔧 KEY FEATURES

### Product Customization
- **Location**: Product detail page (`/shop/[slug]`)
- **Component**: `DynamicCustomizationFields.tsx`
- **Field Types**: text, date, time, number, textarea, select
- **Validation**: Required fields validated before adding to cart

### Add to Cart Button
- **Location**: Product detail page
- **Style**: Full-width, matches "Buy it now" button
- **Feedback**: Shows "Added to Cart ✓" for 2 seconds
- **Validation**: Checks required customization fields

### Admin Submissions Dashboard
- **Location**: `/admin/submissions`
- **Shows**: Contact, Reviews, Orders, Signups
- **Filter**: By type and status
- **Stats**: Shows counts for each type

### Cart Management
- **Storage**: localStorage (persisted)
- **Customization**: Stored as object `Record<string, string>`
- **Uniqueness**: Same product + different customization = separate items
- **Display**: Shows customization details in cart

---

## 📊 DATA STRUCTURES

### Product Customization Fields
```typescript
customizationFields: Array<{
  id: string;
  label: string;
  type: "text" | "date" | "time" | "number" | "textarea" | "select";
  placeholder?: string;
  required: boolean;
  options?: string[];
  order: number;
}>
```

### Cart Item
```typescript
interface CartItem {
  product: Product;
  quantity: number;
  customization?: Record<string, string>;
}
```

### Order Item
```typescript
{
  productId: string;
  name: string;
  price: number;
  quantity: number;
  customization: Record<string, string> | string; // Supports both
}
```

---

## 🔌 API ENDPOINTS

### Products
- `GET /api/products` - Get all products
- `POST /api/admin/products` - Create product
- `PATCH /api/admin/products/[id]` - Update product
- `DELETE /api/admin/products/[id]` - Delete product
- `POST /api/admin/products/auto-generate-fields` - Auto-generate fields

### Orders
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/orders/[id]` - Get order details
- `PATCH /api/admin/orders/[id]` - Update order

### Submissions
- `GET /api/admin/contact` - Get contact messages
- `GET /api/admin/reviews` - Get reviews
- `GET /api/admin/users` - Get users

---

## 🎨 STYLING COLORS

- **Primary**: `#C9A84C` (Gold)
- **Dark**: `#1A1A1A` (Black)
- **Light**: `#FAF8F4` (Cream)
- **Text**: `#6B6560` (Brown)
- **Border**: `#E8D5A3` (Light Gold)

---

## 📝 ENVIRONMENT VARIABLES

### Required
```
MONGODB_URI=<connection-string>
RESEND_API_KEY=<api-key>
ADMIN_EMAIL=admin@makemymemory.in
```

### Optional
```
NOTIFY_USERS_NEW_PRODUCTS=false
```

---

## 🐛 TROUBLESHOOTING

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### MongoDB Connection Error
- Check `MONGODB_URI` in `.env.local`
- Ensure MongoDB is running
- Verify network access

### Email Not Sending
- Check `RESEND_API_KEY` is valid
- Verify `ADMIN_EMAIL` is correct
- Check Resend dashboard for errors

### Cart Not Persisting
- Check browser localStorage is enabled
- Clear localStorage and try again
- Check browser console for errors

---

## 📂 PROJECT STRUCTURE

```
make-my-memory/
├── app/
│   ├── admin/              # Admin pages
│   ├── api/                # API routes
│   └── [pages]/            # User pages
├── components/
│   ├── admin/              # Admin components
│   ├── shop/               # Shop components
│   ├── cart/               # Cart components
│   └── home/               # Home components
├── lib/
│   ├── db/                 # Database models
│   ├── context/            # React context
│   ├── email/              # Email templates
│   └── types/              # TypeScript types
└── public/                 # Static files
```

---

## 🔐 SECURITY NOTES

- API keys stored in environment variables
- Admin routes protected with authentication
- Sensitive data not logged
- Input validation on all forms
- CORS properly configured

---

## 📈 PERFORMANCE

- Build time: ~30-60 seconds
- Pages generated: 72/72
- Bundle size: Optimized
- No runtime errors

---

## 🎯 COMMON TASKS

### Add New Customization Field Type
1. Update `Product.ts` model
2. Update `DynamicCustomizationFields.tsx`
3. Update type definitions in `types/index.ts`

### Add New Admin Page
1. Create page in `app/admin/[page]/page.tsx`
2. Add link to `AdminSidebar.tsx`
3. Create API route if needed

### Add New Email Template
1. Create template in `lib/email/templates.ts`
2. Add to Resend service in `lib/email/resend.ts`
3. Call from API route

### Modify Cart Logic
1. Update `CartContext.tsx`
2. Update `CartItem` type in `types/index.ts`
3. Update components using cart

---

## 📞 SUPPORT

### Documentation Files
- `CURRENT_STATUS_SUMMARY.md` - Current status
- `IMPLEMENTATION_VERIFICATION.md` - Detailed verification
- `CONTEXT_TRANSFER_SUMMARY.md` - What was done
- `HOW_TO_USE_CUSTOMIZATION_FIELDS.md` - Customization guide
- `ADMIN_PANEL_COMPLETE_GUIDE.md` - Admin guide

### Key Contacts
- Admin Email: `admin@makemymemory.in`
- Resend Support: https://resend.com/support

---

## ✅ VERIFICATION

- [x] Build succeeds
- [x] No TypeScript errors
- [x] All features working
- [x] Ready for testing
- [x] Ready for deployment

---

**Status**: ✅ READY TO USE

**Last Verified**: May 26, 2026  
**Build Status**: Success (Exit Code 0)
