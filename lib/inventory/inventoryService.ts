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
 * Check if items are in stock for both Kit and Final stages
 */
export async function checkInventory(items: Array<{ productId: string; quantity: number }>): Promise<boolean> {
  try {
    for (const item of items) {
      const inventory = await Inventory.findOne({ productId: item.productId }).lean();
      if (!inventory) return false;
      const kitAvail = (inventory.kitQuantity || 0) - (inventory.kitReserved || 0);
      const finalAvail = (inventory.finalQuantity || 0) - (inventory.finalReserved || 0);
      if (kitAvail < item.quantity || finalAvail < item.quantity) {
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
      kitQuantity: inventory?.kitQuantity || 0,
      kitReserved: inventory?.kitReserved || 0,
      finalQuantity: inventory?.finalQuantity || 0,
      finalReserved: inventory?.finalReserved || 0,
      available: Math.max(0, (inventory?.quantity || 0) - (inventory?.reserved || 0)),
    };
  } catch (error) {
    return null;
  }
}

/**
 * Reserve stock (Kit & Final) when order is placed/confirmed
 */
export async function reserveStockForOrder(orderId: string): Promise<boolean> {
  try {
    const order = await Order.findOne({ orderId }).lean();
    if (!order) return false;

    for (const item of order.items || []) {
      await Inventory.findOneAndUpdate(
        { productId: item.productId },
        {
          $inc: {
            kitReserved: item.quantity,
            finalReserved: item.quantity,
            reserved: item.quantity, // overall fallback
          },
          lastUpdated: new Date()
        },
        { upsert: true }
      );
    }
    return true;
  } catch (error) {
    console.error("[reserveStockForOrder] Error:", error);
    return false;
  }
}

/**
 * Deduct Kit stock (dispatched Shipment 1)
 */
export async function deductKitStock(orderId: string): Promise<boolean> {
  try {
    const order = await Order.findOne({ orderId }).lean();
    if (!order) return false;

    for (const item of order.items || []) {
      const inventory = await Inventory.findOne({ productId: item.productId });
      if (inventory) {
        const newKitQty = Math.max(0, (inventory.kitQuantity || 0) - item.quantity);
        const newKitReserved = Math.max(0, (inventory.kitReserved || 0) - item.quantity);
        const newQty = Math.max(0, (inventory.quantity || 0) - item.quantity);
        const newReserved = Math.max(0, (inventory.reserved || 0) - item.quantity);

        await Inventory.updateOne(
          { productId: item.productId },
          {
            kitQuantity: newKitQty,
            kitReserved: newKitReserved,
            quantity: newQty,
            reserved: newReserved,
            lastUpdated: new Date(),
          }
        );
      }
    }
    return true;
  } catch (error) {
    console.error("[deductKitStock] Error:", error);
    return false;
  }
}

/**
 * Deduct Final stock (dispatched Shipment 2)
 */
export async function deductFinalStock(orderId: string): Promise<boolean> {
  try {
    const order = await Order.findOne({ orderId }).lean();
    if (!order) return false;

    for (const item of order.items || []) {
      const inventory = await Inventory.findOne({ productId: item.productId });
      if (inventory) {
        const newFinalQty = Math.max(0, (inventory.finalQuantity || 0) - item.quantity);
        const newFinalReserved = Math.max(0, (inventory.finalReserved || 0) - item.quantity);

        await Inventory.updateOne(
          { productId: item.productId },
          {
            finalQuantity: newFinalQty,
            finalReserved: newFinalReserved,
            lastUpdated: new Date(),
          }
        );
      }
    }
    return true;
  } catch (error) {
    console.error("[deductFinalStock] Error:", error);
    return false;
  }
}

/**
 * Release reserved stock (order cancelled/failed)
 */
export async function releaseReservedStock(orderId: string): Promise<boolean> {
  try {
    const order = await Order.findOne({ orderId }).lean();
    if (!order) return false;

    for (const item of order.items || []) {
      const inventory = await Inventory.findOne({ productId: item.productId });
      if (inventory) {
        const newKitReserved = Math.max(0, (inventory.kitReserved || 0) - item.quantity);
        const newFinalReserved = Math.max(0, (inventory.finalReserved || 0) - item.quantity);
        const newReserved = Math.max(0, (inventory.reserved || 0) - item.quantity);

        await Inventory.updateOne(
          { productId: item.productId },
          {
            kitReserved: newKitReserved,
            finalReserved: newFinalReserved,
            reserved: newReserved,
            lastUpdated: new Date(),
          }
        );
      }
    }
    return true;
  } catch (error) {
    console.error("[releaseReservedStock] Error:", error);
    return false;
  }
}
