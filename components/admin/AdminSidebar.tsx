"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, Star, Users, LogOut, LayoutDashboard, Package, FileText } from "lucide-react";

const links = [
  { href: "/admin",          label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders",   label: "Orders",    icon: ShoppingBag },
  { href: "/admin/products", label: "Products",  icon: Package },
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
    <aside className="w-56 shrink-0 bg-[#1a1714] flex flex-col min-h-screen">
      <div className="px-5 py-6 border-b border-white/5">
        <p className="font-serif text-white font-bold text-base leading-tight">
          Make My <span className="text-[#8FBC8F]">Memory</span>
        </p>
        <p className="text-white/30 text-xs mt-0.5">Admin Panel</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                          transition-colors duration-150
                          ${active
                            ? "bg-[#8FBC8F]/15 text-[#8FBC8F]"
                            : "text-white/50 hover:text-white hover:bg-white/5"
                          }`}
            >
              <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                     text-white/40 hover:text-red-400 hover:bg-red-400/10
                     transition-colors duration-150 w-full"
        >
          <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.75} />
          Logout
        </button>
      </div>
    </aside>
  );
}
