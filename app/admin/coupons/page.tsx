"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Copy, Check, X } from "lucide-react";
import axios from "axios";
import Link from "next/link";

interface Coupon {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  description?: string;
  couponType: "general" | "signup" | "second_order" | "combo";
  isActive: boolean;
  usageCount: number;
  maxTotalUsage: number;
  expiryDate?: string;
  createdAt: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: 5,
    description: "",
    couponType: "general",
    minOrderValue: 0,
    maxUsagePerUser: 0,
    maxTotalUsage: 0,
    expiryDate: "",
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/coupons");
      setCoupons(res.data.coupons || []);
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/admin/coupons", formData);
      setCoupons([res.data.coupon, ...coupons]);
      setFormData({
        code: "",
        discountType: "percentage",
        discountValue: 5,
        description: "",
        couponType: "general",
        minOrderValue: 0,
        maxUsagePerUser: 0,
        maxTotalUsage: 0,
        expiryDate: "",
      });
      setShowForm(false);
      alert("Coupon created successfully!");
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to create coupon");
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      await axios.delete(`/api/admin/coupons/${id}`);
      setCoupons(coupons.filter((c) => c._id !== id));
      alert("Coupon deleted successfully!");
    } catch (error) {
      alert("Failed to delete coupon");
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "MMM";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C2520]">
            Coupon Management
          </h1>
          <p className="text-stone-500 text-sm mt-1">{coupons.length} coupons</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#C9A84C] text-[#1A1A1A]
                     rounded-xl font-semibold hover:opacity-90 transition-opacity min-h-[44px]"
        >
          <Plus className="w-5 h-5" /> Create Coupon
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 border border-stone-100 mb-6">
          <h2 className="text-lg font-semibold text-[#2C2520] mb-4">Create New Coupon</h2>
          <form onSubmit={handleCreateCoupon} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Code */}
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase mb-2">
                  Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="Auto-generate or enter"
                    className="flex-1 px-3 py-2.5 border border-stone-200 rounded-xl text-sm
                             focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
                  />
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="px-3 py-2.5 bg-stone-100 text-stone-700 rounded-xl text-sm font-semibold
                             hover:bg-stone-200 transition-colors"
                  >
                    Generate
                  </button>
                </div>
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase mb-2">
                  Discount Type
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              {/* Discount Value */}
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase mb-2">
                  Discount Value
                </label>
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
                  min="0"
                  max={formData.discountType === "percentage" ? "100" : undefined}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
                />
              </div>

              {/* Coupon Type */}
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase mb-2">
                  Coupon Type
                </label>
                <select
                  value={formData.couponType}
                  onChange={(e) => setFormData({ ...formData, couponType: e.target.value as any })}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
                >
                  <option value="general">General</option>
                  <option value="signup">Sign Up Discount</option>
                  <option value="second_order">Second Order</option>
                  <option value="combo">Combo Offer</option>
                </select>
              </div>

              {/* Max Usage */}
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase mb-2">
                  Max Total Usage (0 = unlimited)
                </label>
                <input
                  type="number"
                  value={formData.maxTotalUsage}
                  onChange={(e) => setFormData({ ...formData, maxTotalUsage: parseInt(e.target.value) })}
                  min="0"
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase mb-2">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
                />
              </div>

              {/* Min Order Value */}
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase mb-2">
                  Min Order Value (₹)
                </label>
                <input
                  type="number"
                  value={formData.minOrderValue}
                  onChange={(e) => setFormData({ ...formData, minOrderValue: parseInt(e.target.value) })}
                  min="0"
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
                />
              </div>

              {/* Max Usage Per User */}
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase mb-2">
                  Max Usage Per User (0 = unlimited)
                </label>
                <input
                  type="number"
                  value={formData.maxUsagePerUser}
                  onChange={(e) => setFormData({ ...formData, maxUsagePerUser: parseInt(e.target.value) })}
                  min="0"
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., 5% off on first purchase"
                rows={2}
                className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-[#C9A84C] text-[#1A1A1A] rounded-xl font-semibold
                         hover:opacity-90 transition-opacity min-h-[44px]"
              >
                Create Coupon
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2.5 bg-stone-100 text-stone-700 rounded-xl font-semibold
                         hover:bg-stone-200 transition-colors min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons List */}
      {loading ? (
        <div className="text-center py-12 text-stone-400">Loading coupons...</div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-12 text-stone-400">No coupons yet. Create one to get started!</div>
      ) : (
        <div className="space-y-3">
          {coupons.map((coupon) => (
            <div
              key={coupon._id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg text-[#2C2520] font-mono">{coupon.code}</h3>
                    <button
                      onClick={() => copyToClipboard(coupon.code)}
                      className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors"
                    >
                      {copied === coupon.code ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-stone-400" />
                      )}
                    </button>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        coupon.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {coupon.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <p className="text-sm text-stone-600 mb-2">{coupon.description}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-stone-500">Discount:</span>
                      <p className="font-semibold text-[#2C2520]">
                        {coupon.discountValue}
                        {coupon.discountType === "percentage" ? "%" : "₹"}
                      </p>
                    </div>
                    <div>
                      <span className="text-stone-500">Type:</span>
                      <p className="font-semibold text-[#2C2520] capitalize">{coupon.couponType}</p>
                    </div>
                    <div>
                      <span className="text-stone-500">Used:</span>
                      <p className="font-semibold text-[#2C2520]">
                        {coupon.usageCount}
                        {coupon.maxTotalUsage > 0 ? `/${coupon.maxTotalUsage}` : ""}
                      </p>
                    </div>
                    <div>
                      <span className="text-stone-500">Expires:</span>
                      <p className="font-semibold text-[#2C2520]">
                        {coupon.expiryDate
                          ? new Date(coupon.expiryDate).toLocaleDateString("en-IN")
                          : "Never"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleDeleteCoupon(coupon._id)}
                    className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
