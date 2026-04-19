import HeroSection        from "@/components/home/HeroSection";
import IntroSection       from "@/components/home/IntroSection";
import ProductGridSection from "@/components/home/ProductGridSection";
import ValuesSection      from "@/components/home/ValuesSection";
import SocialProofSection from "@/components/home/SocialProofSection";
import ReviewsSection     from "@/components/home/ReviewsSection";
import FinalCTA           from "@/components/home/FinalCTA";
import { buildMeta }      from "@/lib/seo";
import { OrganizationJsonLd } from "@/components/seo/JsonLd";

export const metadata = buildMeta({
  title:       "Make My Memory | Personalised Gifts & Keepsakes",
  description: "Turn your favourite moments into beautiful, lasting keepsakes. Personalised photo books, custom frames, mugs, and more — crafted with love in India.",
  path:        "/",
});

export default function HomePage() {
  return (
    <>
      <OrganizationJsonLd />
      <HeroSection />

      {/* 2. Intro — brand line + featured products preview */}
      <IntroSection />

      {/* 3. Product grid — image-forward, Shop All CTA */}
      <ProductGridSection />

      {/* 4. Values — 4 cards */}
      <ValuesSection />

      {/* 5. Social proof — counter + video carousel */}
      <SocialProofSection />

      {/* 6. Reviews — star rating + media carousel */}
      <ReviewsSection />

      {/* 7. Final CTA */}
      <FinalCTA />
    </>
  );
}
