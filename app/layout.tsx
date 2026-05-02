import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider }  from "@/lib/context/CartContext";
import Navbar            from "@/components/layout/Navbar";
import Footer            from "@/components/layout/Footer";
import CartDrawer        from "@/components/cart/CartDrawer";
import PageTransition    from "@/components/layout/PageTransition";
import CookieBanner      from "@/components/layout/CookieBanner";
import EntryPopup        from "@/components/layout/EntryPopup";
import ReviewsModal      from "@/components/reviews/ReviewsModal";

const cormorant = Cormorant_Garamond({
  subsets:  ["latin"],
  variable: "--font-cormorant",
  display:  "swap",
  weight:   ["300", "400", "500", "600", "700"],
  style:    ["normal", "italic"],
});

const dmSans = DM_Sans({
  subsets:  ["latin"],
  variable: "--font-dm-sans",
  display:  "swap",
  weight:   ["300", "400", "500", "600", "700"],
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://makemymemory.in";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default:  "Make My Memory | Personalised Gifts & Keepsakes",
    template: "%s | Make My Memory",
  },
  description:
    "Create beautiful personalised gifts, photo books, custom frames, and memory keepsakes for every occasion. Crafted with love in India.",
  keywords: [
    "personalised gifts", "photo gifts", "memory keepsakes", "custom gifts India",
    "photo book", "custom mug", "personalised frame", "gift ideas",
  ],
  authors:  [{ name: "Make My Memory", url: BASE_URL }],
  creator:  "Make My Memory",
  robots:   "index,follow",
  openGraph: {
    type:      "website",
    locale:    "en_IN",
    url:       BASE_URL,
    siteName:  "Make My Memory",
    title:     "Make My Memory | Personalised Gifts & Keepsakes",
    description:
      "Turn your favourite moments into beautiful, lasting keepsakes. Photo books, custom frames, mugs, and more — all personalised for you.",
    images: [
      {
        url:    `${BASE_URL}/og-default.jpg`,
        width:  1200,
        height: 630,
        alt:    "Make My Memory — Personalised Gifts",
      },
    ],
  },
  twitter: {
    card:        "summary_large_image",
    site:        "@makemymemory",
    title:       "Make My Memory | Personalised Gifts & Keepsakes",
    description: "Turn your favourite moments into beautiful, lasting keepsakes.",
    images:      [`${BASE_URL}/og-default.jpg`],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon"     href="/favicon.ico" sizes="any" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FAF8F4" />
      </head>
      <body className="antialiased">
        {/* Announcement bar */}
        <div style={{ backgroundColor: "#1A1A1A", color: "#E8D5A3" }}
          className="text-center py-2 px-4 text-xs font-medium tracking-widest">
          ✨ Free shipping on orders ₹999+ &nbsp;·&nbsp; Crafted for a Lifetime
        </div>
        <CartProvider>
          <Navbar />
          <main className="min-h-screen">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
          <CartDrawer />
          <CookieBanner />
          <EntryPopup />
          <ReviewsModal />
          <EntryPopup />
        </CartProvider>
      </body>
    </html>
  );
}
