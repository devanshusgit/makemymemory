# Quick Reference: Hardcoded Data Removal

## Files Changed

### 1. lib/data/products.ts
```typescript
// BEFORE: 8 hardcoded products
export const ALL_PRODUCTS: Product[] = [
  { id: "1", name: "Gold Foil Handprint Frame", ... },
  // ... 7 more products
];

// AFTER: Empty array
export const ALL_PRODUCTS: Product[] = [];
```

### 2. lib/data/reviews.ts
```typescript
// BEFORE: 8 hardcoded reviews
export const REVIEWS: Review[] = [
  { id: "r1", name: "Priya Sharma", ... },
  // ... 7 more reviews
];

// AFTER: Empty array
export const REVIEWS: Review[] = [];
```

### 3. components/reviews/ReviewForm.tsx
```typescript
// BEFORE: Hardcoded products array
const PRODUCTS = [
  "Custom Photo Book",
  "Personalised Mug",
  // ... 6 more products
];

// AFTER: Fetch from API
const [products, setProducts] = useState<string[]>([]);

useEffect(() => {
  const res = await fetch("/api/products?limit=100");
  const data = await res.json();
  setProducts(data.products.map(p => p.name));
}, []);
```

### 4. components/home/ProductGridSection.tsx
```typescript
// BEFORE: Used ALL_PRODUCTS
const products = ALL_PRODUCTS.slice(0, 6);

// AFTER: Fetch from API
const [products, setProducts] = useState<Product[]>([]);
useEffect(() => {
  const res = await fetch("/api/products?limit=6");
  setProducts(res.json().products);
}, []);
```

### 5. components/home/IntroSection.tsx
```typescript
// BEFORE: Used FEATURED_PRODUCTS
{FEATURED_PRODUCTS.map((product, i) => ...)}

// AFTER: Fetch from API
const [products, setProducts] = useState<Product[]>([]);
useEffect(() => {
  const res = await fetch("/api/products?featured=true&limit=4");
  setProducts(res.json().products);
}, []);
```

### 6. components/home/SocialProofSection.tsx
```typescript
// BEFORE: Hardcoded counter
<h2>Over <CountUp target={10000} suffix="+" /> Moments Preserved</h2>

// AFTER: Removed hardcoded stat
<h2>Moments Preserved with <span>Love</span></h2>
```

### 7. components/shop/ProductDetail.tsx
```typescript
// BEFORE: Imported unused ALL_PRODUCTS
import { ALL_PRODUCTS } from "@/lib/data/products";

// AFTER: Removed import (already fetches from API)
// No import needed
```

### 8. app/shop/[slug]/page.tsx
```typescript
// BEFORE: Used ALL_PRODUCTS for static generation
export function generateStaticParams() {
  return ALL_PRODUCTS.map((p) => ({ slug: p.slug }));
}

// AFTER: Dynamic routing
export function generateStaticParams() {
  return [];
}
```

### 9. components/home/ReviewsSection.tsx
```typescript
// Already fetching from API - no changes needed
const res = await fetch("/api/reviews?approved=true&limit=10");
```

## API Endpoints Used

| Endpoint | Purpose | Query Params |
|----------|---------|--------------|
| GET /api/products | Fetch products | limit, featured, category, search, sort, minPrice, maxPrice |
| GET /api/reviews | Fetch reviews | approved, limit |
| POST /api/reviews | Submit review | (body) |

## Testing Checklist

- [ ] Homepage loads without errors
- [ ] Product grid shows "Products Coming Soon" when empty
- [ ] Featured section shows "Featured products coming soon" when empty
- [ ] Reviews section shows "Reviews Coming Soon" when empty
- [ ] Shop page works with empty database
- [ ] Review form dropdown loads products
- [ ] Product detail pages work with dynamic routing
- [ ] Add a product via admin panel
- [ ] Add a review via review form
- [ ] Verify all sections display real data

## Deployment Steps

1. Ensure MongoDB is connected
2. Add initial products and reviews
3. Test all sections
4. Commit changes
5. Push to GitHub
6. Deploy to Vercel

## Rollback (if needed)

If you need to restore dummy data:
1. Revert commits
2. Or manually restore from git history

```bash
git log --oneline | grep "Remove ALL hardcoded"
git revert <commit-hash>
```
