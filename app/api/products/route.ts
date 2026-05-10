import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Product } from "@/lib/db/models/Product";
import { ALL_PRODUCTS } from "@/lib/data/products";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  // Query parameters
  const search = searchParams.get("search")?.trim() || "";
  const category = searchParams.get("category")?.trim() || "";
  const minPrice = searchParams.get("minPrice") ? parseInt(searchParams.get("minPrice")!) : null;
  const maxPrice = searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) : null;
  const sort = searchParams.get("sort") || "newest"; // newest, price-low, price-high, popular, rating
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12", 10)));

  try {
    await connectDB();

    // Build filter
    const filter: Record<string, any> = { inStock: true };

    if (category) {
      filter.category = category;
    }

    if (minPrice !== null || maxPrice !== null) {
      filter.price = {};
      if (minPrice !== null) filter.price.$gte = minPrice;
      if (maxPrice !== null) filter.price.$lte = maxPrice;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort
    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest:      { createdAt: -1 },
      "price-low": { price: 1 },
      "price-high": { price: -1 },
      popular:     { viewCount: -1, purchaseCount: -1 },
      rating:      { avgRating: -1, reviewCount: -1 },
    };

    const sortObj = sortMap[sort] || sortMap.newest;

    // Execute query with pagination
    const [dbProducts, total] = await Promise.all([
      Product.find(filter)
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    if (dbProducts.length > 0) {
      const products = dbProducts.map((p: any) => ({
        id:            p._id.toString(),
        name:          p.name,
        slug:          p.slug,
        description:   p.description,
        price:         p.price,
        originalPrice: p.originalPrice,
        images:        p.images || [],
        videos:        p.videos || [],
        category:      p.category,
        badge:         p.badge,
        inStock:       p.inStock,
        avgRating:     p.avgRating || 0,
        reviewCount:   p.reviewCount || 0,
      }));

      return NextResponse.json({
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    }

    // Fallback to static data if DB is empty
    return NextResponse.json({
      products: ALL_PRODUCTS,
      pagination: { page: 1, limit, total: ALL_PRODUCTS.length, pages: 1 },
    });
  } catch (error) {
    console.error("[products GET]", error);
    // DB unavailable — return static data
    return NextResponse.json({
      products: ALL_PRODUCTS,
      pagination: { page: 1, limit, total: ALL_PRODUCTS.length, pages: 1 },
    });
  }
}
