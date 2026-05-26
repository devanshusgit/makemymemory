# Product Customization Fields Feature

## Overview
This feature allows admin to add dynamic customization fields to products (like Name, Date, Time, Weight, etc.) and automatically sends email notifications when new products are created.

## Features Implemented

### 1. **Product Model Enhancement**
- Added `customizationFields` array to Product schema
- Supports multiple field types: text, date, time, number, textarea, select
- Each field can be required or optional
- Fields have customizable labels, placeholders, and order

### 2. **Email Notifications**

#### Admin Notifications
- **Trigger:** When a new product is created
- **Recipient:** Admin email (from `ADMIN_EMAIL` env var)
- **Content:** Product details, images, price, category, and customization fields count
- **Template:** `adminNewProductEmail()`

#### User Notifications (Optional)
- **Trigger:** When a new product is created (if enabled)
- **Recipients:** All registered users
- **Content:** Beautiful product showcase with images, pricing, and customization info
- **Template:** `userNewProductEmail()`
- **Enable:** Set `NOTIFY_USERS_NEW_PRODUCTS=true` in environment variables

### 3. **Auto-Generate Fields API**
**Endpoint:** `POST /api/admin/products/auto-generate-fields`

Automatically adds default customization fields to products that don't have any.

**Default Fields:**
```json
[
  {
    "id": "name",
    "label": "Name",
    "type": "text",
    "placeholder": "Enter name",
    "required": true,
    "order": 1
  },
  {
    "id": "date",
    "label": "Date",
    "type": "date",
    "placeholder": "dd-mm-yyyy",
    "required": false,
    "order": 2
  },
  {
    "id": "time",
    "label": "Time",
    "type": "time",
    "placeholder": "--:--",
    "required": false,
    "order": 3
  },
  {
    "id": "weight",
    "label": "Weight (optional)",
    "type": "text",
    "placeholder": "e.g. 500g",
    "required": false,
    "order": 4
  }
]
```

**Usage:**
```bash
# Auto-generate for all products without fields
curl -X POST https://yourdomain.com/api/admin/products/auto-generate-fields \
  -H "Cookie: admin_session=your_admin_password" \
  -H "Content-Type: application/json"

# Auto-generate for specific products
curl -X POST https://yourdomain.com/api/admin/products/auto-generate-fields \
  -H "Cookie: admin_session=your_admin_password" \
  -H "Content-Type: application/json" \
  -d '{"productIds": ["product_id_1", "product_id_2"]}'

# Use custom fields
curl -X POST https://yourdomain.com/api/admin/products/auto-generate-fields \
  -H "Cookie: admin_session=your_admin_password" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": [
      {
        "id": "custom_field",
        "label": "Custom Field",
        "type": "text",
        "required": true,
        "order": 1
      }
    ]
  }'
```

**Preview Endpoint:** `GET /api/admin/products/auto-generate-fields`
- Returns default fields template
- Shows count of products without customization fields

### 4. **Customization Fields Manager Component**
**Location:** `components/admin/CustomizationFieldsManager.tsx`

A reusable React component for managing product customization fields in the admin panel.

**Features:**
- Add/Edit/Delete fields
- Reorder fields with up/down buttons
- Set field type (text, date, time, number, textarea, select)
- Configure labels, placeholders, and required status
- Dropdown options for select type fields
- Visual editing interface

**Usage:**
```tsx
import CustomizationFieldsManager from "@/components/admin/CustomizationFieldsManager";

const [fields, setFields] = useState<CustomizationField[]>([]);

<CustomizationFieldsManager 
  fields={fields} 
  onChange={setFields} 
/>
```

## API Endpoints

### Create Product with Customization Fields
```
POST /api/admin/products
```

**Body:**
```json
{
  "name": "Custom Photo Frame",
  "description": "Personalized photo frame",
  "price": 999,
  "category": "frames",
  "customizationFields": [
    {
      "id": "name",
      "label": "Name",
      "type": "text",
      "placeholder": "Enter name",
      "required": true,
      "order": 1
    }
  ]
}
```

### Update Product with Customization Fields
```
PATCH /api/admin/products/[id]
```

**Body:**
```json
{
  "customizationFields": [...]
}
```

## Environment Variables

Add these to your `.env.local` and `.env.production`:

```env
# Email notifications
RESEND_API_KEY=re_your_resend_api_key
ADMIN_EMAIL=admin@makemymemory.in

# Optional: Enable user notifications for new products
NOTIFY_USERS_NEW_PRODUCTS=true

# App URL for email links
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Email Templates

### Admin New Product Email
- **Function:** `adminNewProductEmail(product)`
- **Subject:** `New Product Added: {product.name}`
- **Features:**
  - Product image
  - Name, description, price, category
  - Customization fields count and list
  - Link to admin panel

### User New Product Email
- **Function:** `userNewProductEmail(product, userName)`
- **Subject:** `New Product: {product.name} - Make My Memory`
- **Features:**
  - Beautiful product showcase
  - Pricing with original price strikethrough
  - Badge display (Best Seller, New, etc.)
  - Customization info
  - Direct link to product page

## Integration with Admin Panel

To integrate the customization fields manager into your admin products page:

1. **Import the component:**
```tsx
import CustomizationFieldsManager, { CustomizationField } from "@/components/admin/CustomizationFieldsManager";
```

2. **Add state:**
```tsx
const [customizationFields, setCustomizationFields] = useState<CustomizationField[]>([]);
```

3. **Add to form:**
```tsx
<CustomizationFieldsManager 
  fields={customizationFields} 
  onChange={setCustomizationFields} 
/>
```

4. **Include in save:**
```tsx
const productData = {
  ...otherFields,
  customizationFields,
};
```

## Testing

### Test Auto-Generate API
```bash
# Check preview
curl https://yourdomain.com/api/admin/products/auto-generate-fields \
  -H "Cookie: admin_session=your_password"

# Generate for all products
curl -X POST https://yourdomain.com/api/admin/products/auto-generate-fields \
  -H "Cookie: admin_session=your_password" \
  -H "Content-Type: application/json"
```

### Test Email Notifications
1. Create a new product via admin panel
2. Check admin email for notification
3. If `NOTIFY_USERS_NEW_PRODUCTS=true`, check user emails

## Database Schema

### Product Model
```typescript
interface IProduct {
  // ... existing fields
  customizationFields?: Array<{
    id: string;
    label: string;
    type: "text" | "date" | "time" | "number" | "textarea" | "select";
    placeholder?: string;
    required: boolean;
    options?: string[]; // For select type
    order: number;
  }>;
}
```

## Frontend Integration

When displaying products on the frontend, use the customization fields to render dynamic forms:

```tsx
{product.customizationFields?.map((field) => (
  <div key={field.id}>
    <label>{field.label}</label>
    {field.type === "text" && (
      <input 
        type="text" 
        placeholder={field.placeholder}
        required={field.required}
      />
    )}
    {field.type === "date" && (
      <input 
        type="date" 
        required={field.required}
      />
    )}
    {/* Add other field types */}
  </div>
))}
```

## Benefits

1. **Flexible Product Customization:** Each product can have unique customization fields
2. **Auto-Generation:** Quickly add standard fields to all products
3. **Email Notifications:** Keep admin and users informed about new products
4. **User Engagement:** Notify customers about new products automatically
5. **Easy Management:** Visual interface for managing fields
6. **Scalable:** Add new field types easily

## Future Enhancements

- [ ] Conditional fields (show field based on another field's value)
- [ ] Field validation rules (min/max length, regex patterns)
- [ ] File upload fields for custom images
- [ ] Price modifiers based on customization options
- [ ] Bulk edit customization fields across multiple products
- [ ] Field templates (save and reuse field configurations)
- [ ] Analytics on which customization options are most popular

---

**Created:** May 26, 2026
**Status:** ✅ Implemented and Ready
