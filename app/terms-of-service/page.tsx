import { buildMeta } from "@/lib/seo";
import { connectDB } from "@/lib/db/connect";
import { Policy } from "@/lib/db/models/Policy";

export const metadata = buildMeta({
  title:       "Terms & Conditions",
  description: "Make My Memory's Terms and Conditions governing use of our website, ordering, payments, shipping, and cancellations.",
  path:        "/terms-of-service",
});

/* ─── Hardcoded fallback content ──────────────────────────────────────────── */
const SECTIONS = [
  {
    heading: "1. Agreement to Terms",
    body: `By accessing or using the website makemymemory.in (the "Website") or purchasing any product from Make My Memory ("we", "us", "our"), you confirm that you are at least 18 years of age, have read these Terms and Conditions ("Terms") in full, understand them, and agree to be bound by them.

If you are placing an order on behalf of another person or organisation, you represent that you have the authority to bind that person or organisation to these Terms.

We reserve the right to update these Terms at any time without prior notice. The most current version will be published on this page. Your continued use of the Website after changes are posted constitutes acceptance of the revised Terms.`,
  },
  {
    heading: "2. Products & Personalisation",
    body: `2.1 Made-to-Order Products: All products sold by Make My Memory are personalised and made to order. Each item is crafted specifically for you based on the content (photographs, text, names, dates) you provide at the time of ordering.

2.2 Accuracy of Submitted Content: You are solely responsible for the accuracy of all content you submit (photographs, captions, spelling, dates). We reproduce exactly what you provide. We will not be liable for errors in the personalised content that originated from you.

2.3 Intellectual Property of Uploaded Content: By uploading photographs or artwork, you confirm you own or have the right to use such content, and you grant Make My Memory a limited, non-exclusive, royalty-free licence to reproduce that content solely for the purpose of fulfilling your order.

2.4 Content Restrictions: You must not submit content that is unlawful, defamatory, obscene, offensive, or that infringes any third party's intellectual property or privacy rights. We reserve the right to refuse any order containing such content, and in such cases a full refund will be issued.

2.5 Product Colours: Actual product colours may vary slightly from website images due to differences in monitor calibration and print rendering. These variations are not considered defects.`,
  },
  {
    heading: "3. Ordering & Acceptance",
    body: `3.1 Placing an Order: By clicking "Place Order" or completing the checkout process, you are making an offer to purchase. Your order is not accepted until you receive an order confirmation email from us.

3.2 Order Confirmation: You will receive an email confirming the details of your order. Please review this carefully. Any discrepancies must be reported to support@makemymemory.in within 2 hours of receiving the confirmation.

3.3 Right to Refuse: We reserve the right to cancel or refuse any order for reasons including but not limited to: product unavailability, pricing errors, technical errors, failure to authorise payment, or concerns about fraudulent activity. In such cases, you will receive a full refund.

3.4 Two-Stage Fulfilment: For certain personalised products (e.g., our DIY Kit + Final Product orders), fulfilment occurs in two stages:
– Stage 1: A DIY Kit is dispatched to you promptly after order confirmation.
– Stage 2: The final personalised product is created and dispatched only after you submit your completed work (photos, design) via the portal and it is approved by our team.
Accepting Stage 1 dispatch does not obligate you to complete Stage 2; however, refunds for Stage 2 are only available if Stage 2 dispatch has not commenced.`,
  },
  {
    heading: "4. Pricing & Payment",
    body: `4.1 All prices displayed on the Website are in Indian Rupees (INR) and are inclusive of applicable taxes (GST) unless stated otherwise.

4.2 Pricing is subject to change without notice. The price applicable to your order is the price displayed at the time you complete checkout.

4.3 Payment Processing: All payments are securely processed by Razorpay Payment Solutions Pvt. Ltd. ("Razorpay"), an RBI-authorised payment aggregator and PCI-DSS Level 1 certified service provider. We accept credit cards, debit cards, UPI, net banking, and wallets as supported by Razorpay.

4.4 Make My Memory does not store your full card number, CVV, UPI credentials, or net banking passwords on its servers. All sensitive payment data is handled exclusively within Razorpay's secure environment.

4.5 Failed Transactions: If your payment fails or is declined, your order will not be confirmed. Please retry the payment or contact your bank. Make My Memory is not liable for any charges your bank may impose for a declined transaction.

4.6 Payment Disputes: In case of an unauthorised or disputed transaction, please contact us immediately at support@makemymemory.in. We will work with Razorpay to investigate and resolve the dispute in accordance with applicable RBI guidelines.`,
  },
  {
    heading: "5. Cancellations & Refunds",
    body: `5.1 Cancellation Window: Orders can be cancelled within 2 hours of placement provided production has not commenced. To cancel, email support@makemymemory.in with your Order ID.

5.2 Once production has begun (typically within 2–4 hours of order confirmation for standard products), the order cannot be cancelled as the product is personalised and made to order.

5.3 Refund Eligibility: Refunds are issued in the following circumstances:
– We are unable to fulfil your order (e.g., stock issues, production errors on our part).
– The delivered product has a manufacturing defect or damage attributable to us.
– You cancel within the permitted window (Section 5.1).

5.4 Refund Process: Approved refunds are processed back to the original payment method (credit/debit card, UPI, wallet) within 5–10 business days. Processing times depend on Razorpay and your bank.

5.5 Non-Refundable Situations: Refunds will not be issued for:
– Errors in the personalised content you submitted (wrong names, dates, photos).
– Change of mind after production has commenced.
– Minor colour variations between the website preview and printed product.
– Damage caused after delivery.

5.6 Disputes: If you believe a refund has been wrongly denied, please raise a grievance with us at support@makemymemory.in. We will respond within 7 business days.`,
  },
  {
    heading: "6. Shipping & Delivery",
    body: `6.1 Shipping Partner: Orders are fulfilled and shipped via Delhivery Logistics Pvt. Ltd. A tracking number will be provided via email and SMS once your shipment is dispatched.

6.2 Estimated Delivery Times: Delivery timelines vary by product and location. Standard delivery is typically 5–10 business days from dispatch. Expedited options may be available at checkout. These timelines are estimates and not guaranteed.

6.3 Two-Stage Shipment Orders: For DIY Kit + Final Product orders, two separate Delhivery AWB numbers will be generated — one for each shipment stage. Tracking information for both shipments will be accessible in your order history.

6.4 Delivery Address: You are responsible for providing an accurate and complete delivery address. Make My Memory is not responsible for non-delivery or delay caused by an incorrect or incomplete address. Re-delivery charges, if applicable, will be borne by you.

6.5 Failed Delivery: If a delivery attempt fails and the package is returned to us, we will contact you to arrange re-delivery. Re-delivery charges may apply.

6.6 Shipping Risk: Risk of damage or loss in transit passes to you once the product is handed to our logistics partner. In the event of transit damage, please report it to us within 48 hours of delivery with photographs, and we will initiate an investigation with Delhivery.

6.7 International Shipping: We currently ship within India only. Import duties, customs, or taxes for international shipments (if offered in the future) are the buyer's responsibility.`,
  },
  {
    heading: "7. Returns & Exchange Policy",
    body: `7.1 Due to the personalised nature of our products, we do not accept returns or exchanges unless the product is damaged or defective upon arrival.

7.2 Damaged / Defective Products: If you receive a damaged or defective product, please notify us at support@makemymemory.in within 48 hours of delivery. Include your Order ID, a description of the issue, and clear photographs.

7.3 After reviewing your complaint, we will, at our discretion, either:
(a) Reproduce and reship the product at no additional charge, or
(b) Issue a full or partial refund.

7.4 Returns due to defects must be shipped back to us using a trackable shipping service. We will reimburse reasonable return shipping costs for verified defects.`,
  },
  {
    heading: "8. Intellectual Property",
    body: `8.1 All content on this Website — including but not limited to text, graphics, logos, icons, images, product designs, and software — is the intellectual property of Make My Memory or its licensors and is protected by Indian and international copyright, trademark, and other IP laws.

8.2 You are granted a limited, non-exclusive, non-transferable licence to access and use the Website for personal, non-commercial purposes only.

8.3 You may not copy, reproduce, modify, distribute, sell, publicly display, or create derivative works from any Website content without our prior written consent.

8.4 "Make My Memory" and associated logos are trademarks of Make My Memory. Unauthorised use is strictly prohibited.

8.5 Copyright Complaints: If you believe any content on our Website infringes your intellectual property rights, please contact us at support@makemymemory.in with full details.`,
  },
  {
    heading: "9. User Accounts",
    body: `9.1 To place orders, you may register for a customer account. You agree to provide accurate, current, and complete information during registration and to keep your account information up to date.

9.2 You are responsible for maintaining the confidentiality of your account password and for all activities that occur under your account. Notify us immediately at support@makemymemory.in if you suspect any unauthorised use.

9.3 We reserve the right to suspend or terminate your account if we detect fraudulent, abusive, or unlawful activity.

9.4 Account Deletion: You may request deletion of your account at any time by emailing support@makemymemory.in. We will delete your account data subject to our legal data retention obligations.`,
  },
  {
    heading: "10. Privacy & Data Protection",
    body: `10.1 Your use of the Website is also governed by our Privacy Policy, available at https://makemymemory.in/privacy-policy, which is incorporated into these Terms by reference.

10.2 We process your personal data in compliance with the Information Technology Act, 2000 and the IT (SPDI) Rules, 2011.

10.3 Payment data is handled by Razorpay in accordance with PCI-DSS standards. Make My Memory does not store full payment card details on its servers.

10.4 By placing an order, you consent to the sharing of your name, phone number, and address with our shipping partner (Delhivery) for the purpose of delivery.`,
  },
  {
    heading: "11. Limitation of Liability",
    body: `11.1 To the fullest extent permitted by applicable law, Make My Memory shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Website or from any products purchased through it.

11.2 Our total liability to you for any claim arising from or related to your purchase shall not exceed the amount you actually paid for the specific order giving rise to the claim.

11.3 We are not liable for delays, failures, or losses caused by circumstances beyond our reasonable control, including natural disasters, pandemics, government actions, internet outages, or third-party service failures (including Razorpay, Delhivery, or Cloudinary).

11.4 We do not warrant that the Website will be uninterrupted, error-free, or free of viruses. You access the Website at your own risk.`,
  },
  {
    heading: "12. Disclaimer of Warranties",
    body: `The Website and all products and services are provided on an "as is" and "as available" basis. To the maximum extent permitted by applicable law, Make My Memory expressly disclaims all warranties, whether express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, non-infringement, and any warranties arising from a course of dealing or usage of trade.

We do not warrant that product descriptions, images, or pricing are complete, accurate, or current.`,
  },
  {
    heading: "13. Indemnification",
    body: `You agree to indemnify, defend, and hold harmless Make My Memory and its founders, officers, employees, contractors, and agents from any claims, liabilities, damages, losses, costs, or expenses (including reasonable legal fees) arising out of or related to:
(a) Your use of the Website or any order you place;
(b) Content you submit, including uploaded photographs;
(c) Your violation of these Terms or any applicable law;
(d) Your infringement of any third party's intellectual property or other rights.`,
  },
  {
    heading: "14. Governing Law & Dispute Resolution",
    body: `14.1 These Terms shall be governed by and construed in accordance with the laws of the Republic of India.

14.2 Any disputes arising out of or in connection with these Terms or any transaction on this Website shall first be attempted to be resolved amicably. If unresolved within 30 days, the dispute shall be subject to the exclusive jurisdiction of the courts located in Mumbai, Maharashtra, India.

14.3 Consumer disputes may also be referred to the relevant Consumer Disputes Redressal Forum under the Consumer Protection Act, 2019.`,
  },
  {
    heading: "15. Grievance Redressal",
    body: `In accordance with the Information Technology Act, 2000 and the Consumer Protection Act, 2019, the designated Grievance Officer for Make My Memory is:

Name: Janhvi Bajaria
Designation: Founder & Grievance Officer
Email: support@makemymemory.in
Response Time: Within 30 days of receiving a complaint

Please include your Order ID, a description of your grievance, and any supporting evidence in your communication. We are committed to resolving all grievances fairly and promptly.`,
  },
  {
    heading: "16. Severability & Entire Agreement",
    body: `16.1 If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court of competent jurisdiction, that provision shall be modified to the minimum extent necessary to make it enforceable, and the remaining provisions shall continue in full force and effect.

16.2 These Terms, together with our Privacy Policy, Shipping Policy, and Refund Policy, constitute the entire agreement between you and Make My Memory regarding your use of this Website and supersede all prior agreements, representations, or understandings.

16.3 Our failure to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision.`,
  },
  {
    heading: "17. Contact Us",
    body: `If you have any questions about these Terms and Conditions, please contact us:

Make My Memory
Email: support@makemymemory.in
Website: https://makemymemory.in

These Terms were last updated on 13 July 2025.`,
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

          {/* Intro banner */}
          <div className="rounded-2xl p-5 sm:p-7 mb-2"
            style={{ backgroundColor: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.3)" }}>
            <p className="text-sm leading-relaxed font-medium" style={{ color: "#6B6560" }}>
              Please read these Terms carefully before using our Website or placing an order.
              These Terms constitute a legally binding agreement between you and{" "}
              <strong>Make My Memory</strong>. Payments are processed by{" "}
              <strong>Razorpay</strong> (RBI-authorised, PCI-DSS Level 1 certified).
              By purchasing from us, you agree to all terms herein.
            </p>
          </div>

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
