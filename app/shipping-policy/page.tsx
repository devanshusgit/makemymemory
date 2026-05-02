import Link from "next/link";
import { buildMeta } from "@/lib/seo";

export const metadata = buildMeta({
  title:       "Shipping Policy",
  description: "Make My Memory's shipping and delivery policy for India and international orders.",
  path:        "/shipping-policy",
});

export default function ShippingPolicyPage() {
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
            Shipping Policy
          </h1>
        </div>
      </div>

      <div className="section-wrap py-12 sm:py-16">
        <div className="max-w-2xl mx-auto space-y-5">

          {/* India */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 space-y-4"
            style={{ border: "1px solid rgba(201,168,76,0.15)" }}>
            <h2 className="font-serif font-bold text-xl" style={{ color: "#1A1A1A" }}>SHIPPING IN INDIA</h2>
            <p className="text-sm leading-relaxed" style={{ color: "#6B6560" }}>
              We have FREE shipping within India ONLY on prepaid orders. Once you place an order your item would be shipped within the stipulated time period mentioned besides each item, mostly 7 working days. We use third party logistics companies for shipping, so we are bound in coverage by their reach. In case your address is in a location not served by them we would contact you to do our best to find an alternative solution to make your order reach you.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "#6B6560" }}>
              <strong style={{ color: "#1A1A1A" }}>Please Note —</strong> During festival seasons, holidays or adverse weather conditions, your shipment could get delayed. We ensure that we will try our best to have your package delivered to you in good time.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "#6B6560" }}>
              COD is available in India, we charge ₹99 per article. The maximum limit per order for COD is ₹7,000. NO EXCHANGE &amp; NO RETURNS ON SALE PRODUCTS.
            </p>
          </div>

          {/* International */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 space-y-4"
            style={{ border: "1px solid rgba(201,168,76,0.15)" }}>
            <h2 className="font-serif font-bold text-xl" style={{ color: "#1A1A1A" }}>INTERNATIONAL SHIPPING POLICY</h2>
            <p className="text-sm leading-relaxed" style={{ color: "#6B6560" }}>
              There is a custom fee for orders below USD 200 depending on the order value and size. Once an order is placed, your items would be shipped within 10 working days.
            </p>
            <p className="text-sm leading-relaxed font-medium" style={{ color: "#1A1A1A" }}>
              IMPORTANT: Orders with more than 1 item will be packed in a large box instead of individual boxes.
            </p>
          </div>

          {/* Import duties */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 space-y-4"
            style={{ border: "1px solid rgba(201,168,76,0.15)" }}>
            <h2 className="font-serif font-bold text-xl" style={{ color: "#1A1A1A" }}>IMPORT DUTIES</h2>
            <p className="text-sm leading-relaxed" style={{ color: "#6B6560" }}>
              For international shipments, customs duties, taxes, and other charges may be applicable based on your country's regulations. These additional charges are the responsibility of the recipient and are not included in the product or shipping prices. Please contact your local customs office for more information about the potential fees and requirements. Any import duties/charges applicable will be borne by the customer and Make My Memory will not be responsible for it.
            </p>
          </div>

          <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: "#1A1A1A" }}>
            <p className="text-white font-semibold mb-2">Questions about your delivery?</p>
            <p className="text-sm mb-5" style={{ color: "rgba(232,213,163,0.65)" }}>
              Email us at hello@makemymemory.in
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
