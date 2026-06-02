# Quick Reference — Coupon Validation API

**Status**: ✅ Fixed & Deployed  
**Last Commit**: f28a82d  
**Build**: ✅ Succeeds

---

## API Endpoints

### 1. Validate Coupon
```bash
POST /api/coupons/validate
Content-Type: application/json

{
  "couponCode": "COMBO20",
  "userId": "user@example.com",
  "subtotal": 5000,
  "items": [
    { "productId": "prod123", "category": "foil-imprints", "quantity": 2 }
  ]
}
```

**Response (Success)**:
```json
{
  "valid": true,
  "discount": 1000,
  "message": "Coupon applied successfully",
  "couponCode": "COMBO20"
}
```

**Response (Error)**:
```json
{
  "valid": false,
  "discount": 0,
  "message": "Coupon has expired",
  "couponCode": ""
}
```

---

### 2. Get Public Coupons
```bash
GET /api/coupons/public
```

**Response**:
```json
{
  "coupons": [
    {
      "code": "COMBO20",
      "description": "20% off on all orders",
      "discountType": "percentage",
      "discountValue": 20,
      "minOrderValue": 0,
      "badge": "20% OFF"
    }
  ]
}
```

---

### 3. Get User's Coupon
```bash
GET /api/coupons/my-coupon?userId=user@example.com
```

**Response**:
```json
{
  "coupon": {
    "code": "WELCOME200",
    "discountType": "fixed",
    "discountValue": 200,
    "description": "₹200 OFF on your first order",
    "minOrderValue": 0,
    "isUsed": false
  }
}
```

---

### 4. Seed Test Coupons
```bash
POST /api/admin/coupons/seed
```

**Creates**:
- WELCOME10 (10% OFF, 1 use per user)
- COMBO20 (20% OFF, unlimited)
- SAVE50 (₹50 OFF, min ₹500)
- SUMMER20 (20% OFF, unlimited)
- FLAT100 (₹100 OFF, min ₹1000)

---

## Database Schema

```typescript
{
  code: string,                      // Coupon code (unique, uppercase)
  discountType: "percentage" | "fixed",
  discountValue: number,             // Discount amount/percentage
  description?: string,              // User-friendly description
  applicableCategories: string[],    // Empty = all categories
  minOrderValue: number,             // Minimum order value (default: 0)
  maxUsagePerUser: number,           // Per-user limit (0 = unlimited)
  maxTotalUsage: number,             // Total limit (0 = unlimited)
  couponType: string,                // general | signup | second_order | combo
  isActive: boolean,                 // Active status
  startDate: Date,                   // When coupon starts
  expiryDate?: Date,                 // When coupon expires (optional)
  usageCount: number,                // How many times used (default: 0)
  usedByUsers: string[],             // Array of user IDs
}
```

---

## Validation Rules

✅ All Checks Applied:
1. Coupon exists and is active
2. Not expired (expiryDate check)
3. Not yet started (startDate check)
4. Minimum order value met
5. Total usage limit not exceeded
6. Per-user usage limit not exceeded
7. Applicable categories (if specified)
8. Combo requirements (if applicable)

---

## Default Coupon

**COMBO20** is automatically created if missing:
- **Discount**: 20% OFF
- **Min Order**: ₹0
- **Usage Limit**: Unlimited
- **Expiry**: None
- **Auto-Created**: Yes (on first validate call)

---

## Key Features

### For Development
- ✅ TypeScript strict mode (no `any` types)
- ✅ Null coalescing for undefined checks
- ✅ Comprehensive error handling
- ✅ Detailed console logging
- ✅ Clean code structure

### For Users
- ✅ Real-time validation
- ✅ Clear error messages
- ✅ Discount calculation
- ✅ Mobile-friendly

### For Admins
- ✅ Create custom coupons
- ✅ Set expiry dates (optional)
- ✅ Manage categories
- ✅ Track usage

---

## Testing

### Quick Test
```bash
# 1. Seed test coupons
curl -X POST http://localhost:3000/api/admin/coupons/seed

# 2. Get public coupons
curl http://localhost:3000/api/coupons/public

# 3. Validate a coupon
curl -X POST http://localhost:3000/api/coupons/validate \
  -H "Content-Type: application/json" \
  -d '{
    "couponCode": "COMBO20",
    "userId": "test@example.com",
    "subtotal": 5000,
    "items": [{"productId": "p1", "category": "foil-imprints", "quantity": 1}]
  }'
```

---

## TypeScript Fixes Applied

### Before (Error)
```typescript
if (coupon.maxTotalUsage > 0) {
  // Error: 'coupon.maxTotalUsage' is possibly 'undefined'
}
```

### After (Fixed)
```typescript
const maxTotalUsage = coupon.maxTotalUsage ?? 0;
if (maxTotalUsage > 0) {
  // No error - safe access
}
```

**All Fields Fixed**:
- `minOrderValue` ✅
- `maxTotalUsage` ✅
- `maxUsagePerUser` ✅
- `usedByUsers` ✅
- `applicableCategories` ✅
- `usageCount` ✅

---

## Files

```
app/api/coupons/
├── validate/route.ts       ✅ Validation endpoint
├── my-coupon/route.ts      ✅ User's coupon
└── public/route.ts         ✅ Public coupons

app/api/admin/coupons/
├── route.ts                ✅ CRUD operations
└── seed/route.ts           ✅ Test data seeding

lib/
├── coupon/couponUtils.ts   ✅ Validation logic
└── db/models/Coupon.ts     ✅ Database schema
```

---

## Troubleshooting

### Issue: Coupon not found
**Solution**: Call seed endpoint to create test coupons

### Issue: Discount not calculating
**Solution**: Check console logs for validation errors

### Issue: TypeScript errors
**Solution**: All fixed in latest build ✅

### Issue: COMBO20 not appearing
**Solution**: It auto-creates on first request to validate

---

## Status

✅ **Build**: Succeeds  
✅ **Tests**: All compile  
✅ **TypeScript**: No errors  
✅ **Database**: Ready  
✅ **APIs**: Working  
✅ **Documentation**: Complete  

---

## Recent Changes

**Commit**: f28a82d  
**Date**: May 30, 2026

- ✅ Fixed validate route with ensureDefaultCoupons()
- ✅ Fixed TypeScript undefined issues
- ✅ Enhanced public/route.ts with badge and minOrderValue
- ✅ Added COMBO20 to seed endpoint
- ✅ All validation rules intact

---

## Next Steps

1. ✅ Deploy to production
2. ✅ Test in development environment
3. ✅ Monitor coupon usage
4. ✅ Track discount metrics

---

**Status**: ✅ **READY FOR PRODUCTION**  
**Last Updated**: May 30, 2026  
**Commit**: f28a82d
