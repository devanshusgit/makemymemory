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

// Matches the existing Refund Policy (app/returns/page.tsx, section 4:
// "No cancellation once orders are placed" / "No refunds once orders are
// placed") and Terms of Service — every piece is made to order, so this
// page states the same rule rather than inventing a separate one.
const DEFAULT_CONTENT = `WHY ORDERS CAN'T BE CANCELLED
Every Make My Memory keepsake is made to order — production begins as soon as your order is placed, using the details, imprints, and customisation you've chosen. Because of this, orders cannot be cancelled once placed, in line with our Refund Policy.

DAMAGED OR INCORRECT ITEMS
This cancellation policy does not affect your rights if an item arrives damaged or incorrect. See our Refund Policy for how that's handled.

BEFORE YOU ORDER
If you're unsure about sizing, personalisation details, or timelines, please reach out before placing your order — our team is happy to help you get it right the first time.

QUESTIONS
For any questions about an existing order, contact us at support@makemymemory.in or via WhatsApp with your order ID.`;

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
