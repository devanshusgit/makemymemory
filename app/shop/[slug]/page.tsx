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

// Product descriptions are often just the variant list, e.g.
// "( 1 Hand & Feet / Both hands / Both Feet )" — drop the wrapping brackets
// and dashes so the text reads as a sentence.
function cleanDescription(text: unknown): string {
  if (typeof text !== "string") return "";
  return text
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[\s(\[\-–—]+|[\s)\]\-–—]+$/g, "")
    .trim();
}

// Shortens text to `max` characters, ending on a whole list item ("a / b / c")
// or word. Returns "" when too little would be left to be useful.
function fitText(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, Math.max(max - 1, 0));
  const at = Math.max(cut.lastIndexOf(" / "), cut.lastIndexOf(", "), cut.lastIndexOf("; "));
  const kept = (at > 0 ? cut.slice(0, at) : cut.replace(/\s+\S*$/, "")).replace(/[\s,;/\-–—]+$/, "");
  return kept.length >= 12 ? `${kept}…` : "";
}

// Readable search/social snippet, kept to about 160 characters: the cleaned
// description is shortened (or left out) to fit around the fixed parts.
function productMetaDescription(product: { name: string; description?: string; price?: number }): string {
  const head = `${product.name} — personalised metallic hand & foot imprint frame, handmade in Mumbai.`;
  const tail = `${typeof product.price === "number" ? `From ₹${product.price.toLocaleString("en-IN")}. ` : ""}Free shipping across India.`;
  // Two joining spaces plus a closing full stop.
  let desc = fitText(cleanDescription(product.description), 160 - head.length - tail.length - 3);
  if (desc && !/[.!?…]$/.test(desc)) desc += ".";
  return [head, desc, tail].filter(Boolean).join(" ");
}

export async function generateMetadata({ params }: Props) {
  const { raw: product } = await getProductPageData(params.slug);
  if (product) {
    return buildMeta({
      title:       product.name,
      description: productMetaDescription(product),
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
  const { product: publicProduct, optionsByGroup, related, raw: product } = await getProductPageData(params.slug);

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
          description={productMetaDescription(product)}
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
      <ProductDetail slug={params.slug} initialProduct={publicProduct} initialOptions={optionsByGroup} initialRelated={related} />
    </>
  );
}
