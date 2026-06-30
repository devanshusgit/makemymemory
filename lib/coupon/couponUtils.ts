import { Coupon, ICoupon } from "@/lib/db/models/Coupon";
import { Order } from "@/lib/db/models/Order";

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
 * Ensure default coupon exists (COMBO20)
 */
export async function ensureDefaultCoupons(): Promise<void> {
  try {
    const defaultCoupon = await Coupon.findOne({ code: "COMBO20" });
    
    if (!defaultCoupon) {
      await Coupon.create({
        code: "COMBO20",
        discountType: "percentage",
        discountValue: 20,
        description: "20% off on all orders",
        applicableCategories: [],
        minOrderValue: 0,
        maxTotalUsage: 0,
        usageCount: 0,
        maxUsagePerUser: 1, // One-time use per user by default
        usedByUsers: [],
        couponType: "general",
        isActive: true,
        startDate: new Date(),
        expiryDate: null,
      });
    }
  } catch (error) {
    // Silently handle default coupon creation errors
  }
}

/**
 * Validate and calculate discount for a coupon
 */
export async function validateAndApplyCoupon(
  params: ApplyCouponParams
): Promise<CouponValidationResult> {
  const { couponCode, userId, subtotal, items } = params;

  try {
    // Find coupon
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return { valid: false, discount: 0, message: "Coupon not found" };
    }

    // Check expiry
    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
      return { valid: false, discount: 0, message: "Coupon has expired" };
    }

    // Check start date
    if (new Date() < coupon.startDate) {
      return { valid: false, discount: 0, message: "Coupon is not yet active" };
    }

    // Check minimum order value
    const minOrderValue = coupon.minOrderValue ?? 0;
    if (subtotal < minOrderValue) {
      return {
        valid: false,
        discount: 0,
        message: `Minimum order value of ₹${minOrderValue} required`,
      };
    }

    // Check total usage limit
    const maxTotalUsage = coupon.maxTotalUsage ?? 0;
    if (maxTotalUsage > 0 && (coupon.usageCount ?? 0) >= maxTotalUsage) {
      return { valid: false, discount: 0, message: "Coupon usage limit reached" };
    }

    // Check per-user usage limit
    const maxUsagePerUser = coupon.maxUsagePerUser ?? 0;
    if (maxUsagePerUser > 0) {
      const userUsageCount = (coupon.usedByUsers ?? []).filter((id) => id === userId).length;
      if (userUsageCount >= maxUsagePerUser) {
        return {
          valid: false,
          discount: 0,
          message: "You have already used this coupon maximum times",
        };
      }
    }

    // Check applicable categories
    const applicableCategories = coupon.applicableCategories ?? [];
    if (applicableCategories.length > 0) {
      const itemCategories = items.map((item) => item.category);
      const hasApplicableItem = itemCategories.some((cat) =>
        applicableCategories.includes(cat)
      );
      if (!hasApplicableItem) {
        return {
          valid: false,
          discount: 0,
          message: "This coupon is not applicable to your items",
        };
      }
    }

    // Check combo requirement
    if (coupon.couponType === "combo") {
      const uniqueCategories = new Set(items.map((item) => item.category)).size;
      if (uniqueCategories < (coupon.minCategoriesRequired || 2)) {
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

    return {
      valid: true,
      discount,
      message: "Coupon applied successfully",
      couponCode: coupon.code,
    };
  } catch (error) {
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
    return false;
  }
}
