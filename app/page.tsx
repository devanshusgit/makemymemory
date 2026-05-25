import HeroSection        from "@/components/home/HeroSection";
import AnimatedStats      from "@/components/home/AnimatedStats";
import IntroSection       from "@/components/home/IntroSection";
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

      {/* Animated Stats */}
      <AnimatedStats />

      {/* 2. Intro — brand line only (no product grid) */}
      <IntroSection />

      {/* 3. Values — 4 cards */}
      <ValuesSection />

      {/* 4. Social proof — counter + video carousel */}
      <SocialProofSection />

      {/* 5. Reviews — star rating + media carousel */}
      <ReviewsSection />

      {/* 6. Final CTA */}
      <FinalCTA />
    </>
  );
}
