import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Product } from "@/lib/db/models/Product";
import { ALL_PRODUCTS } from "@/lib/data/products";

export async function GET() {
  try {
    await connectDB();
    const dbProducts = await Product.find({ inStock: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    if (dbProducts.length > 0) {
      // Map DB products to the Product type shape
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
      }));
      return NextResponse.json({ products });
    }

    // Fallback to static data if DB is empty
    return NextResponse.json({ products: ALL_PRODUCTS });
  } catch {
    // DB unavailable — return static data
    return NextResponse.json({ products: ALL_PRODUCTS });
  }
}
