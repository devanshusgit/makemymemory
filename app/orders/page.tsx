import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import OrderHistoryClient from "@/components/orders/OrderHistoryClient";
import { buildMeta } from "@/lib/seo";

export const metadata = buildMeta({
  title: "My Orders",
  description: "View your order history, track shipments, and manage your purchases.",
  path: "/orders",
  noIndex: true,
});

export default function OrdersPage() {
  const cookieStore = cookies();
  const session = cookieStore.get("user_session");
  let isLoggedIn = false;
  try {
    if (session?.value) {
      const parsed = JSON.parse(session.value);
      isLoggedIn = !!parsed?.email;
    }
  } catch { /* invalid cookie */ }

  if (!isLoggedIn) {
    redirect("/login?redirect=/orders");
  }

  return (
    <div className="bg-canvas min-h-screen">
      <div className="section-wrap py-10 sm:py-14">
        <div className="mb-8">
          <h1 className="section-heading">My Orders</h1>
          <p className="text-stone-500 text-sm mt-2">Track, manage and review all your past orders.</p>
        </div>
        <Suspense fallback={
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-3xl p-6 animate-pulse border border-stone-100">
                <div className="h-4 bg-stone-200 rounded w-1/3 mb-3" />
                <div className="h-3 bg-stone-100 rounded w-1/2 mb-2" />
                <div className="h-3 bg-stone-100 rounded w-1/4" />
              </div>
            ))}
          </div>
        }>
          <OrderHistoryClient />
        </Suspense>
      </div>
    </div>
  );
}
