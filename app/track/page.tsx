import TrackClient from "@/components/track/TrackClient";
import { buildMeta } from "@/lib/seo";

export const metadata = buildMeta({
  title:       "Track Your Order",
  description: "Track your personalised gift order in real time. Enter your Order ID and contact details to see live status updates.",
  path:        "/track",
});

export default function TrackPage() {
  return (
    <div className="bg-canvas min-h-screen">
      {/* Hero */}
      <div className="bg-hero py-14 sm:py-20">
        <div className="section-wrap text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold
                           tracking-widest uppercase text-sage mb-5">
            <span className="w-5 h-px bg-sage" />
            Order Tracking
            <span className="w-5 h-px bg-sage" />
          </span>
          <h1
            className="font-serif font-bold text-white leading-tight mb-4"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "-0.02em" }}
          >
            Where&apos;s My Order?
          </h1>
          <p className="text-white/60 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            Enter your Order ID and the phone number or email you used at checkout.
          </p>
        </div>
      </div>

      <TrackClient />
    </div>
  );
}
