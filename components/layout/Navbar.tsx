"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, User, Menu, X, Instagram, LogOut } from "lucide-react";
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
  const [isOpen, setIsOpen]     = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const pathname                = usePathname();
  const router                  = useRouter();
  const { itemCount, openDrawer } = useCart();

  // Fetch session on mount and on route change
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : { user: null })
      .then((d) => setUserName(d?.user?.name ?? null))
      .catch(() => setUserName(null));
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setIsOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUserName(null);
    setIsOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-canvas/96 backdrop-blur-md shadow-soft"
            : "bg-canvas/80 backdrop-blur-sm"
        }`}
      >
        <div className="section-wrap">
          <nav
            className="h-16 sm:h-[68px] grid items-center"
            style={{ gridTemplateColumns: "1fr auto 1fr" }}
            aria-label="Main navigation"
          >
            {/* LEFT: Instagram */}
            <div className="flex items-center">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Instagram"
                className="group flex items-center gap-2 text-ink/60 hover:text-ink
                           transition-colors duration-200 py-2 pr-3"
              >
                <span className="relative flex items-center justify-center w-8 h-8 rounded-full
                                 bg-stone-100 group-hover:bg-stone-200 transition-colors duration-200">
                  <Instagram className="w-[17px] h-[17px]" strokeWidth={1.75} />
                </span>
                <span className="hidden lg:block text-xs font-medium tracking-wide">Follow us</span>
              </a>
            </div>

            {/* CENTER: Nav links */}
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
                          layoutId="nav-active-dot"
                          className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-sage-dark"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* RIGHT: Auth + Cart + Hamburger */}
            <div className="flex items-center justify-end gap-1">
              {/* Desktop auth */}
              {userName ? (
                <div className="hidden sm:flex items-center gap-1">
                  <span className="text-[13px] font-medium text-ink/70 px-2 hidden lg:block">
                    Hi, {userName.split(" ")[0]}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px]
                               font-medium text-ink/60 hover:text-ink hover:bg-stone-100 transition-colors"
                  >
                    <LogOut className="w-[15px] h-[15px]" strokeWidth={1.75} />
                    <span className="hidden lg:block">Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px]
                             font-medium text-ink/60 hover:text-ink hover:bg-stone-100 transition-colors"
                >
                  <User className="w-[17px] h-[17px]" strokeWidth={1.75} />
                  <span className="hidden lg:block">Login</span>
                </Link>
              )}

              {/* Cart */}
              <button
                onClick={openDrawer}
                aria-label={`Cart — ${itemCount} item${itemCount !== 1 ? "s" : ""}`}
                className="relative flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px]
                           font-medium text-ink/60 hover:text-ink hover:bg-stone-100 transition-colors"
              >
                <ShoppingCart className="w-[17px] h-[17px]" strokeWidth={1.75} />
                <span className="hidden lg:block">Cart</span>
                {itemCount > 0 && (
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1
                               bg-sage text-white text-[10px] font-bold rounded-full
                               flex items-center justify-center leading-none ring-2 ring-canvas"
                  >
                    {itemCount > 99 ? "99+" : itemCount}
                  </motion.span>
                )}
              </button>

              {/* Mobile hamburger */}
              <button
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-full
                           text-ink/60 hover:text-ink hover:bg-stone-100 transition-colors ml-1"
                onClick={() => setIsOpen((v) => !v)}
                aria-label={isOpen ? "Close menu" : "Open menu"}
                aria-expanded={isOpen}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isOpen ? (
                    <motion.span key="close" initial={{ rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 45, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <X className="w-[18px] h-[18px]" />
                    </motion.span>
                  ) : (
                    <motion.span key="open" initial={{ rotate: 45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -45, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <Menu className="w-[18px] h-[18px]" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </nav>
        </div>
        <div className="h-px bg-stone-200/70" />
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-sm md:hidden"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              key="drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-canvas shadow-lift flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between px-6 h-16 border-b border-stone-200">
                <Link href="/" className="font-serif text-base font-bold text-ink" onClick={() => setIsOpen(false)}>
                  Make My <span className="text-sage-dark">Memory</span>
                </Link>
                <button onClick={() => setIsOpen(false)} aria-label="Close menu"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-ink/50 hover:text-ink hover:bg-stone-100 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-4 py-5">
                <ul className="space-y-1" role="list">
                  {navLinks.map((link, i) => {
                    const active = pathname === link.href;
                    return (
                      <motion.li key={link.href} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05, duration: 0.25 }}>
                        <Link
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors
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

              <div className="px-4 py-5 border-t border-stone-200 space-y-2">
                {userName ? (
                  <>
                    <p className="px-4 py-1 text-xs text-stone-400">Signed in as {userName}</p>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl w-full
                                 text-sm font-medium text-ink/70 hover:text-ink hover:bg-stone-100 transition-colors"
                    >
                      <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl
                               text-sm font-medium text-ink/70 hover:text-ink hover:bg-stone-100 transition-colors"
                  >
                    <User className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                    Login / Sign Up
                  </Link>
                )}
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-ink/70 hover:text-ink hover:bg-stone-100 transition-colors"
                >
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
