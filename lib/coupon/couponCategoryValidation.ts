import { Coupon } from "@/lib/db/models/Coupon";

/**
 * Validate if coupon applies to the items in order
 */
export async function validateCouponCategories(
  couponCode: string,
  items: Array<{ category: string }>
): Promise<{ valid: boolean; message?: string }> {
  try {
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
    });

    if (!coupon) {
      return { valid: false, message: "Coupon not found" };
    }

    // If no category restrictions, it applies to all items
    if (!coupon.applicableCategories || coupon.applicableCategories.length === 0) {
      return { valid: true };
    }

    // Check if at least one item matches applicable categories
    const itemCategories = items.map((item) => item.category);
    const hasApplicableItem = itemCategories.some((category) =>
      coupon.applicableCategories.includes(category)
    );

    if (!hasApplicableItem) {
      const categories = coupon.applicableCategories.join(", ");
      return {
        valid: false,
        message: `This coupon only applies to: ${categories}`,
      };
    }

    return { valid: true };
  } catch (error) {
    return { valid: true }; // Allow if validation fails
  }
}

/**
 * Get all valid coupons for specific product categories
 */
export async function getValidCouponsForCategories(
  categories: string[]
): Promise<any[]> {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      startDate: { $lte: new Date() },
      $or: [{ expiryDate: null }, { expiryDate: { $gte: new Date() } }],
      $or: [
        { applicableCategories: { $size: 0 } }, // No restrictions
        { applicableCategories: { $in: categories } }, // Applies to these categories
      ],
    });

    return coupons;
  } catch (error) {
    return [];
  }
}
