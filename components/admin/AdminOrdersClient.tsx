"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  confirmed:        "bg-blue-100 text-blue-700",
  processing:       "bg-yellow-100 text-yellow-700",
  shipped:          "bg-purple-100 text-purple-700",
  out_for_delivery: "bg-orange-100 text-orange-700",
  delivered:        "bg-green-100 text-green-700",
  cancelled:        "bg-red-100 text-red-700",
  payment_failed:   "bg-red-100 text-red-700",
  pending_confirmation: "bg-stone-100 text-stone-600",
};

const ALL_STATUSES = [
  "all", "confirmed", "processing", "shipped",
  "out_for_delivery", "delivered", "cancelled",
];

interface Order {
  _id: string;
  orderId: string;
  status: string;
  paymentMethod: string;
  total: number;
  isCOD: boolean;
  shippingAddress: { fullName: string; phone: string; city: string };
  createdAt: string;
}

export default function AdminOrdersClient({ orders }: { orders: Order[] }) {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all
                        ${filter === s
                          ? "bg-[#2C2520] text-white"
                          : "bg-white text-stone-500 border border-stone-200 hover:border-stone-400"
                        }`}
          >
            {s.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-stone-400 text-sm">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Order ID</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Payment</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Date</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filtered.map((order) => (
                  <tr key={order._id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-[#2C2520]">
                      {order.orderId}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#2C2520]">{order.shippingAddress?.fullName}</p>
                      <p className="text-xs text-stone-400">{order.shippingAddress?.phone} · {order.shippingAddress?.city}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#2C2520]">
                      ₹{order.total?.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <span className="capitalize text-xs text-stone-500">
                        {order.paymentMethod}{order.isCOD ? " (COD)" : ""}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize
                                        ${STATUS_COLORS[order.status] ?? "bg-stone-100 text-stone-600"}`}>
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-stone-400">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.orderId}`}
                        className="flex items-center gap-1 text-xs text-[#8FBC8F] font-semibold hover:underline"
                      >
                        View <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
