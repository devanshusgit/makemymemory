"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Package, LogOut, ArrowRight } from "lucide-react";

interface Props {
  user: { name: string; email: string } | null;
}

export default function AccountClient({ user }: Props) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  if (!user) {
    return (
      <div className="section-wrap py-16 sm:py-20">
        <div className="max-w-sm mx-auto text-center">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-7 h-7 text-stone-400" strokeWidth={1.5} />
          </div>
          <h2 className="font-serif font-bold text-ink text-2xl mb-3">Sign in to continue</h2>
          <p className="text-stone-500 text-sm mb-8">
            Access your orders, track deliveries, and manage your account.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/login" className="btn-primary w-full py-4">
              Sign In
            </Link>
            <Link href="/signup" className="btn-outline w-full py-4">
              Create Account
            </Link>
          </div>
          <p className="mt-6 text-xs text-stone-400">
            Need help?{" "}
            <Link href="/contact" className="underline underline-offset-2 hover:text-ink transition-colors">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="section-wrap py-12 sm:py-16 max-w-3xl mx-auto">
      {/* Profile card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-stone-100 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-sage/10 rounded-full flex items-center justify-center shrink-0">
            <User className="w-6 h-6 text-sage-dark" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-ink text-lg">{user.name}</p>
            <p className="text-stone-400 text-sm">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-stone-400 hover:text-red-500
                       transition-colors px-3 py-2 rounded-xl hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block">Logout</span>
          </button>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <Link href="/track"
          className="bg-white rounded-3xl p-6 shadow-soft border border-stone-100
                     hover:border-sage/40 hover:shadow-card transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sage/10 rounded-2xl flex items-center justify-center">
                <Package className="w-5 h-5 text-sage-dark" strokeWidth={1.75} />
              </div>
              <div>
                <p className="font-semibold text-ink text-sm">Track Order</p>
                <p className="text-stone-400 text-xs">Check delivery status</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-sage-dark group-hover:translate-x-0.5 transition-all" />
          </div>
        </Link>

        <Link href="/shop"
          className="bg-white rounded-3xl p-6 shadow-soft border border-stone-100
                     hover:border-sage/40 hover:shadow-card transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sage/10 rounded-2xl flex items-center justify-center">
                <span className="text-xl">🎁</span>
              </div>
              <div>
                <p className="font-semibold text-ink text-sm">Shop Now</p>
                <p className="text-stone-400 text-xs">Browse our collection</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-sage-dark group-hover:translate-x-0.5 transition-all" />
          </div>
        </Link>
      </div>

      {/* Order history placeholder */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-stone-100">
        <h2 className="font-semibold text-ink text-base mb-5">Order History</h2>
        <div className="text-center py-10">
          <p className="text-4xl mb-3">📦</p>
          <p className="text-stone-500 text-sm mb-4">No orders yet.</p>
          <Link href="/shop" className="btn-primary px-6 py-3 text-sm">
            Start Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
