"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag, User, Instagram, LogOut } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";

const NAV_LINKS = [
  { href: "/",        label: "Home" },
  { href: "/shop",    label: "Shop Now" },
  { href: "/reviews", label: "Reviews" },
  { href: "/about",   label: "About Us" },
  { href: "/contact", label: "Contact Us" },
  { href: "/faq",     label: "FAQ" },
];

const INSTAGRAM_URL = "https://www.instagram.com/makemymemory.in?igsh=MWVzZGZoN2FhNG8zNw==";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [userName, setUserName]     = useState<string | null>(null);
  const pathname                    = usePathname();
  const router                      = useRouter();
  const { itemCount, openDrawer }   = useCart();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : { user: null })
      .then((d) => setUserName(d?.user?.name ?? null))
      .catch(() => setUserName(null));
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUserName(null);
    setMobileOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-shadow duration-300
                    border-b ${scrolled ? "shadow-soft backdrop-blur-md" : ""}`}
        style={{ backgroundColor: "#FAF8F4", borderBottomColor: "#E8D5A3" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 md:h-[72px]">

            {/* ── LEFT: Logo (desktop) / Hamburger + Logo (mobile) ── */}
            <div className="flex items-center gap-3">
              {/* Hamburger — mobile only */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-full
                           hover:bg-stone-100 transition-colors"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
              >
                {mobileOpen
                  ? <X    className="w-5 h-5 text-ink" strokeWidth={1.75} />
                  : <Menu className="w-5 h-5 text-ink" strokeWidth={1.75} />
                }
              </button>

              {/* Logo */}
              <Link href="/" className="group flex flex-col leading-none">
                <span className="font-serif font-bold text-ink text-lg md:text-xl tracking-tight
                                 group-hover:text-sage-dark transition-colors duration-200">
                  Make My Memory
                </span>
                <span className="text-[8px] md:text-[9px] tracking-[0.22em] uppercase text-stone-400 font-medium mt-0.5">
                  Personalised Keepsakes
                </span>
              </Link>
            </div>

            {/* ── RIGHT: Nav links + icons (desktop) / Cart (mobile) ── */}
            <div className="flex items-center gap-1 ml-auto">

              {/* Desktop nav links */}
              <nav className="hidden md:flex items-center gap-1 mr-2">
                {NAV_LINKS.map((link) => {
                  const active = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="px-3 py-2 text-[13px] font-medium transition-all duration-200"
                      style={{
                        color: active ? "#C9A84C" : "#1A1A1A",
                        borderBottom: active ? "2px solid #C9A84C" : "2px solid transparent",
                        paddingBottom: "6px",
                      }}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Account — desktop */}
              {userName ? (
                <div className="hidden md:flex items-center gap-1">
                  <Link href="/account"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px]
                               font-medium text-stone-500 hover:text-ink hover:bg-stone-100 transition-colors"
                    title={`My Account (${userName})`}>
                    <User className="w-4 h-4" strokeWidth={1.75} />
                    <span className="hidden lg:block">{userName.split(" ")[0]}</span>
                  </Link>
                  <button onClick={handleLogout}
                    className="w-9 h-9 flex items-center justify-center rounded-full
                               hover:bg-stone-100 transition-colors"
                    aria-label="Logout" title="Logout">
                    <LogOut className="w-4 h-4 text-ink" strokeWidth={1.75} />
                  </button>
                </div>
              ) : (
                <Link href="/login"
                  className="hidden md:flex w-9 h-9 items-center justify-center rounded-full
                             hover:bg-stone-100 transition-colors"
                  aria-label="Login">
                  <User className="w-4 h-4 text-ink" strokeWidth={1.75} />
                </Link>
              )}

              {/* Cart — always visible */}
              <button
                onClick={openDrawer}
                className="relative w-9 h-9 flex items-center justify-center rounded-full
                           hover:bg-stone-100 transition-colors"
                aria-label={`Cart (${itemCount})`}
              >
                <ShoppingBag className="w-5 h-5 text-ink" strokeWidth={1.75} />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      key="badge"
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1
                                 text-[9px] font-bold rounded-full
                                 flex items-center justify-center leading-none"
                      style={{ backgroundColor: "#C9A84C", color: "#1A1A1A" }}
                    >
                      {itemCount > 9 ? "9+" : itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-16 md:h-[72px]" />

      {/* ── Mobile drawer (slides from LEFT) ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-30 bg-ink/20 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              key="drawer"
              role="dialog" aria-modal="true" aria-label="Navigation menu"
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 z-40 w-72 bg-canvas shadow-lift flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between px-5 h-16 border-b border-stone-200">
                <Link href="/" onClick={() => setMobileOpen(false)}
                  className="font-serif font-bold text-ink text-lg">
                  Make My <span className="text-sage-dark">Memory</span>
                </Link>
                <button onClick={() => setMobileOpen(false)} aria-label="Close"
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100">
                  <X className="w-4 h-4 text-ink" />
                </button>
              </div>

              <nav className="flex-1 px-5 py-6 space-y-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.div key={link.href}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}>
                    <Link href={link.href} onClick={() => setMobileOpen(false)}
                      className={`flex items-center h-11 px-3 rounded-xl text-sm font-medium transition-colors
                                  ${pathname === link.href ? "bg-ink text-canvas" : "text-ink hover:bg-stone-100"}`}>
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="px-5 py-5 border-t border-stone-200 space-y-1">
                {userName ? (
                  <>
                    <p className="px-3 py-1 text-xs text-stone-400">Signed in as {userName}</p>
                    <Link href="/account" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 h-11 px-3 rounded-xl
                                 text-sm font-medium text-ink hover:bg-stone-100 transition-colors">
                      <User className="w-4 h-4" strokeWidth={1.75} /> My Account & Orders
                    </Link>
                    <button onClick={handleLogout}
                      className="flex items-center gap-3 h-11 px-3 rounded-xl w-full
                                 text-sm font-medium text-ink hover:bg-stone-100 transition-colors">
                      <LogOut className="w-4 h-4" strokeWidth={1.75} /> Logout
                    </button>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 h-11 px-3 rounded-xl
                               text-sm font-medium text-ink hover:bg-stone-100 transition-colors">
                    <User className="w-4 h-4" strokeWidth={1.75} /> My Account
                  </Link>
                )}
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 h-11 px-3 rounded-xl
                             text-sm font-medium text-ink hover:bg-stone-100 transition-colors">
                  <Instagram className="w-4 h-4" strokeWidth={1.75} /> Follow on Instagram
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
