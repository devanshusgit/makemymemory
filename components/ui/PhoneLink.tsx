"use client";

import { useState, useRef, useEffect } from "react";
import { Phone, MessageCircle } from "lucide-react";

const PHONE    = "8097486800";
const PHONE_DISPLAY = "+91 80974 86800";
const WHATSAPP_URL  = `https://wa.me/91${PHONE}`;
const CALL_URL      = `tel:+91${PHONE}`;

interface PhoneLinkProps {
  className?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
}

export default function PhoneLink({ className = "", children, showIcon = true }: PhoneLinkProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className={className}
        aria-label="Contact by phone or WhatsApp"
      >
        {showIcon && <Phone className="w-3.5 h-3.5" />}
        {children ?? PHONE_DISPLAY}
      </button>

      {open && (
        <div
          className="absolute bottom-full mb-2 left-0 z-50 rounded-2xl overflow-hidden shadow-lg"
          style={{
            backgroundColor: "#fff",
            border: "1px solid #E8D5A3",
            minWidth: "180px",
          }}
        >
          <a
            href={CALL_URL}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium
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
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium
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

export { PHONE_DISPLAY, WHATSAPP_URL, CALL_URL };
