"use client";

import { useState } from "react";
import { Ticket, Check, X, Loader } from "lucide-react";
import axios from "axios";

interface CouponInputProps {
  subtotal: number;
  items: Array<{ productId: string; category: string; quantity: number }>;
  userId: string;
  onCouponApplied: (discount: number, couponCode: string) => void;
  onCouponRemoved: () => void;
}

export default function CouponInput({
  subtotal,
  items,
  userId,
  onCouponApplied,
  onCouponRemoved,
}: CouponInputProps) {
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);
  const [appliedCode, setAppliedCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError("Please enter a coupon code");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post("/api/coupons/validate", {
        couponCode: couponCode.toUpperCase(),
        userId,
        subtotal,
        items,
      });

      if (response.data.valid) {
        setApplied(true);
        setAppliedCode(response.data.couponCode);
        setAppliedDiscount(response.data.discount);
        setSuccess(`Coupon applied! You save ₹${response.data.discount.toFixed(2)}`);
        onCouponApplied(response.data.discount, response.data.couponCode);
        setCouponCode("");
      } else {
        setError(response.data.message || "Invalid coupon code");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to apply coupon");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setApplied(false);
    setAppliedCode("");
    setAppliedDiscount(0);
    setCouponCode("");
    setError("");
    setSuccess("");
    onCouponRemoved();
  };

  if (applied) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-green-900">Coupon Applied</p>
              <p className="text-xs text-green-700">{appliedCode}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-green-900">-₹{appliedDiscount.toFixed(2)}</p>
            <button
              onClick={handleRemoveCoupon}
              className="text-xs text-green-600 hover:text-green-700 font-medium mt-1"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
            <Ticket className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={couponCode}
            onChange={(e) => {
              setCouponCode(e.target.value.toUpperCase());
              setError("");
            }}
            placeholder="Enter coupon code"
            className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl text-sm
                     focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:border-transparent
                     disabled:bg-stone-50 disabled:cursor-not-allowed"
            disabled={loading}
          />
        </div>
        <button
          onClick={handleApplyCoupon}
          disabled={loading || !couponCode.trim()}
          className="px-6 py-3 bg-[#C9A84C] text-[#1A1A1A] rounded-xl font-semibold text-sm
                   hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center gap-2 min-h-[44px]"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Applying...
            </>
          ) : (
            "Apply"
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <X className="w-4 h-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <Check className="w-4 h-4" />
          {success}
        </div>
      )}
    </div>
  );
}
