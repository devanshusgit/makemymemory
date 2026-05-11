import ProductDetail  from "@/components/shop/ProductDetail";
import { buildMeta }   from "@/lib/seo";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://makemymemory.in";

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props) {
  // Try to fetch product from API for metadata
  try {
    const res = await fetch(`${BASE_URL}/api/products?search=${params.slug}`, { cache: "no-store" });
    const data = await res.json();
    const product = data.products?.[0];
    if (product) {
      return buildMeta({ title: product.name, description: product.description, path: `/shop/${product.slug}` });
    }
  } catch (error) {
    console.error("Failed to fetch product metadata:", error);
  }
  return buildMeta({ title: "Product", description: "View product details.", path: `/shop/${params.slug}` });
}

// Generate static params for known products; dynamic slugs from DB also work at runtime
export function generateStaticParams() {
  // Since products are now in the database, return empty array
  // Next.js will handle dynamic routes at runtime
  return [];
}

export default function ProductPage({ params }: Props) {
  return (
    <>
      <ProductDetail slug={params.slug} />
    </>
  );
}
