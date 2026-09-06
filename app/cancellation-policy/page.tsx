import Link from "next/link";
import { buildMeta } from "@/lib/seo";
import { connectDB } from "@/lib/db/connect";
import { Policy } from "@/lib/db/models/Policy";

export function generateMetadata() {
  return buildMeta({
    title:       "Cancellation Policy",
    description: "Make My Memory's order cancellation policy.",
    path:        "/cancellation-policy",
  });
}

// PLACEHOLDER — replace via Admin → Policies once reviewed. Since every
// product here is made to order, a generic "cancel anytime" policy is
// probably wrong; this draft assumes cancellation is only possible before
// the imprint kit ships. Confirm the real cutoff and terms before relying
// on this.
const DEFAULT_CONTENT = `CANCELLATION WINDOW
[PLACEHOLDER — confirm before publishing] Orders can be cancelled for a full refund within 24 hours of placing the order, provided the imprint kit has not yet been dispatched. Once the kit has shipped, the order cannot be cancelled since production has started.

AFTER THE KIT IS DISPATCHED
[PLACEHOLDER] Once your baby's imprints are received and production of the finished keepsake has begun, the order cannot be cancelled, as each piece is handmade specifically for you.

HOW TO CANCEL
[PLACEHOLDER] To request a cancellation within the eligible window, contact support@makemymemory.in or WhatsApp us with your order ID. Approved cancellations are refunded within [X] business days to the original payment method.`;

async function getPolicy() {
  try {
    await connectDB();
    const policy = await Policy.findOne({ slug: "cancellation-policy" });
    return policy || null;
  } catch (error) {
    console.error("Failed to fetch cancellation policy:", error);
    return null;
  }
}

export default async function CancellationPolicyPage() {
  let policy = null;
  try {
    policy = await getPolicy();
  } catch (err) {
    console.error("Error loading policy:", err);
  }

  const content = policy?.content || DEFAULT_CONTENT;
  const effectiveDate = policy?.effectiveDate ? new Date(policy.effectiveDate).toLocaleDateString("en-IN") : null;
  const isPlaceholder = !policy;

  const sections = content.split("\n\n").map((section: string) => {
    const lines = section.split("\n");
    const heading = lines[0];
    const paras = lines.slice(1).filter((p: string) => p.trim());
    return { heading, paras };
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF8F4" }}>
      <div className="py-14 sm:py-20" style={{ backgroundColor: "#1A1A1A" }}>
        <div className="section-wrap text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase mb-5"
            style={{ color: "#C9A84C" }}>
            <span className="w-5 h-px" style={{ backgroundColor: "#C9A84C" }} />
            Policy
            <span className="w-5 h-px" style={{ backgroundColor: "#C9A84C" }} />
          </span>
          <h1 className="font-serif font-bold text-white leading-tight"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
            Cancellation Policy
          </h1>
          {effectiveDate && (
            <p className="text-xs text-stone-400 italic mt-2">
              Effective Date: {effectiveDate}
            </p>
          )}
        </div>
      </div>

      <div className="section-wrap py-12 sm:py-16">
        <div className="max-w-2xl mx-auto space-y-5">

          {isPlaceholder && (
            <div className="rounded-2xl p-5 text-sm" style={{ backgroundColor: "#FFF4E5", border: "1px solid #F0C36D", color: "#7A5A00" }}>
              This is placeholder text, not yet reviewed or confirmed — edit it in Admin → Policies before relying on it.
            </div>
          )}

          {sections.map((s: { heading: string; paras: string[] }, idx: number) => (
            <div key={idx} className="bg-white rounded-2xl p-6 sm:p-8 space-y-4"
              style={{ border: "1px solid rgba(201,168,76,0.15)" }}>
              <h2 className="font-serif font-bold text-xl" style={{ color: "#1A1A1A" }}>{s.heading}</h2>
              <div className="space-y-3">
                {s.paras.map((p: string, i: number) => (
                  <p key={i} className="text-sm leading-relaxed" style={{ color: "#6B6560" }}>{p}</p>
                ))}
              </div>
            </div>
          ))}

          <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: "#1A1A1A" }}>
            <p className="text-white font-semibold mb-2">Questions about cancelling an order?</p>
            <p className="text-sm mb-5" style={{ color: "rgba(232,213,163,0.65)" }}>
              Email us at support@makemymemory.in
            </p>
            <Link href="/contact"
              className="inline-flex items-center justify-center px-7 py-3 rounded-full text-sm font-semibold
                         transition-all duration-300 hover:bg-[#C9A84C] hover:text-[#1A1A1A]"
              style={{ border: "1.5px solid #C9A84C", color: "#C9A84C" }}>
              Contact Us
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
