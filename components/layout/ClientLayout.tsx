"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import WhatsAppWidget from "@/components/WhatsAppWidget";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin  = pathname?.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Navbar />}

      <main className={isAdmin ? "" : "min-h-screen"}>
        {children}
      </main>

      {!isAdmin && (
        <>
          <Footer />
          <CartDrawer />
          <WhatsAppWidget />
        </>
      )}
    </>
  );
}
