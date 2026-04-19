import { buildMeta } from "@/lib/seo";

export const metadata = buildMeta({
  title:       "Privacy Policy",
  description: "How Make My Memory collects, uses, and protects your personal information.",
  path:        "/privacy-policy",
});

const sections = [
  {
    title: "Information We Collect",
    content: `When you place an order, we collect your name, email address, phone number, and delivery address. We also collect payment information, which is processed securely by Razorpay and PayPal — we never store your card details on our servers. We may also collect usage data such as pages visited and products viewed to improve your experience.`,
  },
  {
    title: "How We Use Your Information",
    content: `We use your information to process and fulfil your orders, send order confirmations and shipping updates, respond to your enquiries, and improve our products and services. With your consent, we may also send you promotional emails about new products and offers. You can unsubscribe at any time.`,
  },
  {
    title: "Sharing Your Information",
    content: `We do not sell, trade, or rent your personal information to third parties. We share your information only with trusted service providers who help us operate our business — such as courier partners for delivery and payment processors for transactions. These partners are bound by confidentiality agreements.`,
  },
  {
    title: "Data Security",
    content: `We implement industry-standard security measures to protect your personal information. All data is transmitted over SSL encryption. Our payment processing partners are PCI-DSS compliant. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.`,
  },
  {
    title: "Cookies",
    content: `We use cookies to enhance your browsing experience, remember your cart items, and analyse site traffic. You can disable cookies in your browser settings, but this may affect some features of our website.`,
  },
  {
    title: "Your Rights",
    content: `You have the right to access, correct, or delete your personal information at any time. To exercise these rights, please contact us at hello@makemymemory.in. We will respond to your request within 30 days.`,
  },
  {
    title: "Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes by email or by posting a notice on our website. Your continued use of our services after changes are posted constitutes your acceptance of the updated policy.`,
  },
  {
    title: "Contact Us",
    content: `If you have any questions about this Privacy Policy, please contact us at hello@makemymemory.in or write to us at Make My Memory, Mumbai, Maharashtra, India.`,
  },
];

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-white/60 text-sm max-w-md mx-auto">
            Last updated: January 2025
          </p>
        </div>
      </div>

      <div className="section-wrap py-12 sm:py-16">
        <div className="max-w-2xl mx-auto space-y-8">
          <p className="text-stone-500 text-sm leading-relaxed">
            At Make My Memory, we are committed to protecting your privacy. This policy explains
            how we collect, use, and safeguard your personal information when you use our website
            and services.
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
