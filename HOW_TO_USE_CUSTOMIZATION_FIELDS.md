# How to Use Product Customization Fields

## Quick Start Guide

### Step 1: Auto-Generate Fields for All Existing Products

Run this command to add default customization fields (Name, Date, Time, Weight) to all products that don't have any:

```bash
# Using curl (replace with your actual admin password)
curl -X POST http://localhost:3001/api/admin/products/auto-generate-fields \
  -H "Cookie: admin_session=admin123456" \
  -H "Content-Type: application/json"
```

Or use this JavaScript in your browser console while logged in as admin:

```javascript
fetch('/api/admin/products/auto-generate-fields', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include'
})
.then(r => r.json())
.then(data => console.log(data));
```

**Response:**
```json
{
  "success": true,
  "message": "Updated 15 products with customization fields",
  "modifiedCount": 15
}
```

### Step 2: Verify the Fields Were Added

Check any product in your database or via API:

```bash
curl http://localhost:3001/api/products
```

You should see `customizationFields` array in each product:

```json
{
  "_id": "...",
  "name": "Custom Photo Frame",
  "customizationFields": [
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
    }
  ]
}
```

### Step 3: Enable Email Notifications (Optional)

To send email notifications to all users when a new product is added:

1. Open `.env.local` or `.env.production`
2. Change `NOTIFY_USERS_NEW_PRODUCTS=false` to `NOTIFY_USERS_NEW_PRODUCTS=true`
3. Restart your development server

**Note:** This will send an email to ALL registered users, so use carefully!

### Step 4: Test Email Notifications

1. Go to admin panel: `http://localhost:3001/admin/products`
2. Click "Add Product"
3. Fill in product details
4. Click "Save"
5. Check your admin email for the notification

If `NOTIFY_USERS_NEW_PRODUCTS=true`, all users will also receive an email.

## Using the Customization Fields Manager in Admin Panel

### Option 1: Integrate into Existing Admin Products Page

Add this to your `app/admin/products/page.tsx`:

```tsx
import CustomizationFieldsManager, { CustomizationField } from "@/components/admin/CustomizationFieldsManager";

// Inside your component
const [customizationFields, setCustomizationFields] = useState<CustomizationField[]>([]);

// In your form (inside the modal or form section)
<CustomizationFieldsManager 
  fields={customizationFields} 
  onChange={setCustomizationFields} 
/>

// When saving the product
const productData = {
  name,
  description,
  price,
  // ... other fields
  customizationFields, // Include this
};
```

### Option 2: Create a Dedicated Customization Fields Page

Create `app/admin/products/[id]/customize/page.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import CustomizationFieldsManager, { CustomizationField } from "@/components/admin/CustomizationFieldsManager";
import axios from "axios";

export default function CustomizeProductPage() {
  const params = useParams();
  const router = useRouter();
  const [fields, setFields] = useState<CustomizationField[]>([]);
  const [product, setProduct] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fetch product
    axios.get(`/api/admin/products`)
      .then(res => {
        const p = res.data.products.find((p: any) => p._id === params.id);
        setProduct(p);
        setFields(p?.customizationFields || []);
      });
  }, [params.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.patch(`/api/admin/products/${params.id}`, {
        customizationFields: fields,
      });
      alert("Customization fields saved!");
      router.push("/admin/products");
    } catch (error) {
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (!product) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">
        Customize: {product.name}
      </h1>
      
      <CustomizationFieldsManager 
        fields={fields} 
        onChange={setFields} 
      />

      <div className="mt-6 flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-gold text-ink font-semibold rounded-lg"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button
          onClick={() => router.push("/admin/products")}
          className="px-6 py-3 bg-stone-200 text-ink font-semibold rounded-lg"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
```

## Advanced Usage

### Custom Field Types

You can create different field types:

**Text Field:**
```json
{
  "id": "message",
  "label": "Personal Message",
  "type": "text",
  "placeholder": "Enter your message",
  "required": false,
  "order": 1
}
```

**Textarea:**
```json
{
  "id": "long_message",
  "label": "Long Message",
  "type": "textarea",
  "placeholder": "Enter a longer message...",
  "required": false,
  "order": 2
}
```

**Number:**
```json
{
  "id": "quantity",
  "label": "Quantity",
  "type": "number",
  "placeholder": "1",
  "required": true,
  "order": 3
}
```

**Dropdown/Select:**
```json
{
  "id": "color",
  "label": "Color",
  "type": "select",
  "options": ["Red", "Blue", "Green", "Yellow"],
  "required": true,
  "order": 4
}
```

### Auto-Generate with Custom Fields

Instead of using the default fields, you can specify your own:

```bash
curl -X POST http://localhost:3001/api/admin/products/auto-generate-fields \
  -H "Cookie: admin_session=admin123456" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": [
      {
        "id": "recipient_name",
        "label": "Recipient Name",
        "type": "text",
        "placeholder": "Who is this gift for?",
        "required": true,
        "order": 1
      },
      {
        "id": "occasion",
        "label": "Occasion",
        "type": "select",
        "options": ["Birthday", "Anniversary", "Wedding", "Other"],
        "required": false,
        "order": 2
      }
    ]
  }'
```

### Auto-Generate for Specific Products Only

```bash
curl -X POST http://localhost:3001/api/admin/products/auto-generate-fields \
  -H "Cookie: admin_session=admin123456" \
  -H "Content-Type: application/json" \
  -d '{
    "productIds": ["product_id_1", "product_id_2", "product_id_3"]
  }'
```

## Troubleshooting

### Fields Not Showing Up?

1. Check if the product has `customizationFields` in the database
2. Verify the API response includes the fields
3. Check browser console for errors

### Email Notifications Not Sending?

1. Verify `RESEND_API_KEY` is set in environment variables
2. Check `ADMIN_EMAIL` is configured
3. Look for errors in server logs
4. Verify Resend API key is valid

### Auto-Generate Not Working?

1. Make sure you're logged in as admin
2. Check the admin session cookie is set
3. Verify `ADMIN_PASSWORD` matches your session
4. Check server logs for errors

## Production Deployment

### Vercel Environment Variables

Add these in Vercel dashboard → Settings → Environment Variables:

```
RESEND_API_KEY=re_EwTRupNX_NELvnF3av9zqgpW4TcQNNsrU
ADMIN_EMAIL=admin@makemymemory.in
NOTIFY_USERS_NEW_PRODUCTS=false
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### After Deployment

1. Run the auto-generate API once to add fields to all products
2. Test creating a new product to verify email notifications work
3. Monitor email delivery in Resend dashboard

## Support

For issues or questions:
- Check `CUSTOMIZATION_FIELDS_FEATURE.md` for detailed documentation
- Review server logs for error messages
- Verify all environment variables are set correctly

---

**Last Updated:** May 26, 2026
