# WhatsApp Widget Setup

## 🎯 Overview

A floating WhatsApp widget is now visible on all pages of the website. Users can click the green WhatsApp button to open a chat interface and send messages directly to your WhatsApp Business account.

## 📱 Features

✅ **Floating Button** - Green WhatsApp button with icon (bottom-right corner)  
✅ **Chat Popup** - Professional chat interface that appears when clicked  
✅ **Responsive** - Works on desktop, tablet, and mobile  
✅ **Auto-Hide on Admin** - Widget doesn't show on admin pages  
✅ **Smooth Animations** - Slide-in effect when opening  
✅ **Send Message** - Enter text and press Enter or click Send  
✅ **Keyboard Support** - Cmd+Enter to send message  

## ⚙️ Configuration

### Set WhatsApp Phone Number

The widget uses the `NEXT_PUBLIC_WHATSAPP_NUMBER` environment variable.

**Update in `.env.local` and `.env.production`**:

```env
NEXT_PUBLIC_WHATSAPP_NUMBER=919999999999
```

**Format**: Country code + phone number (no + or spaces)
- India: `91` + phone number
- US: `1` + phone number
- UK: `44` + phone number

**Example**:
```env
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210  # India
NEXT_PUBLIC_WHATSAPP_NUMBER=14155552671   # US
NEXT_PUBLIC_WHATSAPP_NUMBER=442071838750  # UK
```

## 🎨 Widget Appearance

### Floating Button
- **Position**: Fixed bottom-right corner (24px from edges)
- **Size**: 56x56px circular button
- **Color**: WhatsApp green gradient (#25D366 to #20BA5A)
- **Icon**: WhatsApp logo
- **On Hover**: Scales up slightly, shadow increases
- **On Active**: Shows X icon to close

### Chat Popup
- **Position**: Above the button
- **Size**: 320px wide × 400px tall (responsive)
- **Header**: Green gradient with company name & status
- **Messages**: Chat-like interface with timestamp
- **Input**: Text field with Send button
- **Footer**: "Powered by Interakt" credit

## 📍 Where It Appears

✅ **Visible On**:
- All customer-facing pages (home, shop, about, etc.)
- Product pages
- Checkout page
- Contact page
- Settings page

❌ **Hidden On**:
- Admin pages (`/admin/*`)
- Authentication pages (implicitly, on non-admin pages only)

## 📄 Implementation Details

### Files Created
- `components/WhatsAppWidget.tsx` - Main widget component

### Files Modified
- `components/layout/ClientLayout.tsx` - Added widget import and rendering
- `.env.local` - Added WHATSAPP_NUMBER
- `.env.production` - Added WHATSAPP_NUMBER

## 🔧 How It Works

1. **User clicks** floating green button
2. **Chat popup opens** with welcome message
3. **User types message** in input field
4. **User clicks Send** or presses Enter
5. **WhatsApp opens** with pre-filled message
6. **Message sent** from WhatsApp account

## 🎯 User Flow

```
Customer visits website
      ↓
Sees green WhatsApp button (bottom-right)
      ↓
Clicks button
      ↓
Chat popup appears with welcome message
      ↓
Types their message
      ↓
Clicks "Send Message" button
      ↓
WhatsApp opens in new tab
      ↓
Message is pre-filled and ready to send
      ↓
Customer sends message
      ↓
You receive message on WhatsApp Business
```

## 💬 Welcome Message

The widget shows this by default:

```
Hi, Welcome to Make My Memory
How can we help you?
12:10 pm
```

You can customize this by editing the component.

## 🌐 WhatsApp Integration

The widget uses WhatsApp's Click-to-Chat URL feature:

```
https://wa.me/[PHONE_NUMBER]?text=[MESSAGE]
```

This works with:
- ✅ WhatsApp Business Account
- ✅ Personal WhatsApp Account
- ✅ WhatsApp Web
- ✅ WhatsApp Mobile App

## 📊 Styling

The widget uses Tailwind CSS classes and can be customized:

### Change Button Color
Edit `WhatsAppWidget.tsx` line ~33:
```jsx
className="bg-gradient-to-br from-[#25D366] to-[#20BA5A]"
```

### Change Button Position
Edit `WhatsAppWidget.tsx` line ~30:
```jsx
className="fixed bottom-6 right-6"  // Change these values
```

### Change Widget Width
Edit `WhatsAppWidget.tsx` line ~85:
```jsx
className="w-80"  // Change to w-96, w-72, etc
```

## 🚀 Testing

### Local Testing
1. Open any page on the website
2. Look for green WhatsApp button bottom-right
3. Click it
4. Chat popup should appear
5. Type a message
6. Click "Send A Message"
7. WhatsApp should open with your message

### Production Testing
Same steps, but verify:
- Button appears on all pages
- Correct WhatsApp number is used
- Messages open in correct WhatsApp chat

## 📱 Mobile Behavior

On mobile devices:
- Button appears same position (bottom-right)
- Popup width adjusts to screen size
- WhatsApp opens in native app (if installed)
- Falls back to web if app not available

## 🔐 Security Notes

- Phone number is public (stored in `.env.NEXT_PUBLIC_*`)
- Messages are sent directly to WhatsApp (not stored on your server)
- No sensitive data should be in pre-filled messages
- Uses WhatsApp's official Click-to-Chat feature

## 📞 Customization Options

### Hide Widget on Specific Pages

Edit `ClientLayout.tsx`:
```jsx
// Add pathname check
if (pathname === "/specific-page") {
  return <WhatsAppWidget /> // or return null to hide
}
```

### Customize Welcome Message

Edit `WhatsAppWidget.tsx` message section to change greeting.

### Add More Message Examples

Edit the component to show chat history or quick reply options.

## 🐛 Troubleshooting

### Button not visible
- Check if on admin page (widget hidden intentionally)
- Verify build succeeded: `npm run build`
- Clear browser cache
- Hard refresh: `Ctrl+Shift+R` or `Cmd+Shift+R`

### WhatsApp not opening
- Verify phone number format in `.env` files
- Check number includes country code
- Try different number format
- Test with sample number provided

### Popup not appearing
- Check browser console for errors
- Verify `WhatsAppWidget.tsx` exists
- Verify `ClientLayout.tsx` includes widget
- Restart dev server: `npm run dev`

## 📝 Commit Info

**Commit**: `a9815c9`  
**Title**: "Add WhatsApp floating widget - visible on all pages with chat popup interface"

## ✅ Status

- ✅ Build: Succeeds
- ✅ Runtime: Tested
- ✅ Responsive: Works on mobile/tablet/desktop
- ✅ Performance: Minimal impact
- ✅ Production: Ready

---

**Last Updated**: June 2, 2026  
**Status**: ✅ Live
