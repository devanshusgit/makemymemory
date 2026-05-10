"use client";

import { useState, useEffect } from "react";
import { TrendingUp, ShoppingBag, Users, Star, Eye } from "lucide-react";
import axios from "axios";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  avgOrderValue: number;
  topProducts: Array<{ name: string; sales: number; revenue: number }>;
  recentOrders: Array<{ orderId: string; total: number; status: string; date: string }>;
  conversionRate: number;
  avgRating: number;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get("/api/admin/analytics");
        setData(res.data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-stone-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 lg:p-8 text-center">
        <p className="text-stone-500">Failed to load analytics data</p>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Revenue",
      value: `₹${data.totalRevenue.toLocaleString("en-IN")}`,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Total Orders",
      value: data.totalOrders,
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Customers",
      value: data.totalCustomers,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Avg Order Value",
      value: `₹${data.avgOrderValue.toLocaleString("en-IN")}`,
      icon: ShoppingBag,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-[#2C2520]">Analytics</h1>
        <p className="text-stone-500 text-sm mt-1">Business performance overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`${stat.bg} rounded-2xl p-6 border border-stone-100`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-stone-600 text-sm font-medium mb-2">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${stat.color} opacity-20`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Key Metrics */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Conversion Rate */}
        <div className="bg-white rounded-2xl p-6 border border-stone-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Eye className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-[#2C2520]">Conversion Rate</h3>
          </div>
          <p className="text-3xl font-bold text-indigo-600 mb-2">{data.conversionRate.toFixed(2)}%</p>
          <p className="text-xs text-stone-500">Orders / Total Visitors</p>
        </div>

        {/* Avg Rating */}
        <div className="bg-white rounded-2xl p-6 border border-stone-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="font-semibold text-[#2C2520]">Avg Rating</h3>
          </div>
          <p className="text-3xl font-bold text-amber-600 mb-2">{data.avgRating.toFixed(1)}/5</p>
          <p className="text-xs text-stone-500">Based on customer reviews</p>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-2xl p-6 border border-stone-100 mb-8">
        <h3 className="font-semibold text-[#2C2520] mb-4">Top Products</h3>
        <div className="space-y-3">
          {data.topProducts.length === 0 ? (
            <p className="text-stone-500 text-sm">No sales data yet</p>
          ) : (
            data.topProducts.map((product, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div>
                  <p className="font-medium text-sm text-[#2C2520]">{product.name}</p>
                  <p className="text-xs text-stone-500">{product.sales} sold</p>
                </div>
                <p className="font-semibold text-[#2C2520]">₹{product.revenue.toLocaleString("en-IN")}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl p-6 border border-stone-100">
        <h3 className="font-semibold text-[#2C2520] mb-4">Recent Orders</h3>
        <div className="space-y-2">
          {data.recentOrders.length === 0 ? (
            <p className="text-stone-500 text-sm">No orders yet</p>
          ) : (
            data.recentOrders.map((order, i) => (
              <div key={i} className="flex items-center justify-between p-3 border-b border-stone-100 last:border-0">
                <div>
                  <p className="font-mono text-xs font-bold text-[#2C2520]">{order.orderId}</p>
                  <p className="text-xs text-stone-500">{order.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#2C2520]">₹{order.total.toLocaleString("en-IN")}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                    {order.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
