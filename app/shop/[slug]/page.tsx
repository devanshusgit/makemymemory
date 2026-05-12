import ProductDetail from "@/components/shop/ProductDetail";
import { buildMeta } from "@/lib/seo";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { connectDB } from "@/lib/db/connect";
import { Product } from "@/lib/db/models/Product";

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props) {
  try {
    await connectDB();
    const product = await Product.findOne({ slug: params.slug }).lean() as any;
    if (product) {
      return buildMeta({
        title:       product.name,
        description: product.description,
        path:        `/shop/${product.slug}`,
      });
    }
  } catch {
    // DB unavailable — fall through to default
  }
  return buildMeta({
    title:       "Product",
    description: "View product details.",
    path:        `/shop/${params.slug}`,
  });
}

export function generateStaticParams() {
  return [];
}

export default function ProductPage({ params }: Props) {
  return <ProductDetail slug={params.slug} />;
}
