"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";

const ease = [0.4, 0, 0.2, 1] as const;

const EMAIL   = "support@makemymemory.in";
const PHONE   = "8097486800";
const PHONE_DISPLAY = "+91 80974 86800";

function PhoneCard() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <motion.button
        onClick={() => setOpen((v) => !v)}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.07, duration: 0.45, ease }}
        className="group bg-white rounded-3xl p-5 shadow-soft border border-stone-100
                   hover:shadow-card hover:-translate-y-0.5 transition-all duration-300
                   flex flex-col gap-3 w-full text-left"
      >
        <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0
                        bg-stone-100 text-stone-600 transition-colors duration-200">
          <Phone className="w-4 h-4" strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-[11px] font-semibold tracking-widest uppercase text-stone-400 mb-0.5">
            Call / WhatsApp
          </p>
          <p className="text-sm font-semibold text-ink group-hover:text-sage-dark
                        transition-colors leading-snug">
            {PHONE_DISPLAY}
          </p>
          <p className="text-[11px] text-stone-400 mt-0.5">Tap to call or WhatsApp</p>
        </div>
      </motion.button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute top-full mt-2 left-0 z-50 rounded-2xl overflow-hidden shadow-lg w-full"
          style={{ backgroundColor: "#fff", border: "1px solid #E8D5A3" }}
        >
          <a
            href={`tel:+91${PHONE}`}
            className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium
                       hover:bg-stone-50 transition-colors"
            style={{ color: "#1A1A1A" }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(201,168,76,0.12)" }}>
              <Phone className="w-4 h-4" style={{ color: "#C9A84C" }} />
            </div>
            Call Us
          </a>
          <div style={{ height: "1px", backgroundColor: "#F0EBE1" }} />
          <a
            href={`https://wa.me/91${PHONE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium
                       hover:bg-stone-50 transition-colors"
            style={{ color: "#1A1A1A" }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(37,211,102,0.12)" }}>
              <MessageCircle className="w-4 h-4" style={{ color: "#25D366" }} />
            </div>
            WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}

const STATIC_ITEMS = [
  {
    Icon: Mail,
    label: "Email Us",
    value: EMAIL,
    sub: "We reply within 24 hours",
    href: `mailto:${EMAIL}`,
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
      {/* Email */}
      <motion.a
        href={`mailto:${EMAIL}`}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0, duration: 0.45, ease }}
        className="group bg-white rounded-3xl p-5 shadow-soft border border-stone-100
                   hover:shadow-card hover:-translate-y-0.5 transition-all duration-300
                   flex flex-col gap-3"
      >
        <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0
                        bg-sage/10 text-sage-dark">
          <Mail className="w-4 h-4" strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-[11px] font-semibold tracking-widest uppercase text-stone-400 mb-0.5">
            Email Us
          </p>
          <p className="text-sm font-semibold text-ink group-hover:text-sage-dark
                        transition-colors leading-snug break-all">
            {EMAIL}
          </p>
          <p className="text-[11px] text-stone-400 mt-0.5">We reply within 24 hours</p>
        </div>
      </motion.a>

      {/* Phone — with call/whatsapp dropdown */}
      <PhoneCard />

      {/* Map */}
      <motion.a
        href="https://maps.google.com/?q=Mumbai,Maharashtra,India"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.14, duration: 0.45, ease }}
        className="group bg-white rounded-3xl p-5 shadow-soft border border-stone-100
                   hover:shadow-card hover:-translate-y-0.5 transition-all duration-300
                   flex flex-col gap-3 col-span-2"
      >
        <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0
                        bg-stone-100 text-stone-600">
          <MapPin className="w-4 h-4" strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-[11px] font-semibold tracking-widest uppercase text-stone-400 mb-0.5">
            Visit Us
          </p>
          <p className="text-sm font-semibold text-ink group-hover:text-sage-dark transition-colors leading-snug">
            Mumbai, Maharashtra
          </p>
          <p className="text-[11px] text-[#C9A84C] mt-1.5 font-medium">Open in Google Maps ↗</p>
        </div>
      </motion.a>
    </div>
  );
}
