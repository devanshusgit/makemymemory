import { notFound } from "next/navigation";
import ProductDetail from "@/components/shop/ProductDetail";
import { buildMeta, resolveBaseUrl } from "@/lib/seo";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { getProductPageData } from "@/lib/products/publicProduct";

interface Props { params: { slug: string } }

// Rendered on first request per product, then served from the CDN and
// re-rendered in the background at most every 5 minutes (ISR). The product
// and its options are loaded here, so they are in the HTML (visible to
// Google and AI crawlers) and the main image can load without waiting for
// client-side API calls.
export const revalidate = 300;

export async function generateMetadata({ params }: Props) {
  const { raw: product } = await getProductPageData(params.slug);
  if (product) {
    return buildMeta({
      title:       product.name,
      description: product.description,
      path:        `/shop/${product.slug}`,
    });
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

  // Same cached call as generateMetadata — one database round trip per render.
  // If the database is unavailable, ProductDetail falls back to loading in the browser.
  const { product: publicProduct, optionsByGroup, raw: product } = await getProductPageData(params.slug);

  // A slug with no product used to render a 200 with an empty body, which
  // Google indexes as a thin page. Serve a real 404 instead — but only when
  // the query actually ran: getProductPageData returns optionsByGroup: null
  // exclusively from its catch block, so a null there means "database down",
  // and 404-ing on that would cache a transient outage as a permanent 404.
  if (!product && optionsByGroup !== null) {
    notFound();
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
      <ProductDetail slug={params.slug} initialProduct={publicProduct} initialOptions={optionsByGroup} />
    </>
  );
}
