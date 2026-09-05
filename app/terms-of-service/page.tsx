import { buildMeta } from "@/lib/seo";
import { connectDB } from "@/lib/db/connect";
import { Policy } from "@/lib/db/models/Policy";

export const metadata = buildMeta({
  title:       "Terms & Conditions",
  description: "Make My Memory's Terms of Service — how personalised orders and product images work.",
  path:        "/terms-of-service",
});

/* ─── Hardcoded fallback content ──────────────────────────────────────────── */
const SECTIONS = [
  {
    heading: "Overview",
    body: `This website is operated by Make My Memory. Throughout the site, the terms "we", "us", and "our" refer to Make My Memory. By accessing our website and purchasing our products, you agree to be bound by the following Terms of Service, including all policies and conditions referenced on this website.

By using our website, placing an order, or interacting with our services, you acknowledge that you have read, understood, and agreed to these Terms of Service. If you do not agree with any part of these terms, please do not use our website or services.

As all our products are personalized and custom-made, customers are responsible for providing accurate information, photographs, handprints, footprints, paw prints, artwork, and personalization details required for order completion. We are not responsible for errors resulting from incorrect information provided by the customer.

We reserve the right to update, modify, or replace any part of these Terms of Service at any time without prior notice. Continued use of our website following any changes constitutes acceptance of those changes.`,
  },
  {
    heading: "Orders & Personalisation",
    body: `All products offered by Make My Memory are custom-made to order. Once artwork approval has been provided and production has commenced, changes, cancellations, or refunds may not be possible. Customers are encouraged to carefully review all details before approving their order.`,
  },
  {
    heading: "Product Images",
    body: `We make every effort to display product colours, designs, and finishes as accurately as possible. However, slight variations may occur due to screen settings, lighting, printing processes, and the handmade nature of our products.`,
  },
  {
    heading: "Contact",
    body: `If you have any questions regarding these Terms of Service, please contact us through our website, email, or social media channels. We are always happy to assist you.`,
  },
];

async function getPolicy() {
  try {
    await connectDB();
    const policy = await Policy.findOne({ slug: "terms-of-service" });
    return policy || null;
  } catch (error) {
    console.error("Failed to fetch terms of service:", error);
    return null;
  }
}

export default async function TermsPage() {
  let policy = null;
  try {
    policy = await getPolicy();
  } catch (err) {
    console.error("Error loading policy:", err);
  }

  const hasCustomContent = policy?.content && (policy.content as string).trim().length > 0;
  const effectiveDate = policy?.effectiveDate
    ? new Date(policy.effectiveDate).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
    : "13 July 2025";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF8F4" }}>
      {/* Hero */}
      <div className="py-14 sm:py-20" style={{ backgroundColor: "#1A1A1A" }}>
        <div className="section-wrap text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase mb-5"
            style={{ color: "#C9A84C" }}>
            <span className="w-5 h-px" style={{ backgroundColor: "#C9A84C" }} />
            Legal
            <span className="w-5 h-px" style={{ backgroundColor: "#C9A84C" }} />
          </span>
          <h1 className="font-serif font-bold text-white leading-tight mb-3"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
            Terms &amp; Conditions
          </h1>
          <p className="text-sm" style={{ color: "rgba(232,213,163,0.6)" }}>
            Effective Date: {effectiveDate}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="section-wrap py-12 sm:py-16">
        <div className="max-w-3xl mx-auto space-y-5">

          {hasCustomContent
            ? /* Render CMS content if admin has saved it */
              (policy!.content as string).split("\n\n").map((section: string, idx: number) => {
                const lines = section.split("\n");
                const heading = lines[0];
                const paras = lines.slice(1);
                return (
                  <div key={idx} className="bg-white rounded-2xl p-6 sm:p-8"
                    style={{ border: "1px solid rgba(201,168,76,0.15)" }}>
                    <h2 className="font-serif font-bold text-lg mb-4" style={{ color: "#1A1A1A" }}>{heading}</h2>
                    <div className="space-y-3">
                      {paras.map((p: string, i: number) =>
                        p.trim() ? (
                          <p key={i} className="text-sm leading-relaxed" style={{ color: "#6B6560" }}>{p}</p>
                        ) : null
                      )}
                    </div>
                  </div>
                );
              })
            : /* Render hardcoded structured sections */
              SECTIONS.map((section, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-6 sm:p-8"
                  style={{ border: "1px solid rgba(201,168,76,0.15)" }}>
                  <h2 className="font-serif font-bold text-lg mb-4" style={{ color: "#1A1A1A" }}>
                    {section.heading}
                  </h2>
                  <div className="space-y-3">
                    {section.body.split("\n\n").map((para, i) => (
                      <p key={i} className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "#6B6560" }}>
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              ))
          }

          {/* Footer note */}
          <p className="text-xs text-center pt-4" style={{ color: "#B0A89A" }}>
            © {new Date().getFullYear()} Make My Memory. All rights reserved. |{" "}
            <a href="/privacy-policy" style={{ color: "#C9A84C" }}>Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
