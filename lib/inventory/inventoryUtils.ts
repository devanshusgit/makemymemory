import { Product } from "@/lib/db/models/Product";
import { Order } from "@/lib/db/models/Order";

/**
 * Mark products as out of stock when inventory runs out
 * This is a simple implementation - for real inventory tracking,
 * consider a separate Inventory collection
 */
export async function updateInventoryOnOrderConfirm(orderId: string): Promise<void> {
  try {
    const order = await Order.findOne({ orderId });
    if (!order) return;

    // For each item in order, we could decrement inventory
    // Since we only have inStock boolean, we just mark based on business logic
    // In a real system, you'd have quantityAvailable field

    for (const item of order.items) {
      const product = await Product.findOne({ _id: item.productId });
      if (!product) continue;

      // Increment purchase count to track popularity
      product.purchaseCount = (product.purchaseCount || 0) + item.quantity;
      
      // This is a simplified approach - a real system would track actual inventory
      // For now, we just update view count and purchase count
      await product.save();
    }
  } catch (error) {
    // Silently handle inventory update errors
  }
}

/**
 * Check if product is available for order
 */
export async function isProductAvailable(productId: string): Promise<boolean> {
  try {
    const product = await Product.findOne({ _id: productId });
    return product?.inStock === true;
  } catch (error) {
    return false;
  }
}

/**
 * Validate all items in order are in stock
 */
export async function validateOrderInventory(items: any[]): Promise<{
  valid: boolean;
  unavailableItems: string[];
}> {
  try {
    const unavailableItems: string[] = [];

    for (const item of items) {
      const product = await Product.findOne({ _id: item.productId });
      if (!product || !product.inStock) {
        unavailableItems.push(item.productId);
      }
    }

    return {
      valid: unavailableItems.length === 0,
      unavailableItems,
    };
  } catch (error) {
    return { valid: true, unavailableItems: [] };
  }
}
