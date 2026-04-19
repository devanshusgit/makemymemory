# Make My Memory 🎁

A Next.js 14 e-commerce store for personalised gifts and memory keepsakes.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Payments**: Razorpay
- **Forms**: React Hook Form
- **Animations**: Framer Motion
- **Carousel**: Swiper
- **HTTP Client**: Axios

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in your Razorpay keys from the [Razorpay Dashboard](https://dashboard.razorpay.com/).

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
make-my-memory/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/
│   │   ├── payment/        # Razorpay order creation & verification
│   │   └── contact/        # Contact form handler
│   ├── cart/
│   ├── checkout/
│   ├── contact/
│   ├── shop/
│   │   └── [slug]/         # Dynamic product pages
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── layout/             # Navbar, Footer
│   ├── home/               # Hero, Categories, Featured, Testimonials
│   ├── shop/               # ProductCard, ProductGrid, Filters, Detail
│   ├── cart/               # CartItems, CartSummary
│   ├── checkout/           # CheckoutForm, OrderSummary
│   └── contact/            # ContactForm
├── lib/
│   ├── data/               # Product data
│   ├── types/              # TypeScript interfaces
│   └── utils/              # Helper functions
└── public/                 # Static assets
```

## Razorpay Integration

The checkout flow:
1. User fills delivery details → clicks "Pay Now"
2. `/api/payment/create-order` creates a Razorpay order
3. Razorpay checkout modal opens
4. On success, `/api/payment/verify` validates the signature
5. User is redirected to `/checkout/success`
"# make_my_memory" 
