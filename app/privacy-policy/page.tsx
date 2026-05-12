import { buildMeta } from "@/lib/seo";
import { connectDB } from "@/lib/db/connect";
import { Policy } from "@/lib/db/models/Policy";

export const metadata = buildMeta({
  title:       "Privacy Policy",
  description: "Make My Memory's privacy policy — how we collect, use, and protect your information.",
  path:        "/privacy-policy",
});

const DEFAULT_CONTENT = `Make My Memory is committed to protecting the privacy of visitors to this site (the "website"). At Make My Memory, we want you to have an enjoyable shopping experience. And while it is necessary for us to collect certain personal information, we respect and protect your right to privacy as set forth in this Privacy Policy. The nature of the information collected (if any), is simply to allow us to contact you should you choose to or for us to contact you on the basis of a business relation you establish by purchasing or making an order online. This is solely for the purpose of being able to follow up on any order that you may initiate on this site. The information stored does NOT include any financial details, other than details related to purchase or interest of products by you, and is purely restricted to order, contact and preferences. We strictly do NOT capture or store any account or card numbers.

We may collect your session, contact and order information on our server and on your browser in the form of session storage or cookies. We will NOT share it with any third party, other than those necessary to make the delivery of the product to you, marketing material to you and improvement purposes. We may send marketing material in the form of emails or common digital mediums, to your contact information also. We may also study your spending patterns to improve our service offering. Make My Memory reserves the right to make alterations to this policy in the future without prior notice.

This privacy policy applies to the website. You agree that your use of the website signifies your assent to this Privacy Policy. If you do not agree with this Privacy Policy, please do not use the website.`;

async function getPolicy() {
  try {
    await connectDB();
    const policy = await Policy.findOne({ slug: "privacy-policy" });
    return policy || null;
  } catch (error) {
    console.error("Failed to fetch privacy policy:", error);
    return null;
  }
}

export default async function PrivacyPolicyPage() {
  let policy = null;
  try {
    policy = await getPolicy();
  } catch (err) {
    console.error("Error loading policy:", err);
  }
  
  const content = policy?.content || DEFAULT_CONTENT;
  const effectiveDate = policy?.effectiveDate ? new Date(policy.effectiveDate).toLocaleDateString("en-IN") : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF8F4" }}>
      <div className="py-14 sm:py-20" style={{ backgroundColor: "#1A1A1A" }}>
        <div className="section-wrap text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase mb-5"
            style={{ color: "#C9A84C" }}>
            <span className="w-5 h-px" style={{ backgroundColor: "#C9A84C" }} />
            Legal
            <span className="w-5 h-px" style={{ backgroundColor: "#C9A84C" }} />
          </span>
          <h1 className="font-serif font-bold text-white leading-tight"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
            Privacy Policy
          </h1>
        </div>
      </div>

      <div className="section-wrap py-12 sm:py-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-6 sm:p-10 space-y-5"
            style={{ border: "1px solid rgba(201,168,76,0.15)" }}>

            <h2 className="font-serif font-bold text-2xl" style={{ color: "#1A1A1A" }}>PRIVACY POLICY</h2>

            {effectiveDate && (
              <p className="text-xs text-stone-400 italic">
                Effective Date: {effectiveDate}
              </p>
            )}

            {content.split("\n\n").map((paragraph: string, idx: number) => (
              <p key={idx} className="text-sm leading-relaxed" style={{ color: "#6B6560" }}>
                {paragraph}
              </p>
            ))}

          </div>
        </div>
      </div>
    </div>
  );
}
