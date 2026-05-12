"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import CookieBanner from "@/components/layout/CookieBanner";
import EntryPopup from "@/components/layout/EntryPopup";
import ReviewsButton from "@/components/reviews/ReviewsButton";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin  = pathname?.startsWith("/admin");

  return (
    <>
      {!isAdmin && (
        <>
          <div
            style={{ backgroundColor: "#1A1A1A", color: "#E8D5A3" }}
            className="text-center py-2 px-4 text-xs font-medium tracking-widest"
          >
            ✨ Free shipping on orders ₹999+ &nbsp;·&nbsp; Crafted for a Lifetime
          </div>
          <Navbar />
        </>
      )}

      <main className={isAdmin ? "" : "min-h-screen"}>
        {children}
      </main>

      {!isAdmin && (
        <>
          <Footer />
          <CartDrawer />
          <CookieBanner />
          <EntryPopup />
          <ReviewsButton />
        </>
      )}
    </>
  );
}
