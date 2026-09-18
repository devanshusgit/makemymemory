import HeroSection        from "@/components/home/HeroSection";
import AnimatedStats      from "@/components/home/AnimatedStats";
import IntroSection       from "@/components/home/IntroSection";
import HomeGallerySection  from "@/components/home/HomeGallerySection";
import ProductGridSection from "@/components/home/ProductGridSection";
import ValuesSection      from "@/components/home/ValuesSection";
import SocialProofSection from "@/components/home/SocialProofSection";
import FinalCTA           from "@/components/home/FinalCTA";
import { buildMeta, resolveBaseUrl } from "@/lib/seo";
import { OrganizationJsonLd } from "@/components/seo/JsonLd";
import { getPublicProducts } from "@/lib/products/publicProduct";

// Featured products are loaded here so they ship in the HTML; the page is
// cached on the CDN and refreshed at most every 5 minutes.
export const revalidate = 300;

export function generateMetadata() {
  return buildMeta({
    title:       "Make My Memory | Baby Handprint & Footprint Gold Foil Frames",
    description: "Personalised gold foil handprint and footprint frames made from your baby's own imprint — handcrafted in Mumbai, shipped across India.",
    path:        "/",
  });
}

export default async function HomePage() {
  const featuredProducts = await getPublicProducts(4);
  return (
    <>
      <OrganizationJsonLd url={resolveBaseUrl()} />
      <HeroSection />

      <div className="bg-site-pattern">
        {/* Animated Stats */}
        <AnimatedStats />

        {/* Homepage Gallery Preview */}
        <HomeGallerySection />

        {/* 2. Intro — brand line only (no product grid) */}
        <IntroSection />

        {/* Products Showcase */}
        <ProductGridSection initialProducts={featuredProducts.length ? featuredProducts : undefined} />

        {/* 3. Values — 4 cards */}
        <ValuesSection />

        {/* 4. Social proof — counter + video carousel */}
        <SocialProofSection />
      </div>

      {/* 6. Final CTA */}
      <FinalCTA />
    </>
  );
}