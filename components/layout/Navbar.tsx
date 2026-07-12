"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag, User, Instagram, LogOut, Settings, Heart, ShoppingCart, Trash2, Package } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";
import { useWishlist } from "@/lib/context/WishlistContext";

const NAV_LINKS = [
  { href: "/",        label: "Home" },
  { href: "/shop",    label: "Shop Now" },
  { href: "/gallery", label: "Gallery" },
  { href: "/reviews", label: "Reviews" },
  { href: "/about",   label: "About Us" },
  { href: "/contact", label: "Contact Us" },
  { href: "/faq",     label: "FAQ" },
];

const INSTAGRAM_URL = "https://www.instagram.com/makemymemory.in?igsh=MWVzZGZoN2FhNG8zNw==";

export default function Navbar() {
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [scrolled, setScrolled]         = useState(false);
  const [userName, setUserName]         = useState<string | null>(null);
  const [isAdmin, setIsAdmin]           = useState(false);
  const pathname                        = usePathname();
  const router                          = useRouter();
  const { itemCount, openDrawer }       = useCart();
  const { items: wishlistItems, itemCount: wishlistCount, removeItem, addItem: addToWishlist } = useWishlist();
  const { addItem: addToCart }          = useCart();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : { user: null })
      .then((d) => {
        setUserName(d?.user?.name ?? null);
        setIsAdmin(d?.user?.isAdmin ?? false);
      })
      .catch(() => { setUserName(null); setIsAdmin(false); });
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = (mobileOpen || wishlistOpen) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen, wishlistOpen]);

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
        <div className="w-full max-w-[100vw]">
          <div className="flex items-center justify-between h-[70px] md:h-24 gap-2 px-4 sm:px-6 lg:px-8">

            {/* LEFT SECTION: Hamburger (mobile only) + Logo + Brand Name */}
            <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-shrink-0">
              {/* Hamburger menu - mobile only, placed on the far left */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-full
                           hover:bg-stone-100 transition-colors shrink-0"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
              >
                {mobileOpen
                  ? <X    className="w-5 h-5 text-ink" strokeWidth={1.75} />
                  : <Menu className="w-5 h-5 text-ink" strokeWidth={1.75} />
                }
              </button>

              {/* Logo Link */}
              <Link href="/" className="group flex items-center leading-none shrink-0">
                <Image
                  src="/images/logos.jpeg"
                  alt="Make My Memory"
                  width={180}
                  height={120}
                  className="w-10 h-[27px] sm:w-12 sm:h-8 object-contain"
                  priority
                />
              </Link>

              {/* Brand Name Text (visible on mobile and desktop) */}
              <Link href="/" className="font-serif font-bold text-base sm:text-lg md:text-xl text-[#1A1A1A] leading-none select-none truncate">
                Make My Memory
              </Link>
            </div>

            {/* CENTER: Nav links (desktop) */}
            <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`nav-link px-2 py-2 text-[13px] font-bold whitespace-nowrap transition-colors${active ? " active text-gold" : " text-ink hover:text-gold"}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* RIGHT: Account + Wishlist + Cart */}
            <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">

              {/* Account — desktop */}
              {userName ? (
                <div className="hidden md:flex items-center gap-1">
                  <Link href="/account"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px]
                               font-semibold text-stone-500 hover:text-ink hover:bg-stone-100 transition-colors"
                    title={`My Account (${userName})`}>
                    <User className="w-4 h-4" strokeWidth={1.75} />
                    <span className="hidden lg:block">{userName.split(" ")[0]}</span>
                  </Link>
                  <Link href={isAdmin ? "/admin/settings" : "/settings"}
                    className="w-9 h-9 flex items-center justify-center rounded-full
                               hover:bg-stone-100 transition-colors"
                    aria-label="Settings">
                    <Settings className="w-4 h-4 text-ink" strokeWidth={1.75} />
                  </Link>
                  <button onClick={handleLogout}
                    className="w-9 h-9 flex items-center justify-center rounded-full
                               hover:bg-stone-100 transition-colors"
                    aria-label="Logout">
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

              {/* Account icon - mobile only */}
              <Link href={userName ? "/account" : "/login"}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-full
                           hover:bg-stone-100 transition-colors"
                aria-label={userName ? "Account" : "Login"}>
                <User className="w-5 h-5 text-ink" strokeWidth={1.75} />
              </Link>

              {/* Wishlist icon */}
              <button
                onClick={() => setWishlistOpen(true)}
                className="relative w-10 h-10 md:w-9 md:h-9 flex items-center justify-center rounded-full
                           hover:bg-stone-100 transition-colors"
                aria-label={`Wishlist (${wishlistCount})`}
              >
                <Heart className="w-5 h-5 text-ink" strokeWidth={1.75} />
                <AnimatePresence>
                  {wishlistCount > 0 && (
                    <motion.span
                      key="wbadge"
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className="absolute top-0.5 right-0.5 md:-top-0.5 md:-right-0.5 min-w-[16px] h-[16px] px-1
                                 text-[8px] font-bold rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "#C9A84C", color: "#1A1A1A" }}
                    >
                      {wishlistCount > 9 ? "9+" : wishlistCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Cart */}
              <button
                onClick={openDrawer}
                className="relative w-10 h-10 md:w-9 md:h-9 flex items-center justify-center rounded-full
                           hover:bg-stone-100 transition-colors"
                aria-label={`Cart (${itemCount})`}
              >
                <ShoppingBag className="w-5 h-5 text-ink" strokeWidth={1.75} />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      key="badge"
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className="absolute top-0.5 right-0.5 md:-top-0.5 md:-right-0.5 min-w-[16px] h-[16px] px-1
                                 text-[8px] font-bold rounded-full flex items-center justify-center"
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
      <div className="h-[70px] md:h-24" />

      {/* ── Wishlist Drawer ── */}
      <AnimatePresence>
        {wishlistOpen && (
          <>
            <motion.div
              key="wl-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm"
              onClick={() => setWishlistOpen(false)}
            />
            <motion.div
              key="wl-drawer"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-80 sm:w-96 flex flex-col shadow-lift"
              style={{ backgroundColor: "#FAF8F4" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b"
                style={{ borderColor: "#E8D5A3" }}>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4" style={{ color: "#C9A84C" }} />
                  <h2 className="font-serif font-bold text-base" style={{ color: "#1A1A1A" }}>
                    Wishlist
                  </h2>
                  {wishlistCount > 0 && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "rgba(201,168,76,0.15)", color: "#A07C2E" }}>
                      {wishlistCount}
                    </span>
                  )}
                </div>
                <button onClick={() => setWishlistOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-stone-100 transition-colors">
                  <X className="w-4 h-4 text-stone-500" />
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {wishlistItems.length === 0 ? (
                  <div className="text-center py-16">
                    <Heart className="w-10 h-10 text-stone-200 mx-auto mb-3" />
                    <p className="text-stone-400 text-sm">Your wishlist is empty.</p>
                    <Link href="/shop" onClick={() => setWishlistOpen(false)}
                      className="inline-block mt-4 text-sm font-semibold underline underline-offset-2"
                      style={{ color: "#C9A84C" }}>
                      Browse products
                    </Link>
                  </div>
                ) : (
                  wishlistItems.map((product) => (
                    <div key={product.id}
                      className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-soft"
                      style={{ border: "1px solid #F0EBE1" }}>
                      {/* Image */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-stone-100">
                        {product.images?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={product.images[0]} alt={product.name}
                            className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Heart className="w-5 h-5 text-stone-300" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/shop/${product.slug}`} onClick={() => setWishlistOpen(false)}>
                          <p className="text-sm font-semibold text-ink truncate hover:text-[#C9A84C] transition-colors">
                            {product.name}
                          </p>
                        </Link>
                        <p className="text-sm font-bold mt-0.5" style={{ color: "#1A1A1A" }}>
                          ₹{product.price.toLocaleString("en-IN")}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          onClick={() => { addToCart(product); }}
                          aria-label="Add to cart"
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                          style={{ backgroundColor: "#C9A84C", color: "#1A1A1A" }}
                          title="Add to cart"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeItem(product.id)}
                          aria-label="Remove from wishlist"
                          className="w-8 h-8 rounded-lg flex items-center justify-center
                                     bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {wishlistItems.length > 0 && (
                <div className="px-4 py-4 border-t" style={{ borderColor: "#E8D5A3" }}>
                  <button
                    onClick={() => {
                      wishlistItems.forEach((p) => addToCart(p));
                      setWishlistOpen(false);
                      openDrawer();
                    }}
                    className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "#1A1A1A", color: "#FAF8F4" }}
                  >
                    Add All to Cart
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Mobile drawer ── */}
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
                  className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors">
                  <X className="w-5 h-5 text-ink" />
                </button>
              </div>

              <nav className="flex-1 px-5 py-6 space-y-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.div key={link.href}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}>
                    <Link href={link.href} onClick={() => setMobileOpen(false)}
                      className={`flex items-center h-12 px-3 rounded-xl text-sm font-bold transition-colors
                                  ${pathname === link.href ? "bg-ink text-canvas" : "text-ink hover:bg-stone-100"}`}>
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                {/* Wishlist in mobile menu */}
                <button
                  onClick={() => { setMobileOpen(false); setWishlistOpen(true); }}
                  className="flex items-center gap-3 h-12 px-3 rounded-xl w-full
                             text-sm font-medium text-ink hover:bg-stone-100 transition-colors"
                >
                  <Heart className="w-4 h-4" strokeWidth={1.75} />
                  Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                </button>
              </nav>

              <div className="px-5 py-5 border-t border-stone-200 space-y-1">
                {userName ? (
                  <>
                    <p className="px-3 py-1 text-xs text-stone-400">Signed in as {userName}</p>
                    <Link href="/account" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 h-12 px-3 rounded-xl
                                 text-sm font-medium text-ink hover:bg-stone-100 transition-colors">
                      <User className="w-4 h-4" strokeWidth={1.75} /> My Account
                    </Link>
                    <Link href="/orders" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 h-12 px-3 rounded-xl
                                 text-sm font-medium text-ink hover:bg-stone-100 transition-colors">
                      <Package className="w-4 h-4" strokeWidth={1.75} /> My Orders
                    </Link>
                    <button onClick={handleLogout}
                      className="flex items-center gap-3 h-12 px-3 rounded-xl w-full
                                 text-sm font-medium text-ink hover:bg-stone-100 transition-colors">
                      <LogOut className="w-4 h-4" strokeWidth={1.75} /> Logout
                    </button>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 h-12 px-3 rounded-xl
                               text-sm font-medium text-ink hover:bg-stone-100 transition-colors">
                    <User className="w-4 h-4" strokeWidth={1.75} /> My Account
                  </Link>
                )}
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 h-12 px-3 rounded-xl
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
