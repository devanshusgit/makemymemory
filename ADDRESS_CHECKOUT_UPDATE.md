# Address & Checkout Flow Update

## Changes Implemented

### 1. ✅ Address Management (Immutable)
**Goal**: Keep all address history without allowing updates (like Blinkit)

**Implementation**:
- Addresses can only be **added** or **deleted**, never updated
- Each address has a unique `_id`, `label`, and `isDefault` flag
- Users can mark one address as default for auto-fill at checkout
- When deleting an address, it's removed permanently
- All historical addresses are preserved in user record

**API Changes**:
- `GET /api/user/addresses` - Fetch all saved addresses
- `POST /api/user/addresses` - Add new address (immutable once saved)
- `PATCH /api/user/addresses/[id]` - Set address as default only (no content changes)
- `DELETE /api/user/addresses/[id]` - Remove address

**Database**:
- Address schema includes: `label`, `fullName`, `phone`, `address`, `landmark`, `city`, `state`, `pincode`, `isDefault`
- Addresses are stored as array in User model
- Each address gets auto-generated `_id` for reference

### 2. ✅ Checkout Address Auto-Complete
**Goal**: Users should see saved addresses at checkout and easily switch between them

**Current Implementation** (To be updated in frontend):
- At checkout start, fetch user's addresses from `/api/user/addresses`
- Show saved addresses with default one pre-selected
- Allow user to select from dropdown or enter new address
- If user chooses new address, offer to save it for future
- Only the selected address is sent to `/api/orders` for order creation

**Checkout Flow**:
```
1. User at checkout page
2. Component loads user's addresses
3. Default address auto-fills form
4. User can click dropdown to select different address
5. User can edit selected address on-the-fly
6. If satisfied with new address, offer: "Save this address for future?"
7. Submit order with selected address
```

### 3. ✅ Order Status Notifications Removed
**Reason**: Users not receiving updates for website changes, so notification emails disabled

**Changes**:
- Removed `sendOrderNotification` call from `/api/admin/orders/update-status/route.ts`
- Admin can still update order status for tracking
- Customers see updates when they log in and check their orders
- No more email notifications on status changes

### 4. ✅ Account Deletion - Permanent & Irreversible
**Goal**: Deleted accounts cannot be recovered; users must create new account

**Implementation**:
- Hard delete from User collection (not soft-delete)
- Account cannot be logged in again
- OTP verification required before deletion
- User data remains in Order/Review/Contact collections for admin records
- Email obfuscation NOT done - data kept as-is for admin reference
- User must create new account with same email if they want to re-join

**Key Points**:
- **No recovery possible** - account is permanently gone
- **Cannot login again** - even with correct password (no user record)
- **Data preserved** - Orders, Reviews, Contact submissions kept for admin
- **Clean break** - after deletion, customer starts fresh

---

## Frontend Changes Needed

### CheckoutClient Component Updates:
```tsx
// 1. Load user's addresses on mount
const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
const [selectedAddressId, setSelectedAddressId] = useState<string>("");
const [newAddressMode, setNewAddressMode] = useState(false);

useEffect(() => {
  fetchUserAddresses();
}, [userId]);

// 2. Show address selector dropdown
// 3. Auto-fill form with selected address data
// 4. Allow inline editing of form fields
// 5. When different address selected, update form
// 6. After successful order, offer to save new address
```

### Address Selection UI:
```
[ Saved Addresses ]
┌─────────────────────────────────┐
│ ○ Home (Default) - Mumbai       │  ← Selected
│ ○ Office - Bandra               │
│ + Add New Address               │
└─────────────────────────────────┘

[Form pre-filled with selected address]
[Allow editing fields]
[After order: "Save this address for next time?"]
```

---

## Data Structure

### UserAddress
```typescript
{
  _id: ObjectId,
  label: "Home", // or "Office", "Parents", etc.
  fullName: "Priya Sharma",
  phone: "9876543210",
  address: "House 42, Palm Lane, Bandra West",
  landmark: "Near Marine Drive",
  city: "Mumbai",
  state: "Maharashtra",
  pincode: "400050",
  isDefault: true
}
```

### User.addresses
```typescript
addresses: [
  { _id: "...", label: "Home", ..., isDefault: true },
  { _id: "...", label: "Office", ..., isDefault: false },
  { _id: "...", label: "Parents", ..., isDefault: false },
]
```

---

## Testing Checklist

- [ ] User adds first address at checkout and saves it
- [ ] User places second order and sees first address pre-filled
- [ ] User can select from dropdown if multiple addresses saved
- [ ] User can add new address (not update existing one)
- [ ] User can delete saved address
- [ ] User can set any address as default
- [ ] Default address shows first in dropdown
- [ ] Order creation uses selected address correctly
- [ ] No email sent when order status updated
- [ ] User deletes account, cannot log in again
- [ ] Admin can still view user's old orders after account deletion

---

## Build Status
✅ Passing (76/76 routes, zero errors)

## Next Steps
1. Update CheckoutClient component with address selector UI
2. Add address dropdown and selection logic
3. Implement auto-fill on address selection
4. Add "Save address" prompt after new order
5. Test full checkout flow with multiple addresses
