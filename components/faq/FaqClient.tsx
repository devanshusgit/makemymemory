"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Sparkles, Package, Truck, CreditCard, HeartHandshake, Camera } from "lucide-react";

const CATEGORIES = [
  {
    id: "about-artworks",
    label: "About Our Artworks",
    Icon: Sparkles,
    faqs: [
      {
        q: "Where are your keepsakes made?",
        a: "Every keepsake is handcrafted to order in our studio in India. We do not mass-produce — each piece is made individually with care and attention to detail.",
      },
      {
        q: "What sizes are available for foil imprint frames?",
        a: "We offer A4 (21×29.7 cm) and A3 (29.7×42 cm) sizes for our foil imprint artworks. You can select your preferred size on the product page.",
      },
      {
        q: "What paper and cardstock do you use?",
        a: "All foil imprint artworks are printed on 220–300 gsm premium smooth cardstock, giving a luxurious feel and ensuring the gold foil adheres beautifully.",
      },
      {
        q: "Are frames included with the artwork?",
        a: "Frames are available as an add-on and can be selected on the product page. We offer frames in natural wood, white, and black finishes.",
      },
      {
        q: "What materials are the frames made from?",
        a: "Our frames are crafted from solid wood with a smooth finish. They come in Black, White, and Natural Wood options. Each frame includes real glass for a premium look.",
      },
      {
        q: "Can I choose the colour of the foil?",
        a: "Yes — we offer Gold, Silver, Rose Gold, and Copper foil options. You can select your preferred metallic finish during the customisation step.",
      },
      {
        q: "What personalisation options are available?",
        a: "You can add your baby's name, date of birth, birth weight, birth length, and a short personal message. Font styles and layout options are available to choose from.",
      },
    ],
  },
  {
    id: "inkless-kit",
    label: "Inkless Kit & Process",
    Icon: Camera,
    faqs: [
      {
        q: "How does the inkless kit process work?",
        a: "It's simple: place your order, receive your inkless impression kit, take your baby's hand or footprint at home, upload the image using the link we send you, approve your digital preview, and we'll create and ship your finished artwork.",
      },
      {
        q: "Is the inkless kit safe for babies and newborns?",
        a: "Absolutely. Our inkless impression kits are completely non-toxic, skin-safe, and dermatologically tested. They are safe for newborns and sensitive skin.",
      },
      {
        q: "How do I get a good print with the inkless kit?",
        a: "Warm your baby's hand or foot gently before pressing. Press firmly and evenly onto the impression sheet, hold for 5–10 seconds, then lift straight up. We recommend doing 2–3 attempts and uploading the best one.",
      },
      {
        q: "What if my print doesn't come out well?",
        a: "Don't worry — each kit includes multiple impression sheets so you can try a few times. If you're still not happy, contact us and we'll send a replacement kit at no charge.",
      },
      {
        q: "How long does the whole process take?",
        a: "You'll receive your inkless kit within 2–5 business days of ordering. Once you upload your print, we'll send a digital preview within 1–3 business days. After your approval, your finished artwork is dispatched within 2–3 business days.",
      },
      {
        q: "Can I use my own photo or scan instead of the inkless kit?",
        a: "Yes — if you already have a clear, high-resolution photo or scan of a handprint or footprint, you can upload it directly. We'll use it to create your foil artwork.",
      },
      {
        q: "What age is best for taking prints?",
        a: "Foil imprints work beautifully at any age — from newborns to toddlers and beyond. 3D castings are most popular for babies aged 0–18 months, but we can cast hands and feet at any age.",
      },
    ],
  },
  {
    id: "3d-casting",
    label: "3D Casting",
    Icon: Package,
    faqs: [
      {
        q: "How does 3D casting work?",
        a: "We send you a casting kit with a safe, food-grade alginate moulding powder. You mix it with water, place your baby's hand or foot in the mould, wait a few minutes, and send the mould back to us. We then pour and finish the cast in your chosen material.",
      },
      {
        q: "Is the casting material safe for babies?",
        a: "Yes — we use food-grade alginate, the same material used by dentists. It is completely non-toxic, hypoallergenic, and safe for newborns and sensitive skin.",
      },
      {
        q: "What finish options are available for 3D casts?",
        a: "We offer casts in White Plaster, Gold, Silver, Bronze, and Natural Stone finishes. You can select your preferred finish on the product page.",
      },
      {
        q: "Can I get a cast of both hands and feet together?",
        a: "Yes — our Hand & Foot Set includes casts of both. We also offer Couples Hand Casting for partners or parent-and-child combinations.",
      },
      {
        q: "How fragile are the finished casts?",
        a: "Our casts are made from high-quality plaster and resin compounds that are durable for display. We recommend keeping them away from direct sunlight and handling them with care.",
      },
    ],
  },
  {
    id: "shipping",
    label: "Shipping & Delivery",
    Icon: Truck,
    faqs: [
      {
        q: "Is shipping free within India?",
        a: "Yes — free shipping on all prepaid orders within India. COD is also available at no extra charge. Maximum COD order value is ₹7,000.",
      },
      {
        q: "How long does dispatch take?",
        a: "Foil imprint artworks are dispatched within 5–7 working days. 3D casting orders take 7–10 working days after we receive your mould back. Timelines are shown on each product page.",
      },
      {
        q: "How long does delivery take after dispatch?",
        a: "Standard delivery within India takes 3–7 business days after dispatch. During festival seasons or adverse weather, delays may occur.",
      },
      {
        q: "How do I track my order?",
        a: "Once dispatched, you'll receive a tracking link via email and SMS. You can also track your order anytime from the Track Order page on our website.",
      },
      {
        q: "What if I miss my delivery?",
        a: "Please contact the courier partner directly to rearrange delivery. Orders returned to us due to failed delivery will be re-shipped only after payment of re-delivery charges.",
      },
      {
        q: "Do you ship internationally?",
        a: "Yes, to select countries. International orders are dispatched within 10 working days. Customers are responsible for all customs duties, import taxes, and handling fees in their country. We do not accept returns or refunds on international orders.",
      },
      {
        q: "What if I haven't received my order?",
        a: "Please contact us within 30 days of the noted dispatch date at support@makemymemory.com. Claims made after this period may not be eligible for investigation.",
      },
    ],
  },
  {
    id: "payment",
    label: "Payment & Pricing",
    Icon: CreditCard,
    faqs: [
      {
        q: "What payment methods do you accept?",
        a: "We accept UPI (GPay, PhonePe, Paytm), credit/debit cards (Visa, Mastercard, RuPay, Amex), net banking, and wallets — all via Razorpay. COD is available for orders up to ₹7,000.",
      },
      {
        q: "Is my payment information secure?",
        a: "Yes. All payments are processed by Razorpay using industry-standard encryption. We never store your card or banking details.",
      },
      {
        q: "Can I cancel my order after payment?",
        a: "No — orders cannot be cancelled once placed and payment is confirmed, as production begins immediately. Please review your order carefully before checkout.",
      },
      {
        q: "Do you offer refunds?",
        a: "Refunds are only issued for items that arrive damaged or defective due to our error. No refunds are given for change of mind, incorrect details submitted by the customer, or sale items. See our full Refund Policy for details.",
      },
      {
        q: "How long do refunds take?",
        a: "Once approved, refunds are processed within 7–15 business days to your original payment method.",
      },
      {
        q: "Do you offer bulk or corporate pricing?",
        a: "Yes — special pricing for orders of 5+ units. Email support@makemymemory.com for a custom quote.",
      },
    ],
  },
  {
    id: "returns",
    label: "Returns & Support",
    Icon: HeartHandshake,
    faqs: [
      {
        q: "What is your return policy?",
        a: "We do not accept returns on personalised or made-to-order items. No returns or exchanges on sale products. Damaged items may be eligible for replacement — see below.",
      },
      {
        q: "My order arrived damaged — what do I do?",
        a: "Email support@makemymemory.com within 48 hours of delivery with your order number and clear photos of the damage. We'll arrange a replacement or refund after verification.",
      },
      {
        q: "There's a mistake in the personalisation — can it be fixed?",
        a: "If the error was in the details you submitted, we'll try to help but may need to charge for reprinting. If the mistake was ours, we'll reprint and reship at no cost.",
      },
      {
        q: "What about international orders?",
        a: "No returns, exchanges, or refunds on international orders except for production defects. Customers bear all customs duties and import charges.",
      },
      {
        q: "How do I contact customer support?",
        a: "Email support@makemymemory.com or WhatsApp +91 80974 89800 (Mon–Sat, 10 AM–6 PM IST). We typically respond within 2–4 hours.",
      },
    ],
  },
];

const ease = [0.4, 0, 0.2, 1] as const;

function AccordionItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ delay: index * 0.04, duration: 0.4, ease }}
      className="border-b last:border-0"
      style={{ borderColor: "rgba(201,168,76,0.15)" }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-start justify-between gap-4 py-5 text-left group"
      >
        <span className="text-sm sm:text-[15px] font-medium leading-snug transition-colors duration-200"
          style={{ color: open ? "#1A1A1A" : "#1A1A1A" }}>
          {q}
        </span>
        <span className="shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center
                         transition-all duration-200"
          style={{
            backgroundColor: open ? "rgba(201,168,76,0.15)" : "#F0EBE1",
            color: open ? "#C9A84C" : "#6B6560",
          }}>
          {open ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease }}
            className="overflow-hidden"
          >
            <p className="pb-5 pr-10 text-sm leading-relaxed" style={{ color: "#6B6560" }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CategoryBlock({ category }: { category: typeof CATEGORIES[number] }) {
  const { Icon } = category;
  return (
    <div id={category.id} className="scroll-mt-28">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: "rgba(201,168,76,0.12)" }}>
          <Icon className="w-4 h-4" style={{ color: "#C9A84C" }} strokeWidth={1.75} />
        </div>
        <h2 className="font-serif font-bold text-xl sm:text-2xl" style={{ color: "#1A1A1A" }}>
          {category.label}
        </h2>
      </div>
      <div className="bg-white rounded-2xl px-5 sm:px-7"
        style={{ border: "1px solid rgba(201,168,76,0.15)", boxShadow: "0 2px 12px rgba(26,26,26,0.04)" }}>
        {category.faqs.map((item, i) => (
          <AccordionItem key={item.q} q={item.q} a={item.a} index={i} />
        ))}
      </div>
    </div>
  );
}

export default function FaqClient() {
  const [activeTab, setActiveTab] = useState("about-artworks");

  const scrollTo = (id: string) => {
    setActiveTab(id);
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 112;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Sticky tab bar */}
      <div className="sticky top-[65px] z-30 border-b backdrop-blur-md"
        style={{ backgroundColor: "rgba(250,248,244,0.95)", borderBottomColor: "rgba(201,168,76,0.2)" }}>
        <div className="section-wrap">
          <div className="flex items-center gap-1 py-3 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((cat) => {
              const { Icon } = cat;
              const active = activeTab === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => scrollTo(cat.id)}
                  className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full
                             text-xs font-semibold tracking-wide transition-all duration-200"
                  style={{
                    backgroundColor: active ? "#1A1A1A" : "transparent",
                    color: active ? "#FAF8F4" : "#6B6560",
                  }}
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* FAQ content */}
      <div className="section-wrap py-12 sm:py-16">
        <div className="max-w-2xl mx-auto space-y-10">
          {CATEGORIES.map((cat) => (
            <CategoryBlock key={cat.id} category={cat} />
          ))}

          {/* Still have questions CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease }}
            className="rounded-2xl p-8 text-center"
            style={{ backgroundColor: "#1A1A1A" }}
          >
            <p className="text-white font-semibold text-base mb-2">Still have a question?</p>
            <p className="text-sm mb-6" style={{ color: "rgba(232,213,163,0.65)" }}>
              Our team is available Mon–Sat, 10 AM–6 PM IST.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-white px-7 py-3 rounded-full
                           text-sm font-semibold transition-all duration-300 hover:bg-[#C9A84C] hover:text-[#1A1A1A]"
                style={{ color: "#1A1A1A" }}>
                Contact Us
              </Link>
              <a href="mailto:support@makemymemory.com"
                className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full
                           text-sm font-semibold transition-all duration-300 hover:bg-[#C9A84C] hover:text-[#1A1A1A]"
                style={{ border: "1px solid rgba(201,168,76,0.3)", color: "rgba(232,213,163,0.8)" }}>
                support@makemymemory.com
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
