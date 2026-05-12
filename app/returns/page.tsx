import Link from "next/link";
import { buildMeta } from "@/lib/seo";
import { connectDB } from "@/lib/db/connect";
import { Policy } from "@/lib/db/models/Policy";

export const metadata = buildMeta({
  title:       "Refund Policy",
  description: "Make My Memory's payment and refund policy.",
  path:        "/returns",
});

const DEFAULT_CONTENT = `1. Introduction
1.1 This Payment and Refund Policy ('Policy') outlines the procedures and guidelines followed by Make My Memory regarding payments for products and services offered on the Make My Memory website (the 'Website') and the associated refund processes.
1.2 By placing an order or making a purchase on the Website, you acknowledge that you have read, understood, and agree to the terms of this Policy and any future amendments or modifications.

2. Payment Methods
2.1 Accepted Payment Methods: We accept various payment methods for the convenience of our customers. These may include:
2.1.1 Credit or debit card payments: We accept major credit and debit cards, including Visa, Mastercard, RuPay and American Express.
2.1.2 Online payment platforms: We may offer the option to make payments using trusted online payment platforms such as PayTM and Google Pay.
2.1.3 Bank transfers: In certain cases, we may accept bank transfers. Please contact our customer support for further instructions.
2.2 Payment Security: We prioritize the security of your payment information. We use industry-standard encryption and security measures to protect your payment details during transmission and storage. However, all payments are processed by the payment gateway provider.
2.3 Payment Authorization: By providing your payment information, you authorize us to charge the total order amount to the selected payment method. You also represent and warrant that you are the authorized user of the payment method and have sufficient funds or credit available to cover the transaction.

3. Pricing and Taxes
3.1 Product Prices: The prices displayed on the Website are in INR and are subject to change without notice. The final price for your order, including any applicable taxes, shipping fees, or additional charges, will be displayed during the checkout process.
3.2 Taxes: Depending on your shipping destination and local regulations, certain taxes, duties, or other charges may apply to your purchase. Please note that you are responsible for any such taxes or charges imposed by your local authorities.

4. Refund Policy
4.1 No cancellation once orders are placed.
4.2 No refunds once orders are placed.
4.3 If the refund is approved in case of damaged product only, and after written confirmation from our team, the amount for the item will be refunded within 7 to 15 business days.
4.4 No refund for international orders.
4.5 No cancellation for international orders.

5. Refund Process
5.1 To initiate a refund for an order that has not yet been prepared, please contact our customer support team. They will guide you through the process and provide you with the necessary instructions.
5.1.1 For payments made through online payment platforms: The refund will be processed through the respective payment platform, following their refund procedures and timelines.
5.2 Non-Refundable Items: Due to the nature of handcasting and customization services, certain items may not be eligible for a refund unless they are damaged. These items may include all casting kits, all types and sizes of frames, and any material sold on our website.
5.3 Return Shipping Costs: If the refund is approved due to a defect, error, or damaged item, we will reimburse you for the return shipping costs. Please keep the receipt or proof of the return shipping expenses and provide it to our customer support for reimbursement.
5.4 Once your return request has been fully approved by our team, please allow 7–15 working days for the refund to be fully processed and the amount to be credited to your original payment method.

6. Customer Support
If you have any questions, concerns, or requests regarding this Payment and Refund Policy or any payment or refund-related matters, please contact our customer support team at hello@makemymemory.in. We are committed to providing prompt assistance and resolving any issues you may encounter.`;

async function getPolicy() {
  try {
    await connectDB();
    const policy = await Policy.findOne({ slug: "returns-policy" });
    return policy || null;
  } catch (error) {
    console.error("Failed to fetch returns policy:", error);
    return null;
  }
}

export default async function ReturnsPage() {
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
            Refund Policy
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

          <div className="rounded-2xl p-5 text-center font-semibold text-sm"
            style={{ backgroundColor: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", color: "#A07C2E" }}>
            NO RETURNS &amp; NO REFUNDS ON ALL ITEMS · NO EXCHANGE &amp; NO RETURNS ON SALE PRODUCTS · NO REFUNDS &amp; EXCHANGES ON INTERNATIONAL ORDERS
          </div>

          {sections.map((s: { heading: string; paras: string[] }, idx: number) => (
            <div key={idx} className="bg-white rounded-2xl p-6 sm:p-8"
              style={{ border: "1px solid rgba(201,168,76,0.15)" }}>
              <h2 className="font-serif font-bold text-lg mb-4" style={{ color: "#1A1A1A" }}>{s.heading}</h2>
              <div className="space-y-3">
                {s.paras.map((p: string, i: number) => (
                  <p key={i} className="text-sm leading-relaxed" style={{ color: "#6B6560" }}>{p}</p>
                ))}
              </div>
            </div>
          ))}

          <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: "#1A1A1A" }}>
            <p className="text-white font-semibold mb-2">Have a concern?</p>
            <p className="text-sm mb-5" style={{ color: "rgba(232,213,163,0.65)" }}>
              Contact us at hello@makemymemory.in
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
