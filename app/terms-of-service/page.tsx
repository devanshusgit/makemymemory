import { buildMeta } from "@/lib/seo";
import { connectDB } from "@/lib/db/connect";
import { Policy } from "@/lib/db/models/Policy";

export const metadata = buildMeta({
  title:       "Terms of Service",
  description: "Make My Memory's terms and conditions governing use of our website and services.",
  path:        "/terms-of-service",
});

const DEFAULT_CONTENT = `1. Introduction
1.1 Agreement: These Terms and Conditions ('Terms') govern your use of the Make My Memory Website (the 'Website'). By accessing or using the Website, you agree to be bound by these Terms.
1.2 Acceptance of Terms: By accessing the Website, you acknowledge that you have read, understood, and agree to be bound by these Terms and any future amendments or modifications.
1.3 Age Restriction: By using the Website, you affirm that you are at least 18 years old or have reached the age of majority in your jurisdiction. If you are accessing the Website on behalf of an organization, you represent and warrant that you have the authority to bind such organization to these Terms.
1.4 Changes to the Terms: Make My Memory reserves the right to modify, update, or replace these Terms at any time, without prior notice. It is your responsibility to review the Terms periodically for any changes. Your continued use of the Website after the posting of any modifications constitutes acceptance of such changes.

2. Use of the Website
2.1 License: Subject to your compliance with these Terms, Make My Memory grants you a limited, non-exclusive, non-transferable, revocable license to access and use the Website for personal, non-commercial purposes.
2.2 Account Registration: Some features of the Website may require you to create a user account. You agree to provide accurate and complete information during the registration process. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
2.3 User Conduct: You agree to use the Website only for lawful purposes and in compliance with all applicable laws, regulations, and these Terms. You shall not engage in any activity that interferes with or disrupts the Website's functionality or security.
2.4 User Content: By submitting any content, including images, text, or videos, to the Website ('User Content'), you grant Make My Memory a non-exclusive, worldwide, royalty-free, sub-licensable, and transferable license to use, reproduce, modify, adapt, distribute, display, and perform the User Content in connection with the Website's operation.
2.5 Prohibited Content: You agree not to submit any User Content that is illegal, obscene, defamatory, infringing, or violates any third-party rights. Make My Memory reserves the right to remove or disable any User Content that violates these Terms.
2.6 Website Availability: Make My Memory makes no representations or warranties regarding the availability of the Website or its uninterrupted operation. We reserve the right to modify, suspend, or discontinue the Website, or any part thereof, at any time without prior notice.
2.7 Third-Party Services: The Website may integrate with or provide links to third-party services, websites, or applications. Your use of such third-party services is subject to the terms and conditions and privacy policies of those third parties. Make My Memory has no control over and assumes no responsibility for the content, privacy practices, or actions of any third-party services.

3. Intellectual Property Rights
3.1 Ownership: The Website, its content, and all intellectual property rights therein are owned by Make My Memory or its licensors. The Website's design, layout, graphics, logos, icons, and trademarks are protected by copyright, trademark, and other intellectual property laws.
3.2 Limited License: Subject to your compliance with these Terms, Make My Memory grants you a limited, non-exclusive, non-transferable license to access and use the Website and its content for personal, non-commercial purposes.
3.3 Restrictions: Except as expressly permitted by these Terms, you may not copy, modify, distribute, sell, lease, reverse engineer, or create derivative works based on the Website or its content, in whole or in part.
3.4 Copyright Infringement: Make My Memory respects the intellectual property rights of others. If you believe that any content on the Website infringes your copyright, please contact us at hello@makemymemory.in.

4. Product and Service Information
4.1 Product Descriptions: Make My Memory strives to provide accurate and detailed information about its products and services on the Website. However, we do not warrant that the product descriptions, images, or other content on the Website are entirely accurate, complete, reliable, current, or error-free.
4.2 Pricing and Payment: The pricing and availability of products and services displayed on the Website are subject to change without notice. Make My Memory reserves the right to modify prices or discontinue products or services at any time. All payments must be made in the currency specified on the Website.
4.3 Orders and Acceptance: Placing an order on the Website does not constitute acceptance by Make My Memory. We reserve the right to accept or decline any order for any reason, including but not limited to product availability, errors in pricing or product information, or suspicion of fraudulent activity.
4.4 Shipping and Delivery: Make My Memory will make reasonable efforts to ship products within the specified timeframe. However, delivery dates are estimates and not guaranteed. Shipping costs, if applicable, will be displayed during the checkout process. Any damage to the product, if done during delivery, shall not be the responsibility of Make My Memory.
4.5 Returns and Refunds: If you are dissatisfied with a product purchased from the Website, please refer to our Returns and Refunds Policy, available on the Website, for information on the return process and eligibility for a refund.

5. Purchase of Goods
5.1.1 Make My Memory only accepts orders from customers of 18 years of age or older. Once paid via the checkout process, you will receive a confirmation email. From the point of payment, a contract exists between Make My Memory and the purchaser.
5.1.2 In case of an error with respect to the stock and pricing, Make My Memory is not obliged to supply the products and services at the price stated and will instead cancel the order and refund in full or recommend alternative items.
5.2.1 Delivery services are offered as you checkout and estimates of delivery dates are provided on the delivery page. Delivery dates are approximate and not guaranteed. If you need your goods for a tight deadline please choose Express delivery if offered.
5.2.2 Free delivery promotions may be advertised at our sole discretion and may be withdrawn at any time without notice.
5.2.3 If you have not received your item, a claim of non-receipt must be made by email within 30 days of noted dispatch date.
5.3.1 You, the buyer, are responsible for any VAT, tariff, duty, taxes, handling fees, customs clearance charges, etc. required by your country for importing consumer goods.
5.3.2 It is your full responsibility to verify the customs, duties charges, and procedures in your country prior to placing your order.
5.3.3 If customs fees and charges are refused at the time of delivery, your order will be returned and you will not receive a refund for shipment costs.
5.4.1 It is your responsibility as the customer to receive the order on the date of the delivery. Any order that is returned back to us shall be shipped after payment of re-delivery charges.
5.4.2 Incorrect delivery details may lead to delays in the delivery of your goods. Any loss or delay due to submission of incorrect address shall not be the responsibility of Make My Memory.

6. Privacy and Data Protection
6.1 Privacy Policy: Make My Memory is committed to protecting your privacy and handling your personal information in accordance with applicable laws and regulations. Please review our Privacy Policy, available on the Website.
6.2 Data Security: While Make My Memory takes reasonable measures to protect the security of your information, no data transmission or storage system can be guaranteed to be 100% secure.

7. Disclaimer of Warranties
7.1 General Disclaimer: The Website, its content, and any products or services obtained through the Website are provided on an 'as is' and 'as available' basis, without warranties of any kind.
7.2 Accuracy of Information: Make My Memory strives to provide accurate and up-to-date information on the Website. However, we do not warrant the accuracy, completeness, reliability, or timeliness of any information or content on the Website.
7.4 Limitation of Liability: To the maximum extent permitted by applicable law, Make My Memory and its directors, officers, employees, affiliates, agents, contractors, or licensors shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your use of the Website.

8. Indemnification
You agree to indemnify and hold Make My Memory and its directors, officers, employees, affiliates, agents, contractors, or licensors harmless from any claims, demands, losses, liabilities, damages, or expenses (including reasonable attorneys' fees) arising out of or in connection with your use of the Website, your User Content, or your violation of these Terms.

9. Governing Law and Jurisdiction
9.1 Governing Law: These Terms shall be governed by and construed in accordance with the laws of India.
9.2 Jurisdiction: Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in Mumbai, India.

10. Severability and Entire Agreement
10.1 Severability: If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect.
10.2 Entire Agreement: These Terms constitute the entire agreement between you and Make My Memory regarding your use of the Website and supersede all prior or contemporaneous agreements, communications, and proposals.`;

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
  
  const content = policy?.content || DEFAULT_CONTENT;
  const effectiveDate = policy?.effectiveDate ? new Date(policy.effectiveDate).toLocaleDateString("en-IN") : "20.07.2021";

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
          <h1 className="font-serif font-bold text-white leading-tight mb-3"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
            Terms of Service
          </h1>
          <p className="text-sm" style={{ color: "rgba(232,213,163,0.5)" }}>Effective Date: {effectiveDate}</p>
        </div>
      </div>

      <div className="section-wrap py-12 sm:py-16">
        <div className="max-w-2xl mx-auto space-y-5">
          {content.split("\n\n").map((section, idx) => {
            const lines = section.split("\n");
            const heading = lines[0];
            const paras = lines.slice(1);
            
            return (
              <div key={idx} className="bg-white rounded-2xl p-6 sm:p-8"
                style={{ border: "1px solid rgba(201,168,76,0.15)" }}>
                <h2 className="font-serif font-bold text-lg mb-4" style={{ color: "#1A1A1A" }}>{heading}</h2>
                <div className="space-y-3">
                  {paras.map((p, i) => (
                    p.trim() && (
                      <p key={i} className="text-sm leading-relaxed" style={{ color: "#6B6560" }}>{p}</p>
                    )
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
