"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Package, Workflow, CreditCard, HeartHandshake } from "lucide-react";

const CATEGORIES = [
  {
    id: "products",
    label: "About Products",
    Icon: Package,
    faqs: [
      { q: "What kinds of products can I personalise?", a: "We offer photo books, custom frames, canvas prints, mugs, cushions, calendars, gift sets, and keychains — all fully personalised with your photos, names, and messages." },
      { q: "What photo resolution do I need for the best print quality?", a: "We recommend at least 300 DPI for sharp, vibrant prints. JPG, PNG, and HEIC formats are all accepted. Our upload tool will flag any images that may print poorly." },
      { q: "Can I preview my design before placing an order?", a: "Yes — our live design tool shows a real-time preview of your product as you customise it. You'll see exactly what you're getting before you add it to cart." },
      { q: "Are the colours in the preview accurate?", a: "We calibrate our previews to match our print output as closely as possible. Slight variations can occur due to screen colour profiles, but we aim for a 95%+ match." },
      { q: "Can I order the same product in multiple sizes?", a: "Yes. Most products are available in multiple sizes. Select your preferred size on the product page before customising." },
    ],
  },
  {
    id: "how-it-works",
    label: "How It Works",
    Icon: Workflow,
    faqs: [
      { q: "How do I place a personalised order?", a: "Choose a product, upload your photos, add your text or message, preview the design, and add to cart. Checkout takes under 2 minutes." },
      { q: "How long does production take?", a: "Most orders are produced within 1–2 business days. Express production (same-day dispatch for orders placed before 2 PM) is available at checkout." },
      { q: "Can I make changes after placing my order?", a: "Changes can be made within 1 hour of placing your order. After that, production may have already started. Contact us immediately at hello@makemymemory.in." },
      { q: "Do you offer bulk or corporate orders?", a: "Absolutely. We offer special pricing and dedicated support for bulk orders of 10+ units. Reach out at hello@makemymemory.in for a custom quote." },
      { q: "How do I track my order?", a: "Once dispatched, you'll receive a tracking link via email and SMS. You can also track your order from the Track Order page." },
    ],
  },
  {
    id: "payment-shipping",
    label: "Payment & Shipping",
    Icon: CreditCard,
    faqs: [
      { q: "What payment methods do you accept?", a: "We accept all major credit and debit cards, UPI, net banking, and popular wallets — all processed securely through Razorpay." },
      { q: "Is my payment information secure?", a: "Yes. We never store your card details. All transactions are encrypted and processed by Razorpay, which is PCI-DSS Level 1 certified." },
      { q: "Do you offer free shipping?", a: "Yes — free standard shipping on all orders above ₹999. Orders below ₹999 attract a flat ₹99 shipping fee." },
      { q: "How long does delivery take?", a: "Standard delivery takes 3–5 business days. Express delivery (2–3 days) is available at checkout for most pin codes across India." },
      { q: "Do you ship outside India?", a: "Not yet — we currently ship within India only. International shipping is on our roadmap. Sign up for our newsletter to be notified when it launches." },
    ],
  },
  {
    id: "returns-support",
    label: "Returns & Support",
    Icon: HeartHandshake,
    faqs: [
      { q: "What is your return policy?", a: "Because every product is made to order, we don't accept returns for change of mind. However, if your item arrives damaged or defective, we'll replace it free of charge — no questions asked." },
      { q: "My order arrived damaged. What do I do?", a: "We're sorry to hear that. Email us at hello@makemymemory.in with your order number and a photo of the damage within 48 hours of delivery. We'll send a replacement right away." },
      { q: "The personalisation has a typo — can it be fixed?", a: "If the typo was in the text you submitted, we'll do our best to help but may need to charge for reprinting. If it was our error, we'll reprint and reship at no cost." },
      { q: "How do I contact customer support?", a: "Email us at hello@makemymemory.in or call +91 99999 99999 (Mon–Sat, 10 AM–6 PM IST). We typically respond within 2–4 hours." },
      { q: "Do you have a loyalty or referral programme?", a: "Yes! Refer a friend and you both get ₹100 off your next order. Ask us about our loyalty programme when you contact support." },
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
      transition={{ delay: index * 0.05, duration: 0.4, ease }}
      className="border-b border-stone-100 last:border-0"
    >
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-start justify-between gap-4 py-5 text-left group"
      >
        <span className={`text-sm sm:text-[15px] font-medium leading-snug transition-colors duration-200
                          ${open ? "text-ink" : "text-ink/80 group-hover:text-ink"}`}>
          {q}
        </span>
        <span className={`shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center
                           transition-all duration-200
                           ${open ? "bg-sage/15 text-sage-dark" : "bg-stone-100 text-stone-400 group-hover:bg-stone-200"}`}>
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
            <p className="pb-5 pr-10 text-sm text-stone-500 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CategoryBlock({ category }: { category: (typeof CATEGORIES)[number] }) {
  const { Icon } = category;
  return (
    <div id={category.id} className="scroll-mt-28">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-2xl bg-sage/10 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-sage-dark" strokeWidth={1.75} />
        </div>
        <h2 className="font-serif font-bold text-ink text-lg sm:text-xl">{category.label}</h2>
      </div>
      <div className="bg-white rounded-3xl shadow-soft border border-stone-100 px-5 sm:px-7">
        {category.faqs.map((item, i) => (
          <AccordionItem key={item.q} q={item.q} a={item.a} index={i} />
        ))}
      </div>
    </div>
  );
}

export default function FaqClient() {
  const [activeTab, setActiveTab] = useState("products");

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
      <div className="sticky top-[65px] z-30 bg-canvas/95 backdrop-blur-md border-b border-stone-200">
        <div className="section-wrap">
          <div className="flex items-center gap-1 py-3 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((cat) => {
              const { Icon } = cat;
              const active = activeTab === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => scrollTo(cat.id)}
                  className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full
                               text-xs font-semibold tracking-wide transition-all duration-200
                               ${active ? "bg-ink text-canvas shadow-soft" : "text-stone-500 hover:text-ink hover:bg-stone-100"}`}
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

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease }}
            className="bg-hero rounded-3xl p-8 text-center"
          >
            <p className="text-white font-semibold text-base mb-2">Still have a question?</p>
            <p className="text-stone-400 text-sm mb-6">Our team is available Mon–Sat, 10 AM–6 PM IST.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 bg-white text-ink px-7 py-3 rounded-full text-sm font-semibold hover:bg-canvas hover:-translate-y-0.5 hover:shadow-lift transition-all duration-300">
                Contact Us
              </Link>
              <a href="mailto:hello@makemymemory.in" className="inline-flex items-center justify-center gap-2 border border-white/20 text-white/80 px-7 py-3 rounded-full text-sm font-semibold hover:border-white/50 hover:text-white hover:-translate-y-0.5 transition-all duration-300">
                hello@makemymemory.in
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
