import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { CartProvider } from "@/lib/context/CartContext";
import { WishlistProvider } from "@/lib/context/WishlistContext";
import { ToastProvider } from "@/lib/context/ToastContext";
import PageTransition from "@/components/layout/PageTransition";
import ClientLayout from "@/components/layout/ClientLayout";
import { cn } from "@/lib/utils";
import { CANONICAL_BASE_URL } from "@/lib/seo";

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

const ibmPlexSerif = localFont({
  src:      "./fonts/IBMPlexSerif-Bold.ttf",
  variable: "--font-ibm-plex-serif",
  weight:   "700",
  display:  "swap",
});

const BASE_URL = CANONICAL_BASE_URL;
// Both unset by default — see .env.example. Nothing loads until real
// values are added, so this is safe to ship as-is.
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const GA_MEASUREMENT_ID = "G-5WLXKTP5Y4";
const META_PIXEL_ID = "938862832116974";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FAF8F4",
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default:  "Make My Memory | Personalised Gifts & Keepsakes",
    template: "%s | Make My Memory",
  },
  description:
    "Personalised gold foil handprint and footprint frames for newborns and babies, handmade in Mumbai and shipped across India.",
  keywords: [
    "baby handprint frame", "baby footprint frame", "gold foil imprint",
    "newborn keepsake India", "personalised baby gift", "inkless handprint kit",
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
      "Gold foil handprint and footprint frames for newborns — a keepsake made from your baby's own imprint, handcrafted in Mumbai.",
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
    description: "Gold foil handprint and footprint frames for newborns, handmade in Mumbai.",
    images:      [`${BASE_URL}/og-default.jpg`],
  },
  ...(GOOGLE_SITE_VERIFICATION ? { verification: { google: GOOGLE_SITE_VERIFICATION } } : {}),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(cormorant.variable, dmSans.variable, ibmPlexSerif.variable, "font-sans")}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Favicon comes from app/icon.png + app/apple-icon.png (Next.js's
            file-convention route) — Next injects the correct <link> tags
            automatically. The old manual "/favicon.ico" reference pointed
            at a file that never existed, which is why browsers/Google were
            falling back to a generic icon. */}
        <link rel="manifest" href="/manifest.json" />
        {/* Consent defaults — must run before GTM, gtag and the Meta pixel.
            The cookie banner used to store the visitor's choice and nothing
            ever read it: GA4 and the pixel loaded for everyone, so "Decline"
            did nothing. Now analytics and ad storage start DENIED and are
            granted only for a visitor who has accepted. With Google Consent
            Mode v2, GA4 still sends cookieless pings while denied, so
            Google's modelled numbers keep working. */}
        <Script id="consent-default" strategy="beforeInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
var __cc = null;
try { __cc = window.localStorage.getItem('cookie_consent'); } catch (e) {}
window.__cookieConsent = __cc;
// Remember a Meta ad click id from the landing URL. Until the visitor accepts,
// the pixel is held back, and a client-side navigation before Accept would
// drop ?fbclid from the URL — the ad click could then never be attributed.
try {
  var __fc = new URLSearchParams(window.location.search).get('fbclid');
  if (__fc) window.sessionStorage.setItem('mmm_fbclid', JSON.stringify({ id: __fc, ts: Date.now() }));
} catch (e) {}
var __cg = __cc === 'accepted' ? 'granted' : 'denied';
gtag('consent', 'default', {
  ad_storage: __cg, ad_user_data: __cg, ad_personalization: __cg,
  analytics_storage: __cg, wait_for_update: 500
});`}
        </Script>
        {/* Google Tag Manager — no-ops entirely until NEXT_PUBLIC_GTM_ID is
            set (see .env.example). Manage GA4 / Meta Pixel / future tags
            from inside GTM once it's added, no code changes needed. */}
        {GTM_ID && (
          <Script id="gtm-head" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
          </Script>
        )}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
        </Script>
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('consent', window.__cookieConsent === 'accepted' ? 'grant' : 'revoke');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
        </Script>
      </head>
      <body className="antialiased">
        {/* No <noscript> Meta pixel: a visitor without JavaScript never sees
            the cookie banner, so it would track someone who cannot consent. */}
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        <CartProvider>
          <WishlistProvider>
            <ToastProvider>
              <ClientLayout>
                <PageTransition>{children}</PageTransition>
              </ClientLayout>
            </ToastProvider>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
