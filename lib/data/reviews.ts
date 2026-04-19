export interface Review {
  id: string;
  name: string;
  location: string;
  rating: number;           // 1–5
  title: string;
  text: string;
  date: string;             // ISO date string
  product: string;
  verified: boolean;
  helpful: number;          // helpful vote count
  initials: string;
  avatarColor: string;
  mediaType?: "image" | "video";
  mediaSrc?: string;        // swap with real paths / CDN URLs
  mediaGradient: string;    // placeholder gradient
}

export const REVIEWS: Review[] = [
  {
    id: "r1",
    name: "Priya Sharma",
    location: "Mumbai",
    rating: 5,
    title: "Absolutely stunning — exceeded every expectation",
    text: "The photo book I ordered for my parents' anniversary was absolutely stunning. Every page felt like a work of art. The binding is solid, the colours are vivid, and the paper quality is exceptional. My parents were in tears when they opened it. Will definitely order again.",
    date: "2025-03-12",
    product: "Custom Photo Book",
    verified: true,
    helpful: 42,
    initials: "PS",
    avatarColor: "#C4A882",
    mediaType: "image",
    mediaSrc: "",
    mediaGradient: "linear-gradient(135deg, #EDE5DC 0%, #C4A882 100%)",
  },
  {
    id: "r2",
    name: "Rahul Verma",
    location: "Delhi",
    rating: 5,
    title: "My friend cried happy tears — best gift ever",
    text: "Ordered a custom mug for my best friend's birthday. She absolutely loved it! The print quality is incredible — sharp, vibrant, and it hasn't faded after weeks of daily use. Fast delivery and the packaging was beautiful too. 10/10 would recommend.",
    date: "2025-02-28",
    product: "Personalised Mug",
    verified: true,
    helpful: 31,
    initials: "RV",
    avatarColor: "#8FBC8F",
    mediaType: "video",
    mediaSrc: "",
    mediaGradient: "linear-gradient(135deg, #D4E8D4 0%, #8FBC8F 100%)",
  },
  {
    id: "r3",
    name: "Ananya Patel",
    location: "Bangalore",
    rating: 5,
    title: "Our wedding memories are now a masterpiece",
    text: "Make My Memory made our wedding memories come alive. The canvas prints are gorgeous — the colours are true to life and the canvas texture adds such a premium feel. The team was incredibly helpful throughout the whole process. Highly recommend for any special occasion.",
    date: "2025-01-15",
    product: "Canvas Print",
    verified: true,
    helpful: 58,
    initials: "AP",
    avatarColor: "#B8956E",
    mediaType: "image",
    mediaSrc: "",
    mediaGradient: "linear-gradient(135deg, #E8DDD4 0%, #B8956E 100%)",
  },
  {
    id: "r4",
    name: "Karan Mehta",
    location: "Pune",
    rating: 5,
    title: "The cushion made my mom cry — in the best way",
    text: "Incredible quality and attention to detail. The memory cushion I ordered for my mom made her cry happy tears. The print is crisp, the fabric is soft, and it arrived beautifully packaged. Will definitely order again for every special occasion!",
    date: "2025-03-01",
    product: "Memory Cushion",
    verified: true,
    helpful: 27,
    initials: "KM",
    avatarColor: "#6A9E6A",
    mediaGradient: "linear-gradient(135deg, #DDE8DD 0%, #6A9E6A 100%)",
  },
  {
    id: "r5",
    name: "Sneha Iyer",
    location: "Chennai",
    rating: 5,
    title: "Perfect anniversary gift — they loved every detail",
    text: "The gift set was perfect for my parents' 30th anniversary. Everything was beautifully packaged and the personalisation was exactly what I wanted. The photo book, mug, and frame all matched perfectly. Delivery was faster than expected too.",
    date: "2025-02-10",
    product: "Memory Gift Set",
    verified: true,
    helpful: 19,
    initials: "SI",
    avatarColor: "#A8917C",
    mediaType: "image",
    mediaSrc: "",
    mediaGradient: "linear-gradient(135deg, #EDE5DC 0%, #A8917C 100%)",
  },
  {
    id: "r6",
    name: "Vikram Nair",
    location: "Kochi",
    rating: 4,
    title: "Great quality, slight delay but worth the wait",
    text: "The photo frame came out beautifully — the engraving is precise and the wood quality is excellent. Delivery took a day longer than expected but the customer support team kept me updated throughout. Overall a great experience and I'd order again.",
    date: "2025-01-28",
    product: "Custom Photo Frame",
    verified: true,
    helpful: 14,
    initials: "VN",
    avatarColor: "#8C7260",
    mediaGradient: "linear-gradient(135deg, #EDE5DC 0%, #8C7260 100%)",
  },
  {
    id: "r7",
    name: "Meera Joshi",
    location: "Jaipur",
    rating: 5,
    title: "The calendar is a work of art",
    text: "I ordered a personalised calendar for my family and it turned out even better than I imagined. The photo quality is stunning, the paper is thick and premium, and the layout is clean and elegant. Everyone who sees it asks where I got it from!",
    date: "2025-03-18",
    product: "Photo Calendar 2025",
    verified: true,
    helpful: 22,
    initials: "MJ",
    avatarColor: "#C4A882",
    mediaGradient: "linear-gradient(135deg, #F5F0EB 0%, #C4A882 100%)",
  },
  {
    id: "r8",
    name: "Arjun Singh",
    location: "Hyderabad",
    rating: 5,
    title: "Keychain is tiny but the quality is massive",
    text: "Ordered a personalised keychain as a small gift and was blown away by the quality. The engraving is sharp and deep, the metal feels premium, and it came in a lovely little box. Perfect for a thoughtful, affordable gift.",
    date: "2025-02-20",
    product: "Personalised Keychain",
    verified: true,
    helpful: 11,
    initials: "AS",
    avatarColor: "#6A9E6A",
    mediaGradient: "linear-gradient(135deg, #D4E8D4 0%, #6A9E6A 100%)",
  },
];

/* Rating breakdown — how many reviews per star level */
export const RATING_BREAKDOWN = [5, 4, 3, 2, 1].map((star) => ({
  star,
  count: REVIEWS.filter((r) => r.rating === star).length,
}));

export const OVERALL_RATING =
  Math.round(
    (REVIEWS.reduce((sum, r) => sum + r.rating, 0) / REVIEWS.length) * 10
  ) / 10;

export const TOTAL_REVIEWS = 2847; // displayed total (includes off-platform)
