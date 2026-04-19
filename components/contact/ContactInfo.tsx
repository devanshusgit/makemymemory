"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";

const ease = [0.4, 0, 0.2, 1] as const;

const CONTACT_ITEMS = [
  {
    Icon: Mail,
    label: "Email Us",
    value: "hello@makemymemory.in",
    sub: "We reply within 24 hours",
    href: "mailto:hello@makemymemory.in",
    color: "bg-sage/10 text-sage-dark",
  },
  {
    Icon: Phone,
    label: "Call Us",
    value: "+91 99999 99999",
    sub: "Mon–Sat, 10 AM–6 PM IST",
    href: "tel:+919999999999",
    color: "bg-stone-100 text-stone-600",
  },
  {
    Icon: MessageCircle,
    label: "WhatsApp",
    value: "+91 99999 99999",
    sub: "Quick replies on WhatsApp",
    href: "https://wa.me/919999999999",
    color: "bg-sage/10 text-sage-dark",
  },
  {
    Icon: MapPin,
    label: "Visit Us",
    value: "Mumbai, Maharashtra",
    sub: "India — 400001",
    href: "https://maps.google.com/?q=Mumbai,Maharashtra,India",
    color: "bg-stone-100 text-stone-600",
  },
];

export default function ContactInfo() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {CONTACT_ITEMS.map((item, i) => {
        const { Icon } = item;
        return (
          <motion.a
            key={item.label}
            href={item.href}
            target={item.href.startsWith("http") ? "_blank" : undefined}
            rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07, duration: 0.45, ease }}
            className="group bg-white rounded-3xl p-5 shadow-soft border border-stone-100
                       hover:shadow-card hover:-translate-y-0.5 transition-all duration-300
                       flex flex-col gap-3"
          >
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center
                             shrink-0 transition-colors duration-200 ${item.color}`}>
              <Icon className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-widest uppercase
                             text-stone-400 mb-0.5">
                {item.label}
              </p>
              <p className="text-sm font-semibold text-ink group-hover:text-sage-dark
                             transition-colors leading-snug">
                {item.value}
              </p>
              <p className="text-[11px] text-stone-400 mt-0.5">{item.sub}</p>
            </div>
          </motion.a>
        );
      })}
    </div>
  );
}
