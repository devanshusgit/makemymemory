# Remaining Fixes to Implement

## ✅ COMPLETED FIXES (1-5)
- FIX 1: Signup page with phone field, offer text, Sign Up button
- FIX 2: Navbar layout with logo + brand name
- FIX 3: Mobile number sizes in AnimatedStats
- FIX 4: Removed Read Reviews button
- FIX 5: Removed WhatsApp from footer

---

## ⏳ REMAINING FIXES (6-18)

### FIX 6: COUPON CODE — ADMIN + USER
**Status**: Partially complete (system exists, needs verification)

**Admin (/admin/coupons)**:
- ✅ Coupon creation API exists
- ✅ List all coupons with code, type, value, status, uses
- ✅ Toggle active/inactive per coupon
- TODO: Seed default coupons if none exist: COMBO20 (20% off), WELCOME15 (15% off)

**Checkout (user side)**:
- ✅ CouponInput component exists
- ✅ Apply button calls /api/coupons/validate
- ✅ Shows green tick and discount line item on valid
- ✅ Shows red error on invalid
- ✅ Updates total in real-time
- ✅ Passes couponCode + discountAmount to order creation

**API (/api/coupons/validate)**:
- ✅ Checks: code exists, isActive=true, not expired, usedCount < maxUses
- ✅ Checks minOrderValue met
- ✅ For WELCOME15: checks user has exactly 1 previous order
- ✅ Returns: { valid, discountAmount, message }

**Action**: Verify coupon system works end-to-end, seed default coupons

---

### FIX 7: PRODUCT UPLOAD — NOT WORKING
**Status**: Needs debugging

**Issues to fix**:
- Debug why new product not saving
- Check: all required fields being sent correctly
- Check: Cloudinary upload completing before product save
- Add proper error messages in UI if upload fails
- Fix image upload: ensure Cloudinary URL saved in images[] array
- After save: refresh product list automatically
- Console.log each step for debugging

**Files to check**:
- `app/admin/products/page.tsx`
- `/api/admin/products/route.ts`
- `components/admin/ProductFileUploader.tsx`

---

### FIX 8: OUT OF STOCK — ADMIN + USER
**Status**: Needs implementation

**Admin product form**:
- Add "Stock Status" toggle: In Stock / Out of Stock
- Save as: inStock: boolean in Product model

**User product page**:
- If inStock = false:
  - Show red badge "Out of Stock" on product card
  - Disable "Add to Cart" button — show "Out of Stock" instead
  - Disable "Buy it Now" button
  - Gray out the button with cursor-not-allowed

**Shop page product cards**:
- Show "Out of Stock" badge on card if inStock = false

**Files to update**:
- `lib/db/models/Product.ts` (already has inStock field)
- `app/admin/products/page.tsx`
- `components/shop/ProductDetail.tsx`
- `components/shop/ProductCard.tsx`

---

### FIX 9: SIGNUP — REQUIRED FIELDS
**Status**: ✅ COMPLETED
- ✅ Signup form fields: Full Name, Email, Phone (10 digit), Password
- ✅ All required, validate before submit
- ✅ Save phone number in User model
- ✅ Phone: validate Indian format (10 digits, starts 6-9)

---

### FIX 10: CHECKOUT — ADDRESS + CONTACT EDIT
**Status**: Needs implementation

**Checkout form**:
- Show address form: Full Name, Phone, Address Line 1, Address Line 2, City, State, Pincode
- Pre-fill from user profile if available
- Add "Edit Contact Details" button → opens inline edit form
- User can update: name, phone, email for this order
- Save updated details to order (not necessarily to user profile)
- Validate: pincode 6 digits, phone 10 digits

**Files to update**:
- `components/checkout/CheckoutClient.tsx`

---

### FIX 11: REVIEWS TOGGLE — FIX
**Status**: Needs verification

**Admin Settings**:
- Fix Reviews Active toggle — currently not saving/applying
- On toggle: PATCH /api/settings with { reviewsActive: boolean }
- Save to MongoDB Settings collection

**Reviews page**:
- Fetch settings on load, show/hide based on reviewsActive
- If reviewsActive = false: show "Coming Soon" — no reviews shown
- If reviewsActive = true: show all reviews

**Files to check**:
- `app/admin/settings/page.tsx`
- `/api/admin/settings/toggle/route.ts`
- `app/reviews/page.tsx`

---

### FIX 12: MAINTENANCE MODE
**Status**: Needs implementation

**Admin Settings**:
- Add Maintenance Mode toggle in /admin/settings
- Save to MongoDB: { maintenanceMode: boolean }

**Middleware**:
- In middleware.ts: check maintenanceMode from DB/env
- If ON: redirect ALL routes (except /admin/*) to /maintenance page

**Maintenance Page** (/maintenance):
- Full screen, cream background
- Gold Make My Memory logo
- Heading (Cormorant Garamond): "We're Crafting Something Beautiful"
- Subtext (DM Sans): "Our store is currently undergoing scheduled maintenance to bring you an even better experience. We'll be back shortly with new memories to cherish."
- Gold animated dots or spinner
- "Expected back soon" text
- Contact: hello@makemymemory.in
- WhatsApp button

**Files to create/update**:
- `app/maintenance/page.tsx` (create)
- `middleware.ts` (update)
- `app/admin/settings/page.tsx` (add toggle)
- `/api/admin/settings/toggle/route.ts` (add maintenanceMode)

---

### FIX 13: USER SETTINGS — FIX
**Status**: Needs debugging

**Profile Update**:
- Fix profile update (name, phone) — currently failing
- Fix password change — old password verify, new password save
- Add proper success/error toast messages
- Save to MongoDB User model on submit
- Phone field: 10 digit Indian format

**Files to check**:
- `app/settings/page.tsx`
- `/api/user/settings/route.ts` (or similar)

---

### FIX 14: CHECKOUT BILLING — CLEAN PRICING
**Status**: Needs implementation

**Checkout component**:
- Remove any automatic delivery/shipping charges
- Show clean price breakdown:
  - Subtotal: ₹XXXX
  - Discount (if coupon): -₹XXX
  - COD Charge (only if COD selected): +₹150
  - Total: ₹XXXX
- No hidden charges
- "Free Delivery" text if no delivery charge
- Prepaid orders: no extra charge
- COD orders: +₹150 clearly shown

**Files to update**:
- `components/checkout/CheckoutClient.tsx`

---

### FIX 15: CATEGORY EMPTY + 3D CASTING
**Status**: Needs implementation

**Shop page**:
- If a category has 0 products: still show category card with "Coming Soon" overlay
- 3D Casting category: always show "Coming Soon" badge
- On click 3D Casting: show toast "Coming Soon! Stay tuned." — don't navigate

**Footer**:
- Check footer links for 3D Casting — if link goes to empty page, remove or add coming soon

**Files to update**:
- `components/shop/ShopClient.tsx` or shop page
- `components/layout/Footer.tsx`

---

### FIX 16: GALLERY GRID SIZE
**Status**: Needs implementation

**Gallery page**:
- Reduce individual image size
- Grid: grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5
- Image aspect ratio: aspect-square object-cover
- Gap: gap-2 sm:gap-3
- Smaller, tighter grid overall

**Files to update**:
- `app/gallery/page.tsx`

---

### FIX 17: ABOUT PAGE — REMOVE STATS BAR
**Status**: Needs implementation

**About page**:
- Remove the "1000+" stats section completely from About page
- Keep: hero, founder section, story text, values
- Remove: any stats/numbers bar

**Files to update**:
- `app/about/page.tsx`

---

### FIX 18: MOBILE — TOTAL ORDER POSITION
**Status**: Needs implementation

**Checkout component**:
- On mobile: order total/summary should be BELOW the form/items
- Not floating up or overlapping
- Mobile layout: items → address form → order summary → payment → place order button
- Order summary: position static on mobile (not fixed/sticky)

**Files to update**:
- `components/checkout/CheckoutClient.tsx`

---

## IMPLEMENTATION PRIORITY

**High Priority** (affects core functionality):
1. FIX 7: Product upload
2. FIX 8: Out of stock
3. FIX 10: Checkout address
4. FIX 14: Checkout billing

**Medium Priority** (affects user experience):
5. FIX 12: Maintenance mode
6. FIX 13: User settings
7. FIX 18: Mobile checkout layout

**Low Priority** (cosmetic/nice-to-have):
8. FIX 11: Reviews toggle
9. FIX 15: Category empty
10. FIX 16: Gallery grid
11. FIX 17: About page stats

---

## NOTES

- Build is currently failing due to memory issues (out of memory during compilation)
- May need to increase Node.js memory or optimize build
- All fixes should follow the style constraints:
  - Gold: #C9A84C
  - Ink: #1A1A1A
  - Cream: #FAF8F4
  - Mobile-first approach
  - No white interactive states

---

**Last Updated**: May 28, 2026
**Status**: 5/18 fixes completed, 13 remaining
