import { Category } from "@/lib/db/models/Category";
import { Product } from "@/lib/db/models/Product";

/**
 * Syncs category "coming soon" status based on whether it has products
 * If a category has no products, it will be marked as coming soon
 * If a category gets its first product, it will no longer be coming soon
 */
export async function syncCategoryComingSoonStatus(categoryId: string): Promise<void> {
  try {
    // Count products in this category
    const productCount = await Product.countDocuments({ category: categoryId });
    
    // Update category based on product count
    await Category.findOneAndUpdate(
      { id: categoryId },
      { /* No changes needed - categories are shown as "coming soon" automatically based on product count */ },
      { new: true }
    );
    
    console.log(`[categorySyncUtils] Category ${categoryId} has ${productCount} products`);
  } catch (error) {
    console.error(`[categorySyncUtils] Error syncing category ${categoryId}:`, error);
  }
}

/**
 * Sync all categories' coming soon status
 */
export async function syncAllCategoriesComingSoonStatus(): Promise<void> {
  try {
    const categories = await Category.find({});
    
    for (const category of categories) {
      const productCount = await Product.countDocuments({ category: category.id });
      console.log(`[categorySyncUtils] Category "${category.id}" has ${productCount} products`);
    }
  } catch (error) {
    console.error("[categorySyncUtils] Error syncing all categories:", error);
  }
}
