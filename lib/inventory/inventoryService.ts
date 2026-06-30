import { Inventory } from "@/lib/db/models/Inventory";
import { Order } from "@/lib/db/models/Order";

/**
 * Deduct inventory when order is confirmed
 */
export async function deductInventoryForOrder(orderId: string): Promise<boolean> {
  try {
    const order = await Order.findOne({ orderId }).lean();
    if (!order) return false;

    for (const item of order.items || []) {
      const inventory = await Inventory.findOne({ productId: item.productId });
      if (!inventory) {
        // Create inventory record if it doesn't exist
        await Inventory.create({
          productId: item.productId,
          quantity: -item.quantity,
          reserved: 0,
        });
      } else {
        // Deduct from inventory
        const newQuantity = Math.max(0, (inventory.quantity || 0) - (item.quantity || 1));
        await Inventory.findOneAndUpdate(
          { productId: item.productId },
          { 
            quantity: newQuantity,
            lastUpdated: new Date(),
          }
        );
      }
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Restore inventory when order is cancelled
 */
export async function restoreInventoryForOrder(orderId: string): Promise<boolean> {
  try {
    const order = await Order.findOne({ orderId }).lean();
    if (!order) return false;

    for (const item of order.items || []) {
      await Inventory.findOneAndUpdate(
        { productId: item.productId },
        { 
          $inc: { quantity: item.quantity || 1 },
          lastUpdated: new Date(),
        },
        { upsert: true }
      );
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if items are in stock
 */
export async function checkInventory(items: Array<{ productId: string; quantity: number }>): Promise<boolean> {
  try {
    for (const item of items) {
      const inventory = await Inventory.findOne({ productId: item.productId }).lean();
      if (!inventory || inventory.quantity < item.quantity) {
        return false;
      }
    }
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get inventory status for product
 */
export async function getInventoryStatus(productId: string) {
  try {
    const inventory = await Inventory.findOne({ productId }).lean();
    return {
      productId,
      quantity: inventory?.quantity || 0,
      reserved: inventory?.reserved || 0,
      available: Math.max(0, (inventory?.quantity || 0) - (inventory?.reserved || 0)),
    };
  } catch (error) {
    return null;
  }
}
