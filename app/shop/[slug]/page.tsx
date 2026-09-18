import ProductDetail from "@/components/shop/ProductDetail";
import { buildMeta, resolveBaseUrl } from "@/lib/seo";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { connectDB } from "@/lib/db/connect";
import { Product } from "@/lib/db/models/Product";

interface Props { params: { slug: string } }

// Rendered on first request per product, then served from the CDN and
// re-rendered in the background at most every 5 minutes (ISR). The product UI
// itself still loads live data client-side.
export const revalidate = 300;

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

export default async function ProductPage({ params }: Props) {
  const baseUrl = resolveBaseUrl();
  const url = `${baseUrl}/shop/${params.slug}`;

  let product: any = null;
  try {
    await connectDB();
    product = await Product.findOne({ slug: params.slug }).lean();
  } catch {
    // DB unavailable — render the page without structured data rather than failing
  }

  return (
    <>
      {product && (
        <ProductJsonLd
          name={product.name}
          description={product.description}
          price={product.price}
          currency="INR"
          url={url}
          image={product.images?.[0]}
          availability={product.inStock ? "InStock" : "OutOfStock"}
        />
      )}
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: baseUrl },
          { name: "Shop", url: `${baseUrl}/shop` },
          { name: product?.name ?? "Product", url },
        ]}
      />
      <ProductDetail slug={params.slug} />
    </>
  );
}
