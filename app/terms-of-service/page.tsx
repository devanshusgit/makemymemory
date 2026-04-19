import { buildMeta } from "@/lib/seo";

export const metadata = buildMeta({
  title:       "Terms of Service",
  description: "Terms and conditions for using Make My Memory's website and services.",
  path:        "/terms-of-service",
});

const sections = [
  {
    title: "Acceptance of Terms",
    content: `By accessing and using the Make My Memory website and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.`,
  },
  {
    title: "Products and Personalisation",
    content: `All products are made to order and personalised based on the information and images you provide. You are responsible for ensuring that all content you submit (photos, text, designs) does not infringe on any third-party intellectual property rights and is not offensive, defamatory, or illegal. We reserve the right to refuse any order that violates these guidelines.`,
  },
  {
    title: "Pricing and Payment",
    content: `All prices are listed in Indian Rupees (INR) and include applicable taxes. We reserve the right to change prices at any time without notice. Payment must be made in full at the time of ordering. We accept payments via Razorpay (UPI, cards, net banking) and PayPal for international orders.`,
  },
  {
    title: "Order Processing",
    content: `Once an order is placed and payment is confirmed, production begins within 1–2 business days. You may request changes within 1 hour of placing your order. After production has started, changes may not be possible. We will do our best to accommodate urgent requests.`,
  },
  {
    title: "Shipping and Delivery",
    content: `We ship across India. Delivery times are estimates and not guaranteed. We are not responsible for delays caused by courier partners, natural disasters, or other circumstances beyond our control. Risk of loss passes to you upon delivery.`,
  },
  {
    title: "Returns and Refunds",
    content: `Because all products are personalised and made to order, we do not accept returns for change of mind. If your product arrives damaged or defective, please contact us within 48 hours of delivery with photos. We will replace the item at no charge. Refunds are issued at our discretion.`,
  },
  {
    title: "Intellectual Property",
    content: `All content on this website, including images, text, logos, and designs, is the property of Make My Memory and is protected by copyright law. You may not reproduce, distribute, or use our content without written permission.`,
  },
  {
    title: "Limitation of Liability",
    content: `Make My Memory shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services. Our total liability shall not exceed the amount paid for the specific order in question.`,
  },
  {
    title: "Governing Law",
    content: `These Terms of Service are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.`,
  },
  {
    title: "Contact",
    content: `For questions about these Terms of Service, please contact us at hello@makemymemory.in.`,
  },
];

export default function TermsOfServicePage() {
  return (
    <div className="bg-canvas min-h-screen">
      {/* Dark hero */}
      <div className="bg-hero py-14 sm:py-20">
        <div className="section-wrap text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold
                           tracking-widest uppercase text-sage mb-5">
            <span className="w-5 h-px bg-sage" />
            Legal
            <span className="w-5 h-px bg-sage" />
          </span>
          <h1
            className="font-serif font-bold text-white leading-tight mb-4"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "-0.02em" }}
          >
            Terms of Service
          </h1>
          <p className="text-white/60 text-sm max-w-md mx-auto">
            Last updated: January 2025
          </p>
        </div>
      </div>

      <div className="section-wrap py-12 sm:py-16">
        <div className="max-w-2xl mx-auto space-y-8">
          <p className="text-stone-500 text-sm leading-relaxed">
            Please read these Terms of Service carefully before using the Make My Memory website.
            These terms govern your use of our website and the purchase of our products.
          </p>

          {sections.map((section) => (
            <div key={section.title} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-100 shadow-soft">
              <h2 className="font-serif font-bold text-ink text-lg mb-3">{section.title}</h2>
              <p className="text-stone-500 text-sm leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
