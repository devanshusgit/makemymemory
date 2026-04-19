import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider }  from "@/lib/context/CartContext";
import Navbar            from "@/components/layout/Navbar";
import Footer            from "@/components/layout/Footer";
import CartDrawer        from "@/components/cart/CartDrawer";
import PageTransition    from "@/components/layout/PageTransition";

const inter = Inter({
  subsets:  ["latin"],
  variable: "--font-inter",
  display:  "swap",
  weight:   ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets:  ["latin"],
  variable: "--font-playfair",
  display:  "swap",
  weight:   ["400", "500", "600", "700", "800"],
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
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {/* Preconnect to Google Fonts CDN for faster font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Favicon */}
        <link rel="icon"         href="/favicon.ico" sizes="any" />
        <link rel="manifest"     href="/manifest.json" />
        <meta name="theme-color" content="#F5F0EB" />
      </head>
      <body className="bg-canvas text-ink antialiased">
        <CartProvider>
          <Navbar />
          <main className="min-h-screen">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
