import Link from "next/link";
import ProductCard from "@/components/shop/ProductCard";
import { connectDB } from "@/lib/db/connect";
import { Product } from "@/lib/db/models/Product";
import type { Product as ProductType } from "@/lib/types";

async function getFeaturedProducts(): Promise<ProductType[]> {
  try {
    await connectDB();
    const products = await Product.find({ inStock: true }).limit(2).lean();
    return products.map((p: any) => ({
      id: p._id.toString(),
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      originalPrice: p.originalPrice,
      images: p.images ?? [],
      videos: p.videos ?? [],
      category: p.category,
      badge: p.badge,
      inStock: p.inStock,
    }));
  } catch {
    return [];
  }
}

export default async function NotFound() {
  const products = await getFeaturedProducts();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 text-center"
      style={{ backgroundColor: "#FAF8F4" }}>
      <span className="font-serif font-bold text-7xl sm:text-8xl mb-2" style={{ color: "#C9A84C" }}>404</span>
      <h1 className="font-serif font-bold text-2xl sm:text-3xl mb-3" style={{ color: "#1A1A1A" }}>
        This page wandered off
      </h1>
      <p className="text-sm sm:text-base max-w-md mb-8" style={{ color: "#6B6560" }}>
        We couldn't find what you were looking for, but here's something worth a look instead.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-12">
        <Link href="/shop"
          className="inline-flex items-center justify-center px-7 py-3 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#1A1A1A" }}>
          Browse the Shop
        </Link>
        <Link href="/contact"
          className="inline-flex items-center justify-center px-7 py-3 rounded-full text-sm font-semibold transition-colors"
          style={{ border: "1px solid #C9A84C", color: "#1A1A1A" }}>
          Contact Us
        </Link>
      </div>

      {products.length > 0 && (
        <div className="w-full max-w-3xl">
          <p className="text-xs font-semibold tracking-widest uppercase mb-5" style={{ color: "#6B6560" }}>
            You might like
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
