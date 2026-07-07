import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Category } from "@/lib/db/models/Category";
import { Product } from "@/lib/db/models/Product";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Get all categories sorted by sortOrder
    const categories = await Category.find().sort({ sortOrder: 1, createdAt: 1 }).lean();

    // For each category, count products
    const categoryStats = [];

    for (const category of categories) {
      const productCount = await Product.countDocuments({
        category: category.id,
      });

      categoryStats.push({
        id: category.id,
        title: category.title,
        description: category.description,
        sortOrder: category.sortOrder,
        productCount: productCount,
      });
    }

    // Separate into categories with and without products
    const withProducts = categoryStats.filter((c) => c.productCount > 0);
    const withoutProducts = categoryStats.filter((c) => c.productCount === 0);

    return NextResponse.json({
      success: true,
      totalCategories: categoryStats.length,
      categoriesWithProducts: {
        count: withProducts.length,
        items: withProducts,
      },
      categoriesComingSoon: {
        count: withoutProducts.length,
        items: withoutProducts,
      },
      summary: {
        total: categoryStats.length,
        withProducts: withProducts.length,
        withoutProducts: withoutProducts.length,
      },
    });
  } catch (error: any) {
    console.error("Error generating category report:", error);
    return NextResponse.json(
      { error: error.message ?? "Failed to generate report" },
      { status: 500 }
    );
  }
}
