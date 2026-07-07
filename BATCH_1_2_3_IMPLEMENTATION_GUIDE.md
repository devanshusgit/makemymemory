# Implementation Guide: Batch 1, 2, 3 Features

## STATUS: Batch 1 - 50% Complete
✅ **COMPLETED**:
- Variant surcharges now stored in CartItem
- calcSubtotal() includes surcharges in calculation
- ProductDetail passes surcharge data to cart
- Build verified passing

⏳ **IN PROGRESS / REMAINING**:

### Fix 2: Build Order Confirmation Page

**Files to modify**:
- `components/checkout/CheckoutClient.tsx` - Lines 380-445
- `app/api/orders/route.ts` - Return orderId in response
- `components/checkout/SuccessClient.tsx` - Add Order ID, recap, invoice

**Changes needed**:

1. **Update order creation endpoints to return orderId**:
   ```typescript
   // In /api/orders/route.ts POST handler
   // After order.save():
   return NextResponse.json({ 
     success: true, 
     orderId: order.orderId,  // Add this
     orderData: order.toObject() // Add this for displaying recap
   }, { status: 201 });
   
   // In /api/payment/cod/route.ts 
   // Return same format
   ```

2. **Update CheckoutClient to capture and pass order ID**:
   ```typescript
   // In onSubmit around line 430:
   const orderResponse = await createOrder({...});
   
   // Then redirect with order ID:
   router.push(`/checkout/success?method=${paymentMethod}&orderId=${orderResponse.orderId}`);
   ```

3. **Enhanced SuccessClient with**:
   - Order ID display (large, copyable)
   - Order recap section:
     - Items list with prices and surcharges
     - Subtotal, coupon discount, total
     - Shipping address
     - Payment method details
   - Invoice download button (generates PDF receipt)
   - Tracking link with order ID pre-filled
   - Email confirmation status badge
   - "View Full Order" button linking to /track?orderId=XXX

**Components to create**:
- `components/checkout/OrderRecap.tsx` - Display order details
- `components/checkout/InvoiceDownloadButton.tsx` - Generate PDF invoice

---

### Fix 3: Fix COD Messaging & Logic

**Issue**: COD messaging is correct but backend validation missing

**Changes needed**:

1. **Add COD limit validation in `/api/payment/cod/route.ts`**:
   ```typescript
   const COD_MAX_AMOUNT = 5000;
   
   if (total > COD_MAX_AMOUNT) {
     return NextResponse.json({
       error: `COD not available for orders above ₹${COD_MAX_AMOUNT}. Please use Razorpay.`,
       success: false
     }, { status: 400 });
   }
   ```

2. **Frontend validation in CheckoutClient**:
   ```typescript
   // In COD PaymentCard expanded section:
   const isCODEligible = finalTotal <= 5000;
   
   if (!isCODEligible) {
     // Show message: "COD not available for orders above ₹5,000"
     // Disable selection or show warning
   }
   ```

3. **Email messaging already correct** in `/lib/email/resend.ts`
   - Shows "Pay full amount in cash on delivery"
   - Shows "₹{total} due on delivery"
   - Already accurate

---

## BATCH 2: High Priority

### Feature 1: Auto-fill Checkout with Logged-in User Data

**Status**: ✅ DONE! 
- CheckoutClient already fetches `/api/user/profile`
- Form auto-fills with name, email, phone
- Default address loads and pre-selects
- No additional work needed

**Verification**: Lines 264-290 in CheckoutClient.tsx

### Feature 2: Fix Phone Validation

**Files to modify**:
- `components/checkout/CheckoutClient.tsx` - Lines 540-565

**Current**: Inline validation with regex only
**Needed**:
- Show error message inline (currently hidden until blur)
- Support formats: 9876543210, +919876543210, 91-9876543210
- Display error message below field in red

**Implementation**:
```typescript
// Update phone field validation:
const phoneRegex = /^(\+91|91)?[-\s]?[6-9]\d{9}$/;
const cleanPhone = (p: string) => p.replace(/\D/g, '').slice(-10);

// In register:
phone: {
  required: "Phone is required",
  validate: (val) => phoneRegex.test(val) ? true : "Invalid phone number format",
}

// Show error inline with red text and icon
```

### Feature 3: Auto-fill Tracking Order ID from URL

**Files to modify**:
- `components/track/TrackClient.tsx` - Lines 1-100

**Current**: User must manually enter Order ID and contact
**Needed**: Check URL params for `orderId` and pre-fill the form

**Implementation**:
```typescript
// Add at top of TrackClient:
const searchParams = useSearchParams();
const orderId Param = searchParams.get('orderId');

// In useState:
const [orderId, setOrderId] = useState(orderIdParam || "");

// Form will auto-populate from URL
```

---

## BATCH 3: Polish

### Feature 1: Fix Coming Soon Banner Z-Index

**File**: `components/shop/ShopClient.tsx` - Line 165

**Issue**: Z-index may conflict with other elements

**Fix**:
```typescript
// Change from z-20 to z-50:
<div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50">
```

### Feature 2: Remove Duplicate Product Name in Order Detail

**File**: `app/admin/orders/[id]/page.tsx` or similar order detail view

**Issue**: Product name displayed twice in order recap/email

**Fix**: Review email template and admin order page, remove redundant product name field

### Feature 3: Add Category Filter Chips to Shop

**Files**:
- `components/shop/ShopClient.tsx` - Lines 125-200
- `components/shop/ProductCard.tsx` if needed

**Current**: Category cards but no category filter chips during browsing
**Needed**: Add horizontal scrollable chip list showing active categories

**Implementation**:
```typescript
// Add above product grid:
{/* Category filter chips */}
<div className="flex gap-2 overflow-x-auto pb-4 mb-6">
  <button 
    onClick={() => setActive(null)}
    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
      ${!active ? 'bg-ink text-canvas' : 'bg-stone-200 text-ink'}`}>
    All Products
  </button>
  {categories.map((cat) => (
    <button key={cat.id}
      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
        ${active === cat.id ? 'bg-ink text-canvas' : 'bg-stone-200 text-ink'}`}
      onClick={() => setActive(cat.id)}>
      {cat.title} ({cat.productCount})
    </button>
  ))}
</div>
```

---

## NEW FEATURE: Order History & Cancel Order

This is the **major feature** for "ready to sell" status.

### Feature: Order History Page

**Files to create**:
- `app/orders/page.tsx` - Main order history page
- `components/orders/OrderHistoryClient.tsx` - List component
- `components/orders/OrderCard.tsx` - Individual order card
- `app/api/user/orders/route.ts` - Fetch user orders (likely exists, check)

**Functionality**:
1. **Fetch user's orders**:
   - From database where user ID matches
   - Sort by creation date (newest first)
   - Show: Order ID, date, total, status badge

2. **Order Status Badge**:
   - Confirmed: Blue
   - Processing: Orange
   - Shipped: Blue
   - Out for Delivery: Purple
   - Delivered: Green
   - Cancelled: Red

3. **Order Card Actions**:
   - **View Details** → Link to `/track?orderId=XXX`
   - **Download Invoice** → Generate PDF
   - **Track Order** → Opens tracking modal
   - **Cancel Order** → If status is "confirmed" or "processing"

### Feature: Cancel Order

**Files to modify**:
- `app/api/user/orders/[id]/cancel/route.ts` - Create new endpoint
- `components/orders/OrderHistoryClient.tsx` - Add cancel UI

**Functionality**:
1. **Check cancellation eligibility**:
   - Only "confirmed" or "processing" orders
   - Not shipped/out-for-delivery/delivered
   - Show "Cannot cancel" if not eligible

2. **Cancellation flow**:
   ```
   User clicks Cancel
   ↓
   Show confirmation modal: "Are you sure? You'll receive a refund in 5-7 business days."
   ↓
   User confirms
   ↓
   Call /api/user/orders/[id]/cancel
   ↓
   Backend: Update order status to "cancelled"
   ↓
   Backend: Record refund request
   ↓
   Backend: Send cancellation email
   ↓
   Frontend: Show success message
   ↓
   Order status updates to "Cancelled" with red badge
   ```

3. **Refund logic**:
   - Full refund for original payment method
   - Razorpay: Use refund API
   - PayPal: Use refund API
   - COD: Mark as "refund pending" (no actual payment to reverse)
   - Coupon: If used, mark as unused so customer can use again

4. **Email notification**:
   - Send cancellation confirmation
   - Include refund details
   - Provide support contact for questions

---

## Implementation Sequence (Priority Order)

### Phase 1: Completion (Next 1 hour)
1. ✅ Variant surcharges (DONE)
2. Order confirmation page with Order ID + recap
3. COD validation & messaging
4. Push changes to GitHub

### Phase 2: Quality (Next 1-2 hours)
5. Phone validation inline errors
6. Auto-fill tracking from URL
7. Coming Soon z-index
8. Push to GitHub

### Phase 3: Features (Next 2-3 hours)
9. Order history page
10. Cancel order functionality
11. Invoice download
12. Category filter chips
13. Polish and testing
14. Push to GitHub

---

## Testing Checklist

### Batch 1
- [ ] Add product with variants, verify surcharges in cart
- [ ] Check cart total includes surcharges
- [ ] Complete Razorpay order, see Order ID on success page
- [ ] Complete COD order, see COD messaging and total
- [ ] Try COD for order > ₹5,000, see error message

### Batch 2
- [ ] Login, go to checkout, form auto-filled with name/email/phone
- [ ] Edit phone field, see error inline (not just on blur)
- [ ] Go to /track?orderId=TEST-123, Order ID pre-filled
- [ ] Search order successfully

### Batch 3
- [ ] Coming Soon banner visible on shop
- [ ] Shop page shows category chips
- [ ] Remove duplicate product name from email/order detail
- [ ] [ ] Go to /orders, see order history list
- [ ] Cancel a confirmed order, see confirmation modal
- [ ] Cancelled order shows red badge
- [ ] Receive cancellation email

---

## Database Queries Needed

### Check if orders API exists
```bash
# Check if endpoint returns orders:
curl http://localhost:3000/api/user/orders
```

### Check order schema for cancellation support
```bash
# Check if Order model has cancellation fields:
# - cancelledAt: Date
# - cancellationReason: String
# - refundStatus: "pending" | "completed" | "failed"
```

---

## Git Commits Strategy

Each feature should be committed separately:
1. `feat: Order confirmation page with recap and invoice`
2. `fix: COD validation and messaging`
3. `fix: Phone validation inline errors`
4. `feat: Auto-fill tracking order ID from URL`
5. `fix: Coming Soon banner z-index`
6. `fix: Remove duplicate product names`
7. `feat: Category filter chips on shop`
8. `feat: Order history page`
9. `feat: Cancel order functionality`
10. `feat: Invoice PDF download`

---

## Ready to Sell Checklist

- [x] Product variants with surcharges
- [x] Add to cart functionality
- [x] Checkout form auto-fill
- [x] Multiple payment methods (Razorpay, PayPal, COD)
- [ ] Order confirmation with receipt
- [x] Order tracking
- [ ] Order history
- [ ] Cancel order
- [ ] Email confirmations
- [ ] Product search & filter
- [ ] Coupon system
- [ ] Wishlist
- [ ] User reviews
- [ ] Admin dashboard

---

## Next Steps

1. Implement order confirmation page (Fix 2)
2. Add COD validation (Fix 3)
3. Push Batch 1 to GitHub
4. Continue with Batch 2
5. Complete with Batch 3

---

**Estimated time to completion**: 4-5 hours (all batches)
**Build status**: Currently passing (76/76 routes)
**Ready to deploy**: After Batch 1 completion
