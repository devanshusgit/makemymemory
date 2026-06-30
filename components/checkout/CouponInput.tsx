"use client";

import { useState, useEffect } from "react";
import { Ticket, Check, X, Loader, ChevronRight, Gift } from "lucide-react";
import axios from "axios";

interface CouponInputProps {
  subtotal: number;
  items: Array<{ productId: string; category: string; quantity: number }>;
  userId: string;
  onCouponApplied: (discount: number, couponCode: string) => void;
  onCouponRemoved: () => void;
}

interface AvailableCoupon {
  _id: string;
  code: string;
  description?: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderValue?: number;
}

interface UserCoupon {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  description?: string;
  minOrderValue?: number;
  isUsed: boolean;
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
  const [userCoupon, setUserCoupon] = useState<UserCoupon | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<AvailableCoupon[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [showMoreOffers, setShowMoreOffers] = useState(true);

  // Fetch user's welcome coupon and available coupons on mount
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoadingCoupons(true);

        // Fetch user's welcome coupon
        const userCouponRes = await axios.get("/api/coupons/my-coupon", {
          params: { userId },
        });
        if (userCouponRes.data.coupon) {
          setUserCoupon(userCouponRes.data.coupon);
        }

        // Fetch public available coupons
        const publicRes = await axios.get("/api/coupons/public");
        setAvailableCoupons(publicRes.data.coupons || []);
      } catch (err) {
        // Silently handle coupon fetch errors
      } finally {
        setLoadingCoupons(false);
      }
    };

    if (userId) {
      fetchCoupons();
    }
  }, [userId]);

  const handleApplyCoupon = async (code?: string) => {
    const codeToApply = code || couponCode;

    if (!codeToApply.trim()) {
      setError("Please enter a coupon code");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Ensure items have correct format with category defaulting to "foil-imprints"
      const formattedItems = items.map((item) => ({
        productId: item.productId || "",
        category: item.category || "foil-imprints",
        quantity: item.quantity || 1,
      }));

      console.log("Items being sent:", formattedItems);
      console.log("Applying coupon:", {
        couponCode: codeToApply.toUpperCase(),
        userId,
        subtotal,
        items: formattedItems,
      });

      const response = await axios.post("/api/coupons/validate", {
        couponCode: codeToApply.toUpperCase(),
        userId,
        subtotal,
        items: formattedItems,
      });

      console.log("Coupon validation response:", response.data);

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
      console.error("Coupon error:", err);
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

  // Show applied state
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

  // Show input form
  return (
    <div className="space-y-4">
      {/* User's Welcome Coupon - Prominent */}
      {userCoupon && !applied && (
        <div className="bg-gradient-to-r from-[#C9A84C]/20 to-[#C9A84C]/10 border-2 border-[#C9A84C] rounded-2xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 rounded-lg bg-[#C9A84C] flex items-center justify-center shrink-0 mt-0.5">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#1A1A1A]">Your Welcome Offer!</p>
                <p className="text-xs text-stone-600 mt-0.5">{userCoupon.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-[#C9A84C]">
                    {userCoupon.code}
                  </span>
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-[#C9A84C] text-white">
                    {userCoupon.discountType === "percentage"
                      ? `${userCoupon.discountValue}% OFF`
                      : `₹${userCoupon.discountValue} OFF`}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleApplyCoupon(userCoupon.code)}
              disabled={loading || userCoupon.isUsed}
              className="px-4 py-2 bg-[#C9A84C] text-[#1A1A1A] rounded-lg font-semibold text-xs
                       hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shrink-0 whitespace-nowrap"
            >
              {loading ? "Applying..." : userCoupon.isUsed ? "Used" : "Apply Now"}
            </button>
          </div>
        </div>
      )}

      {/* Manual coupon input */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-stone-600 uppercase">Have another code?</label>
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
            onClick={() => handleApplyCoupon()}
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

      {/* More Offers section - only if coupons exist */}
      {availableCoupons && availableCoupons.length > 0 && (
        <div className="border-t border-stone-200 pt-4">
          <button
            onClick={() => setShowMoreOffers(!showMoreOffers)}
            className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-[#C9A84C]/10 to-[#C9A84C]/5 rounded-xl hover:from-[#C9A84C]/15 hover:to-[#C9A84C]/10 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🏷️</span>
              <span className="font-semibold text-sm text-[#1A1A1A]">Available Offers</span>
              {availableCoupons.length > 0 && (
                <span className="text-xs bg-[#C9A84C] text-white px-2 py-0.5 rounded-full">
                  {availableCoupons.length}
                </span>
              )}
            </div>
            <ChevronRight
              className={`w-4 h-4 text-stone-400 transition-transform ${
                showMoreOffers ? "rotate-90" : ""
              }`}
            />
          </button>

          {/* Available coupons list */}
          {showMoreOffers && (
            <div className="mt-3 space-y-2">
              {loadingCoupons ? (
                <div className="flex items-center justify-center py-4">
                  <Loader className="w-4 h-4 animate-spin text-stone-400" />
                </div>
              ) : (
                availableCoupons.map((coupon, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-xl hover:border-[#C9A84C] hover:bg-[#C9A84C]/5 transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-[#1A1A1A]">{coupon.code}</p>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#C9A84C] text-white">
                          {coupon.discountType === "percentage"
                            ? `${coupon.discountValue}% OFF`
                            : `₹${coupon.discountValue} OFF`}
                        </span>
                      </div>
                      {coupon.description && (
                        <p className="text-xs text-stone-500 mt-1 line-clamp-1">
                          {coupon.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleApplyCoupon(coupon.code)}
                      disabled={loading}
                      className="ml-2 px-4 py-2 bg-[#C9A84C] text-[#1A1A1A] rounded-lg font-semibold text-xs
                               hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0"
                    >
                      Apply
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
