import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Product } from "@/lib/db/models/Product";
import { toPublicProduct } from "@/lib/products/publicProduct";
import { rankProducts } from "@/lib/products/ranking";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  // Query parameters
  const search = searchParams.get("search")?.trim() || "";
  const category = searchParams.get("category")?.trim() || "";
  const subcategory = searchParams.get("subcategory")?.trim().toLowerCase() || "";
  const minPrice = searchParams.get("minPrice") ? parseInt(searchParams.get("minPrice")!) : null;
  const maxPrice = searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) : null;
  // recommended (default: Best Seller, Popular, Best Value, New, then the rest),
  // newest, price-low, price-high, popular, rating
  const sort = searchParams.get("sort") || "recommended";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12", 10)));

  try {
    await connectDB();

    // Build filter
    const filter: Record<string, any> = {};

    if (category) {
      filter.category = category;
    }
    if (subcategory) {
      filter.subcategory = subcategory;
    }

    if (minPrice !== null || maxPrice !== null) {
      filter.price = {};
      if (minPrice !== null) filter.price.$gte = minPrice;
      if (maxPrice !== null) filter.price.$lte = maxPrice;
    }

    if (search) {
      // Partial, case-insensitive match (so "tin" finds "Tiny Treasure"),
      // consistent with the search suggestions on /shop.
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = new RegExp(escaped, "i");
      filter.$or = [{ name: pattern }, { description: pattern }, { category: pattern }];
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

    // Recommended order is by badge, then the admin's drag order, which Mongo
    // can't sort on directly — rank the (small) matching set here and page it.
    if (sort === "recommended") {
      const all = rankProducts((await Product.find(filter).lean()) as any[]);
      const total = all.length;
      return NextResponse.json(
        {
          products: all.slice((page - 1) * limit, page * limit).map(toPublicProduct),
          pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        },
        { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
      );
    }

    // Execute query with pagination
    const [dbProducts, total] = await Promise.all([
      Product.find(filter)
        .sort({ inStock: -1, ...sortObj })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    // An empty page is a legitimate 200 — the catalogue really has nothing
    // matching this filter.
    // The same answer for every visitor with the same filters, so let the CDN
    // serve it for a minute: a burst of shoppers sorting and filtering /shop
    // then costs one database query per distinct filter per minute, not one
    // per click. An Admin change shows up within about a minute.
    return NextResponse.json(
      {
        products: dbProducts.map(toPublicProduct),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch (error) {
    console.error("[products GET]", error);
    // A dead database must not look like a successful empty catalogue: that
    // 200 was cacheable, so the CDN kept serving an empty shop long after the
    // database recovered. 503 keeps the failure visible and uncached.
    return NextResponse.json(
      { error: "Catalogue temporarily unavailable" },
      { status: 503 }
    );
  }
}
