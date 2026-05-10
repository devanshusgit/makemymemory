import ProductDetail  from "@/components/shop/ProductDetail";
import { buildMeta }   from "@/lib/seo";
import { ALL_PRODUCTS } from "@/lib/data/products";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://makemymemory.in";

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props) {
  const product = ALL_PRODUCTS.find((p) => p.slug === params.slug);
  if (!product) return buildMeta({ title: "Product Not Found", description: "This product could not be found.", noIndex: true });
  return buildMeta({ title: product.name, description: product.description, path: `/shop/${product.slug}` });
}

// Keep static params for known products; dynamic slugs from DB also work at runtime
export function generateStaticParams() {
  return ALL_PRODUCTS.map((p) => ({ slug: p.slug }));
}

export default function ProductPage({ params }: Props) {
  const product = ALL_PRODUCTS.find((p) => p.slug === params.slug);
  return (
    <>
      {product && (
        <>
          <ProductJsonLd name={product.name} description={product.description} price={product.price}
            url={`${BASE_URL}/shop/${product.slug}`} availability={product.inStock ? "InStock" : "OutOfStock"} />
          <BreadcrumbJsonLd items={[
            { name: "Home", url: BASE_URL },
            { name: "Shop", url: `${BASE_URL}/shop` },
            { name: product.name, url: `${BASE_URL}/shop/${product.slug}` },
          ]} />
        </>
      )}
      <ProductDetail slug={params.slug} />
    </>
  );
}
