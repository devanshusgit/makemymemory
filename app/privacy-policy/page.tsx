import { buildMeta } from "@/lib/seo";
import { connectDB } from "@/lib/db/connect";
import { Policy } from "@/lib/db/models/Policy";

export const metadata = buildMeta({
  title:       "Privacy Policy",
  description: "Make My Memory's privacy policy — how we collect, use, and protect your personal information in compliance with Indian law.",
  path:        "/privacy-policy",
});

/* ─── Hardcoded fallback content ──────────────────────────────────────────── */
const SECTIONS = [
  {
    heading: "1. Introduction",
    body: `Make My Memory ("we", "us", "our") is a personalised gifting brand operated from India. We are committed to protecting the privacy and security of your personal information in accordance with the Information Technology Act, 2000, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 ("SPDI Rules"), and the Consumer Protection Act, 2019.

This Privacy Policy explains how we collect, use, store, share, and protect information about you when you visit our website at makemymemory.in (the "Website") or purchase our products. By using the Website, you consent to the practices described in this policy.

If you do not agree with this Privacy Policy, please do not use our Website.`,
  },
  {
    heading: "2. Information We Collect",
    body: `We collect only the information necessary to provide you with our services. This includes:

2.1 Personal Identification Information: Full name, email address, mobile number, shipping address, and billing address when you create an account or place an order.

2.2 Payment Information: We collect information necessary to process your payment (order amount, currency). We do NOT store your full card number, CVV, or UPI PIN on our servers. All payment transactions are processed through Razorpay, a PCI-DSS Level 1 compliant payment gateway. Razorpay's privacy policy governs the handling of your financial data (https://razorpay.com/privacy/).

2.3 User-Uploaded Content: For personalised products, you may upload photographs and custom text. These files are stored securely on Cloudinary (our cloud media service) and used solely for production of your ordered item.

2.4 Usage Data: We may automatically collect your IP address, browser type, device identifiers, pages visited, referring URLs, and session duration via cookies and analytics tools for the purpose of improving our service.

2.5 Communications: If you contact us via email, phone, or contact forms, we retain records of that correspondence.`,
  },
  {
    heading: "3. How We Use Your Information",
    body: `We use the information we collect for the following purposes:

3.1 Order Fulfilment: To process, produce, pack, and dispatch your personalised orders, including sharing your shipping address with our logistics partner (Delhivery) for delivery.

3.2 Payment Processing: To authorise and complete payments through Razorpay. We share the minimum required transactional data (name, email, phone, order amount) with Razorpay as needed for payment processing and fraud prevention.

3.3 Account Management: To create and manage your customer account, enable order tracking, and process returns or refunds.

3.4 Communications: To send order confirmations, shipping updates, OTP verification messages, and important service notifications via email or SMS.

3.5 Marketing (with consent): To send promotional emails or messages about new products, offers, and events. You may opt out at any time using the unsubscribe link in our emails or by contacting us.

3.6 Legal Compliance: To comply with applicable laws, regulations, tax obligations, and court orders. We may also use your data to detect, prevent, or address fraud, security breaches, or technical issues.

3.7 Service Improvement: To analyse website usage patterns, improve our platform, personalise your experience, and resolve disputes.`,
  },
  {
    heading: "4. Sharing of Information",
    body: `We do not sell, trade, or rent your personal information to third parties for their own marketing purposes. We share your information only in the following limited circumstances:

4.1 Payment Gateway – Razorpay: We share transactional data (name, email, phone, amount) with Razorpay for the purpose of processing your payments. Razorpay is authorised by the Reserve Bank of India (RBI) and complies with PCI-DSS standards.

4.2 Logistics Partner – Delhivery: We share your name, phone number, and delivery address with Delhivery to facilitate shipment of your order. Their privacy policy governs further use of this data.

4.3 Cloud Services: Your uploaded media files are stored on Cloudinary. Our email and OTP services may be delivered through Brevo (formerly Sendinblue). These processors are bound by data processing agreements.

4.4 Legal Requirements: We may disclose your information to government authorities or law enforcement if required by law or to protect the rights, property, or safety of Make My Memory, our customers, or the public.

4.5 Business Transfer: In the event of a merger, acquisition, or sale of assets, your personal information may be transferred as part of that transaction, subject to the same privacy protections.`,
  },
  {
    heading: "5. Payment Security & Razorpay Compliance",
    body: `5.1 All payment transactions on this Website are processed exclusively through Razorpay Payment Solutions Private Limited, which is compliant with PCI DSS (Payment Card Industry Data Security Standard) Level 1.

5.2 Make My Memory does not store, process, or transmit full credit/debit card numbers, CVV/CVC codes, UPI PINs, or net banking passwords on its servers at any point.

5.3 Razorpay employs industry-standard SSL/TLS encryption for all payment data in transit. All sensitive financial information is tokenised and handled entirely within Razorpay's secure environment.

5.4 In case of a failed or disputed payment, you must contact us at support@makemymemory.in. Refunds, where applicable, are processed back to the original payment method within 5–10 business days, subject to our Refund Policy.

5.5 Make My Memory is not responsible for any unauthorised access to your financial information that occurs outside our systems (e.g., on Razorpay's platform or your own device). Please review Razorpay's Security Policy at https://razorpay.com/privacy/ for details.`,
  },
  {
    heading: "6. Cookies and Tracking Technologies",
    body: `6.1 We use cookies and similar tracking technologies to enhance your experience on our Website. Cookies are small text files stored on your device by your browser.

6.2 Types of cookies we use:
– Essential Cookies: Required for the Website to function (e.g., cart sessions, login state).
– Analytics Cookies: Help us understand how visitors interact with our Website (e.g., pages visited, time spent).
– Preference Cookies: Remember your preferences (e.g., language, region).

6.3 You can control or disable cookies through your browser settings. However, disabling essential cookies may impact Website functionality.

6.4 We do not use cookies to collect sensitive personal information or to track you across third-party websites without your consent.`,
  },
  {
    heading: "7. Data Retention",
    body: `7.1 We retain your personal information for as long as necessary to fulfil the purposes described in this policy, or as required by applicable law (e.g., tax records must be retained for a minimum of 6 years under Indian law).

7.2 Your account information and order history are retained while your account is active and for up to 3 years after your last transaction.

7.3 User-uploaded photos used for product personalisation are retained for 90 days after order delivery to resolve any quality disputes, after which they are permanently deleted from our systems.

7.4 Upon written request, we will delete your personal data where we are not legally required to retain it (see Section 9 – Your Rights).`,
  },
  {
    heading: "8. Data Security",
    body: `8.1 We implement reasonable administrative, technical, and physical security measures to protect your personal information against unauthorised access, loss, misuse, or disclosure, in accordance with the IT (Reasonable Security Practices) Rules, 2011.

8.2 Security measures include: SSL/TLS encryption for data in transit, bcrypt hashing for passwords, access controls limiting employee access to customer data on a need-to-know basis, and regular security reviews.

8.3 While we take every reasonable precaution, no method of electronic transmission or storage is 100% secure. We cannot guarantee absolute security of your data. If a security breach occurs that is likely to result in harm to you, we will notify you as required by law.`,
  },
  {
    heading: "9. Your Rights",
    body: `Under Indian law and our own commitment to transparency, you have the following rights with respect to your personal data:

9.1 Right to Access: You may request a copy of the personal information we hold about you.

9.2 Right to Correction: You may request correction of any inaccurate or incomplete information.

9.3 Right to Deletion: You may request deletion of your personal data, subject to our legal retention obligations.

9.4 Right to Withdraw Consent: You may withdraw consent for marketing communications at any time by clicking the unsubscribe link in our emails or emailing support@makemymemory.in.

9.5 Right to Grievance Redressal: If you have concerns about the handling of your personal data, you may contact our Grievance Officer (see Section 12). We will respond within 30 days.

To exercise any of these rights, please email us at support@makemymemory.in with the subject line "Data Privacy Request".`,
  },
  {
    heading: "10. Children's Privacy",
    body: `Our Website is not directed to children under the age of 18. We do not knowingly collect personal information from anyone under 18. If we become aware that we have collected personal information from a child without parental consent, we will take steps to delete that information promptly. If you believe we have such information, please contact us at support@makemymemory.in.`,
  },
  {
    heading: "11. Third-Party Links",
    body: `Our Website may contain links to third-party websites (e.g., social media platforms, payment portals). We are not responsible for the privacy practices of those websites. We encourage you to read the privacy policies of every website you visit. This Privacy Policy applies solely to information collected by our Website.`,
  },
  {
    heading: "12. Grievance Officer",
    body: `In accordance with the Information Technology Act, 2000 and the SPDI Rules, 2011, the name and contact details of our Grievance Officer are:

Name: Janhvi Bajaria
Designation: Founder & Grievance Officer
Organisation: Make My Memory
Email: support@makemymemory.in
Address: India
Response Time: Within 30 days of receiving the complaint

You may direct any privacy-related complaints or concerns to the Grievance Officer at the address above.`,
  },
  {
    heading: "13. Changes to This Policy",
    body: `We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. The most current version will always be available on this page with the effective date noted at the top.

We encourage you to review this policy periodically. Your continued use of the Website after any changes constitutes acceptance of the updated policy. If we make material changes that significantly affect your rights, we will notify you via email or a prominent notice on our Website.`,
  },
  {
    heading: "14. Contact Us",
    body: `If you have any questions, concerns, or requests regarding this Privacy Policy or the way we handle your data, please contact us:

Make My Memory
Email: support@makemymemory.in
Website: https://makemymemory.in

This Privacy Policy was last updated on 13 July 2025.`,
  },
];

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

  // If an admin has saved a custom version in the DB, render that; otherwise use the hardcoded sections
  const hasCustomContent = policy?.content && policy.content.trim().length > 0;
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
          <h1 className="font-serif font-bold text-white leading-tight"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm" style={{ color: "rgba(232,213,163,0.6)" }}>
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
              This policy applies to all visitors and customers of <strong>makemymemory.in</strong>. It governs
              how we collect, use, and protect your personal data in compliance with the{" "}
              <strong>Information Technology Act, 2000</strong>, the{" "}
              <strong>IT (SPDI) Rules, 2011</strong>, and{" "}
              <strong>Razorpay&apos;s merchant requirements</strong> for payment processing.
            </p>
          </div>

          {hasCustomContent
            ? /* Render CMS content if admin saved it */
              (policy!.content as string).split("\n\n").map((paragraph: string, idx: number) => (
                <div key={idx} className="bg-white rounded-2xl p-6 sm:p-8"
                  style={{ border: "1px solid rgba(201,168,76,0.15)" }}>
                  <p className="text-sm leading-relaxed" style={{ color: "#6B6560" }}>{paragraph}</p>
                </div>
              ))
            : /* Render hardcoded structured sections */
              SECTIONS.map((section, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-6 sm:p-8"
                  style={{ border: "1px solid rgba(201,168,76,0.15)" }}>
                  <h2 className="font-serif font-bold text-lg mb-4" style={{ color: "#1A1A1A" }}>
                    {section.heading}
                  </h2>
                  <div className="space-y-3">
                    {section.body.split("\n\n").map((para, i) => (
                      <p key={i} className="text-sm leading-relaxed" style={{ color: "#6B6560" }}>
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
            <a href="/terms-of-service" style={{ color: "#C9A84C" }}>Terms of Service</a>
          </p>
        </div>
      </div>
    </div>
  );
}
