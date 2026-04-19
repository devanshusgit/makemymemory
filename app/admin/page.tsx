"use client";

import Link from "next/link";
import { ShoppingBag, Star, Users } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-serif font-bold text-[#2C2520] mb-2">Dashboard</h1>
      <p className="text-stone-500 text-sm mb-8">Welcome to the Make My Memory admin panel.</p>
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { href: "/admin/orders",  label: "Manage Orders",  icon: ShoppingBag, desc: "View, update and track all orders" },
          { href: "/admin/reviews", label: "Manage Reviews", icon: Star,        desc: "Approve, reject or delete reviews" },
          { href: "/admin/users",   label: "Manage Users",   icon: Users,       desc: "View and delete user accounts" },
        ].map(({ href, label, icon: Icon, desc }) => (
          <Link key={href} href={href}
            className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm
                       hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
            <div className="w-10 h-10 bg-[#8FBC8F]/10 rounded-xl flex items-center justify-center mb-4">
              <Icon className="w-5 h-5 text-[#6A9E6A]" strokeWidth={1.75} />
            </div>
            <p className="font-semibold text-[#2C2520] mb-1 group-hover:text-[#6A9E6A] transition-colors">{label}</p>
            <p className="text-stone-400 text-xs">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
