"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingBag, Star, Users, LogOut,
  LayoutDashboard, Package, FileText, Settings, Images,
} from "lucide-react";

const links = [
  { href: "/admin",          label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders",   label: "Orders",    icon: ShoppingBag },
  { href: "/admin/products", label: "Products",  icon: Package },
  { href: "/admin/gallery",  label: "Gallery",   icon: Images },
  { href: "/admin/reviews",  label: "Reviews",   icon: Star },
  { href: "/admin/users",    label: "Users",     icon: Users },
  { href: "/admin/policies", label: "Policies",  icon: FileText },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside
      className="w-60 shrink-0 flex flex-col min-h-screen border-r"
      style={{ backgroundColor: "#FAF8F4", borderColor: "#E8D5A3" }}
    >
      {/* Logo */}
      <div
        className="px-5 py-5 border-b flex items-center gap-3"
        style={{ borderColor: "#E8D5A3" }}
      >
        <Image
          src="/images/logos.jpeg"
          alt="Make My Memory"
          width={120}
          height={80}
          className="object-contain"
          style={{ width: "120px", height: "auto" }}
        />
      </div>

      {/* Admin badge */}
      <div className="px-5 py-3 border-b" style={{ borderColor: "#E8D5A3" }}>
        <span
          className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full"
          style={{ backgroundColor: "rgba(201,168,76,0.12)", color: "#A07C2E" }}
        >
          Admin Panel
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                         transition-colors duration-150"
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
              <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Settings + Logout */}
      <div className="px-3 py-4 border-t space-y-0.5" style={{ borderColor: "#E8D5A3" }}>
        <Link
          href="/admin/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                     transition-colors duration-150"
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
          <Settings className="w-4 h-4 shrink-0" strokeWidth={1.75} />
          Settings
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                     w-full transition-colors duration-150"
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
          <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.75} />
          Logout
        </button>
      </div>
    </aside>
  );
}
