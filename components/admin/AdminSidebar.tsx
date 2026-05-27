"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ShoppingBag, Star, Users, LogOut,
  LayoutDashboard, Package, FileText, Settings, Images, Menu, X, Mail, Inbox, Ticket,
} from "lucide-react";

const links = [
  { href: "/admin",            label: "Dashboard",   icon: LayoutDashboard },
  { href: "/admin/submissions", label: "Submissions", icon: Inbox },
  { href: "/admin/orders",     label: "Orders",      icon: ShoppingBag },
  { href: "/admin/products",   label: "Products",    icon: Package },
  { href: "/admin/coupons",    label: "Coupons",     icon: Ticket },
  { href: "/admin/gallery",    label: "Gallery",     icon: Images },
  { href: "/admin/contact",    label: "Contact",     icon: Mail },
  { href: "/admin/reviews",    label: "Reviews",     icon: Star },
  { href: "/admin/users",      label: "Users",       icon: Users },
  { href: "/admin/policies",   label: "Policies",    icon: FileText },
];

function SidebarContent({ pathname, onLogout, onLinkClick, unreadCount }: { pathname: string; onLogout: () => void; onLinkClick?: () => void; unreadCount: number }) {
  return (
    <>
      {/* Logo */}
      <div
        className="px-4 sm:px-5 py-4 sm:py-5 border-b flex items-center gap-3"
        style={{ borderColor: "#E8D5A3" }}
      >
        <Image
          src="/images/logos.jpeg"
          alt="Make My Memory"
          width={120}
          height={80}
          className="object-contain"
          style={{ width: "100px", height: "auto" }}
        />
      </div>

      {/* Admin badge */}
      <div className="px-4 sm:px-5 py-3 border-b" style={{ borderColor: "#E8D5A3" }}>
        <span
          className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full"
          style={{ backgroundColor: "rgba(201,168,76,0.12)", color: "#A07C2E" }}
        >
          Admin Panel
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(href);
          const showBadge = href === "/admin/contact" && unreadCount > 0;
          
          return (
            <Link
              key={href}
              href={href}
              onClick={onLinkClick}
              className="flex items-center gap-3 px-3 py-3 sm:py-2.5 rounded-xl text-sm sm:text-base font-medium
                         transition-colors duration-150 min-h-[48px] relative"
              style={
                active
                  ? { backgroundColor: "#C9A84C", color: "#1A1A1A" }
                  : { color: "#6B6560" }
              }
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(201,168,76,0.1)";
                  (e.currentTarget as HTMLElement).style.color = "#1A1A1A";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "";
                  (e.currentTarget as HTMLElement).style.color = "#6B6560";
                }
              }}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" strokeWidth={1.75} />
              {label}
              {showBadge && (
                <span className="ml-auto w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Settings + Logout */}
      <div className="px-3 py-4 border-t space-y-0.5" style={{ borderColor: "#E8D5A3" }}>
        <Link
          href="/admin/settings"
          onClick={onLinkClick}
          className="flex items-center gap-3 px-3 py-3 sm:py-2.5 rounded-xl text-sm sm:text-base font-medium
                     transition-colors duration-150 min-h-[48px]"
          style={
            pathname.startsWith("/admin/settings")
              ? { backgroundColor: "#C9A84C", color: "#1A1A1A" }
              : { color: "#6B6560" }
          }
          onMouseEnter={(e) => {
            if (!pathname.startsWith("/admin/settings")) {
              (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(201,168,76,0.1)";
              (e.currentTarget as HTMLElement).style.color = "#1A1A1A";
            }
          }}
          onMouseLeave={(e) => {
            if (!pathname.startsWith("/admin/settings")) {
              (e.currentTarget as HTMLElement).style.backgroundColor = "";
              (e.currentTarget as HTMLElement).style.color = "#6B6560";
            }
          }}
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" strokeWidth={1.75} />
          Settings
        </Link>

        <button
          onClick={() => {
            onLogout();
            onLinkClick?.();
          }}
          className="flex items-center gap-3 px-3 py-3 sm:py-2.5 rounded-xl text-sm sm:text-base font-medium
                     w-full transition-colors duration-150 min-h-[48px]"
          style={{ color: "#6B6560" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(220,38,38,0.08)";
            (e.currentTarget as HTMLElement).style.color = "#DC2626";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "";
            (e.currentTarget as HTMLElement).style.color = "#6B6560";
          }}
        >
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" strokeWidth={1.75} />
          Logout
        </button>
      </div>
    </>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch unread count
    const fetchUnreadCount = async () => {
      try {
        const res = await fetch("/api/admin/contact");
        const data = await res.json();
        const unread = data.messages?.filter((m: any) => !m.isRead).length || 0;
        setUnreadCount(unread);
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    };

    fetchUnreadCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16 flex items-center justify-between px-4 border-b"
        style={{ backgroundColor: "#FAF8F4", borderColor: "#E8D5A3" }}>
        <Image
          src="/images/logos.jpeg"
          alt="Make My Memory"
          width={80}
          height={60}
          className="object-contain"
          style={{ width: "80px", height: "auto" }}
        />
        <button
          onClick={() => setMobileOpen(true)}
          className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-stone-100 transition-colors"
        >
          <Menu className="w-5 h-5 text-stone-700" />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`lg:hidden fixed top-0 right-0 bottom-0 z-50 w-72 flex flex-col transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ backgroundColor: "#FAF8F4" }}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: "#E8D5A3" }}>
          <span className="text-base font-serif font-bold text-stone-800">Menu</span>
          <button
            onClick={() => setMobileOpen(false)}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5 text-stone-700" />
          </button>
        </div>
        <SidebarContent pathname={pathname} onLogout={handleLogout} onLinkClick={() => setMobileOpen(false)} unreadCount={unreadCount} />
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex w-64 shrink-0 flex-col min-h-screen border-r"
        style={{ backgroundColor: "#FAF8F4", borderColor: "#E8D5A3" }}
      >
        <SidebarContent pathname={pathname} onLogout={handleLogout} unreadCount={unreadCount} />
      </aside>

      {/* Spacer for mobile header */}
      <div className="lg:hidden h-16" />
    </>
  );
}
