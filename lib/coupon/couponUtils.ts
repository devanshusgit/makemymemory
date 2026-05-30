import { Coupon } from "@/lib/db/models/Coupon";
import { Order } from "@/lib/db/models/Order";
import { User } from "@/lib/db/models/User";

export interface CouponValidationResult {
  valid: boolean;
  discount: number;
  message: string;
  couponCode?: string;
}

export interface ApplyCouponParams {
  couponCode: string;
  userId: string;
  subtotal: number;
  items: Array<{ productId: string; category: string; quantity: number }>;
}

/**
 * Validate and calculate discount for a coupon
 */
export async function validateAndApplyCoupon(
  params: ApplyCouponParams
): Promise<CouponValidationResult> {
  const { couponCode, userId, subtotal, items } = params;

  try {
    console.log("=== COUPON VALIDATION START ===");
    console.log("Input:", { couponCode, userId, subtotal, itemsCount: items.length });

    // Find coupon
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
    });

    console.log("Coupon found:", coupon ? "YES" : "NO");
    if (coupon) {
      console.log("Coupon details:", {
        code: coupon.code,
        isActive: coupon.isActive,
        minOrderValue: coupon.minOrderValue,
        startDate: coupon.startDate,
        expiryDate: coupon.expiryDate,
      });
    }

    if (!coupon) {
      console.log("Coupon not found in database");
      return { valid: false, discount: 0, message: "Coupon not found" };
    }

    // Check expiry
    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
      console.log("Coupon expired");
      return { valid: false, discount: 0, message: "Coupon has expired" };
    }

    // Check start date
    if (new Date() < coupon.startDate) {
      console.log("Coupon not yet active");
      return { valid: false, discount: 0, message: "Coupon is not yet active" };
    }

    // Check minimum order value
    console.log("Checking min order value:", { subtotal, minOrderValue: coupon.minOrderValue });
    if (subtotal < coupon.minOrderValue) {
      console.log("Subtotal below minimum");
      return {
        valid: false,
        discount: 0,
        message: `Minimum order value of ₹${coupon.minOrderValue} required`,
      };
    }

    // Check total usage limit
    if (coupon.maxTotalUsage > 0 && coupon.usageCount >= coupon.maxTotalUsage) {
      console.log("Coupon usage limit reached");
      return { valid: false, discount: 0, message: "Coupon usage limit reached" };
    }

    // Check per-user usage limit
    if (coupon.maxUsagePerUser > 0) {
      const userUsageCount = coupon.usedByUsers.filter((id) => id === userId).length;
      console.log("User usage check:", { userId, userUsageCount, maxUsagePerUser: coupon.maxUsagePerUser });
      if (userUsageCount >= coupon.maxUsagePerUser) {
        console.log("User has reached usage limit");
        return {
          valid: false,
          discount: 0,
          message: "You have already used this coupon maximum times",
        };
      }
    }

    // Check applicable categories - SKIP if empty (applies to all categories)
    if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
      const itemCategories = items.map((item) => item.category || "foil-imprints");
      console.log("Category check:", { itemCategories, applicableCategories: coupon.applicableCategories });
      const hasApplicableItem = itemCategories.some((cat) =>
        coupon.applicableCategories.includes(cat)
      );
      if (!hasApplicableItem) {
        console.log("No applicable items");
        return {
          valid: false,
          discount: 0,
          message: "This coupon is not applicable to your items",
        };
      }
    } else {
      console.log("Coupon applies to all categories - skipping category check");
    }

    // Check combo requirement
    if (coupon.couponType === "combo") {
      const uniqueCategories = new Set(items.map((item) => item.category)).size;
      console.log("Combo check:", { uniqueCategories, minCategoriesRequired: coupon.minCategoriesRequired });
      if (uniqueCategories < (coupon.minCategoriesRequired || 2)) {
        console.log("Not enough categories");
        return {
          valid: false,
          discount: 0,
          message: `Buy from at least ${coupon.minCategoriesRequired || 2} different categories to use this coupon`,
        };
      }
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (subtotal * coupon.discountValue) / 100;
    } else {
      discount = coupon.discountValue;
    }

    // Ensure discount doesn't exceed subtotal
    discount = Math.min(discount, subtotal);

    console.log("=== COUPON VALIDATION SUCCESS ===");
    console.log("Discount calculated:", { discount, discountType: coupon.discountType, discountValue: coupon.discountValue });

    return {
      valid: true,
      discount,
      message: "Coupon applied successfully",
      couponCode: coupon.code,
    };
  } catch (error) {
    console.error("=== COUPON VALIDATION ERROR ===", error);
    return { valid: false, discount: 0, message: "Error validating coupon" };
  }
}

/**
 * Apply coupon to order (update usage)
 */
export async function applyCouponToOrder(
  couponCode: string,
  userId: string
): Promise<boolean> {
  try {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (!coupon) return false;

    // Update usage count
    coupon.usageCount += 1;

    // Add user to usedByUsers if not already there
    if (!coupon.usedByUsers.includes(userId)) {
      coupon.usedByUsers.push(userId);
    }

    await coupon.save();
    return true;
  } catch (error) {
    console.error("Error applying coupon:", error);
    return false;
  }
}

/**
 * Get signup discount coupon
 */
export async function getSignupDiscount(): Promise<ICoupon | null> {
  try {
    const coupon = await Coupon.findOne({
      couponType: "signup",
      isActive: true,
      startDate: { $lte: new Date() },
      $or: [{ expiryDate: null }, { expiryDate: { $gte: new Date() } }],
    });
    return coupon;
  } catch (error) {
    console.error("Error getting signup discount:", error);
    return null;
  }
}

/**
 * Get second order discount coupon
 */
export async function getSecondOrderDiscount(): Promise<ICoupon | null> {
  try {
    const coupon = await Coupon.findOne({
      couponType: "second_order",
      isActive: true,
      startDate: { $lte: new Date() },
      $or: [{ expiryDate: null }, { expiryDate: { $gte: new Date() } }],
    });
    return coupon;
  } catch (error) {
    console.error("Error getting second order discount:", error);
    return null;
  }
}

/**
 * Check if user is eligible for second order discount
 */
export async function isEligibleForSecondOrderDiscount(
  userId: string
): Promise<boolean> {
  try {
    const orderCount = await Order.countDocuments({
      "shippingAddress.email": userId,
    });
    return orderCount === 1; // Eligible if they have exactly 1 order
  } catch (error) {
    console.error("Error checking second order eligibility:", error);
    return false;
  }
}

/**
 * Generate random coupon code
 */
export function generateCouponCode(prefix: string = "MMM"): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = prefix;
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Check if coupon code already exists
 */
export async function couponCodeExists(code: string): Promise<boolean> {
  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    return !!coupon;
  } catch (error) {
    console.error("Error checking coupon code:", error);
    return false;
  }
}

import { ICoupon } from "@/lib/db/models/Coupon";
