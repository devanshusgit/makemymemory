import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Product } from "@/lib/db/models/Product";

/**
 * GET /api/recommendations?productId=<id>&limit=4
 *
 * Returns similar products based on:
 * 1. Same category
 * 2. Similar price range
 * 3. High ratings
 * 4. Popularity (view count)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const limit = Math.min(10, Math.max(1, parseInt(searchParams.get("limit") || "4", 10)));

  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  try {
    await connectDB();

    // Get the current product
    const currentProduct = await Product.findById(productId).lean();
    if (!currentProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Define price range (±30%)
    const priceRange = currentProduct.price * 0.3;
    const minPrice = currentProduct.price - priceRange;
    const maxPrice = currentProduct.price + priceRange;

    // Find similar products
    const recommendations = await Product.find({
      _id: { $ne: productId },
      category: currentProduct.category,
      inStock: true,
      price: { $gte: minPrice, $lte: maxPrice },
    })
      .sort({
        avgRating: -1,
        reviewCount: -1,
        viewCount: -1,
      })
      .limit(limit)
      .lean();

    // If not enough products in same category/price range, expand search
    if (recommendations.length < limit) {
      const additionalCount = limit - recommendations.length;
      const additionalProducts = await Product.find({
        _id: { $ne: productId, $nin: recommendations.map((p) => p._id) },
        category: currentProduct.category,
        inStock: true,
      })
        .sort({ avgRating: -1, viewCount: -1 })
        .limit(additionalCount)
        .lean();

      recommendations.push(...additionalProducts);
    }

    // Map to response format
    const products = recommendations.map((p: any) => ({
      id: p._id.toString(),
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      originalPrice: p.originalPrice,
      images: p.images || [],
      videos: p.videos || [],
      category: p.category,
      badge: p.badge,
      inStock: p.inStock,
      avgRating: p.avgRating || 0,
      reviewCount: p.reviewCount || 0,
    }));

    return NextResponse.json({ products });
  } catch (error) {
    console.error("[recommendations]", error);
    return NextResponse.json({ products: [] });
  }
}
