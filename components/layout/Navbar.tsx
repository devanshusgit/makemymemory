"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, User, Menu, X, Instagram, LogOut } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";

const navLinks = [
  { href: "/",        label: "Home" },
  { href: "/shop",    label: "Shop Now" },
  { href: "/reviews", label: "Reviews" },
  { href: "/about",   label: "About Us" },
  { href: "/contact", label: "Contact Us" },
  { href: "/faq",     label: "FAQ" },
];

const INSTAGRAM_URL = "https://www.instagram.com/makemymemory";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [userName, setUserName]     = useState<string | null>(null);
  const pathname                    = usePathname();
  const router                      = useRouter();
  const { itemCount, openDrawer }   = useCart();

  /* Fetch session */
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : { user: null })
      .then((d) => setUserName(d?.user?.name ?? null))
      .catch(() => setUserName(null));
  }, [pathname]);

  /* Scroll shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Close drawer on route change */
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  /* Lock body scroll when mobile menu open */
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
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-canvas/96 backdrop-blur-md shadow-soft" : "bg-canvas/90 backdrop-blur-sm"
        }`}
      >
        {/* ── Single nav bar ── */}
        <nav className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16" aria-label="Main navigation">

          {/* ── LEFT: Instagram ── */}
          <div className="flex items-center">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on Instagram"
              className="w-9 h-9 flex items-center justify-center rounded-full
                         text-ink/60 hover:text-ink hover:bg-stone-100 transition-colors duration-200"
            >
              <Instagram className="w-[17px] h-[17px]" strokeWidth={1.75} />
            </a>
          </div>

          {/* ── CENTER: Brand (mobile) / Nav links (desktop) ── */}
          <div className="flex-1 flex justify-center">
            {/* Mobile: brand name */}
            <Link
              href="/"
              className="md:hidden font-serif font-bold text-ink text-lg leading-none"
            >
              Make My <span className="text-sage-dark">Memory</span>
            </Link>

            {/* Desktop: nav links */}
            <ul className="hidden md:flex items-center gap-0.5" role="list">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`relative px-3.5 py-2 rounded-full text-[13px] font-medium
                                  transition-colors duration-200
                                  ${active ? "text-ink" : "text-ink/55 hover:text-ink hover:bg-stone-100"}`}
                    >
                      {link.label}
                      {active && (
                        <motion.span
                          layoutId="nav-dot"
                          className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-sage-dark"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* ── RIGHT: Cart + Auth + Hamburger ── */}
          <div className="flex items-center gap-1">

            {/* Cart — always visible */}
            <button
              onClick={openDrawer}
              aria-label={`Cart — ${itemCount} item${itemCount !== 1 ? "s" : ""}`}
              className="relative w-9 h-9 flex items-center justify-center rounded-full
                         text-ink/60 hover:text-ink hover:bg-stone-100 transition-colors duration-200"
            >
              <ShoppingBag className="w-[17px] h-[17px]" strokeWidth={1.75} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1
                                 bg-sage text-white text-[10px] font-bold rounded-full
                                 flex items-center justify-center leading-none ring-2 ring-canvas">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>

            {/* Account / Logout — desktop only */}
            {userName ? (
              <button
                onClick={handleLogout}
                aria-label="Logout"
                className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px]
                           font-medium text-ink/60 hover:text-ink hover:bg-stone-100 transition-colors"
              >
                <LogOut className="w-[15px] h-[15px]" strokeWidth={1.75} />
                <span className="hidden lg:block">Logout</span>
              </button>
            ) : (
              <Link
                href="/login"
                aria-label="Login"
                className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px]
                           font-medium text-ink/60 hover:text-ink hover:bg-stone-100 transition-colors"
              >
                <User className="w-[17px] h-[17px]" strokeWidth={1.75} />
                <span className="hidden lg:block">Login</span>
              </Link>
            )}

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full
                         text-ink/60 hover:text-ink hover:bg-stone-100 transition-colors duration-200"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span key="close"
                    initial={{ rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 45, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X className="w-[18px] h-[18px]" />
                  </motion.span>
                ) : (
                  <motion.span key="open"
                    initial={{ rotate: 45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -45, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Menu className="w-[18px] h-[18px]" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </nav>

        <div className="h-px bg-stone-200/70" />
      </header>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-canvas shadow-lift
                         flex flex-col md:hidden"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-6 h-16 border-b border-stone-200">
                <Link href="/" onClick={() => setMobileOpen(false)}
                  className="font-serif font-bold text-ink text-base">
                  Make My <span className="text-sage-dark">Memory</span>
                </Link>
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu"
                  className="w-8 h-8 rounded-full flex items-center justify-center
                             text-ink/50 hover:text-ink hover:bg-stone-100 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex-1 overflow-y-auto px-4 py-5">
                <ul className="space-y-1" role="list">
                  {navLinks.map((link, i) => {
                    const active = pathname === link.href;
                    return (
                      <motion.li key={link.href}
                        initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.25 }}>
                        <Link
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm
                                      font-medium transition-colors duration-150
                                      ${active ? "bg-ink text-canvas" : "text-ink/70 hover:text-ink hover:bg-stone-100"}`}
                        >
                          {active && <span className="w-1.5 h-1.5 rounded-full bg-sage shrink-0" />}
                          {link.label}
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </nav>

              {/* Drawer footer */}
              <div className="px-4 py-5 border-t border-stone-200 space-y-2">
                {userName ? (
                  <>
                    <p className="px-4 py-1 text-xs text-stone-400">Signed in as {userName}</p>
                    <button onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl w-full
                                 text-sm font-medium text-ink/70 hover:text-ink hover:bg-stone-100 transition-colors">
                      <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                      Logout
                    </button>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl
                               text-sm font-medium text-ink/70 hover:text-ink hover:bg-stone-100 transition-colors">
                    <User className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                    Login / Sign Up
                  </Link>
                )}
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl
                             text-sm font-medium text-ink/70 hover:text-ink hover:bg-stone-100 transition-colors">
                  <Instagram className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                  Follow on Instagram
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
