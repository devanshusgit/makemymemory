"use client";

import Link from "next/link";
import { Instagram, Facebook, Mail, Phone } from "lucide-react";

const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com/makemymemory";
const WHATSAPP_URL = process.env.NEXT_PUBLIC_WHATSAPP_URL 
  ? `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_URL}?text=Hi%20Make%20My%20Memory%2C%20I%20have%20a%20query`
  : "https://wa.me/919876543210?text=Hi%20Make%20My%20Memory%2C%20I%20have%20a%20query";

const footerLinks = {
  Shop: [
    { label: "Gold Foil Imprints", href: "/shop?category=foil-imprints" },
    { label: "All Products", href: "/shop" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Gallery", href: "/gallery" },
  ],
  Support: [
    { label: "Reviews", href: "/reviews" },
    { label: "Account", href: "/account" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms & Conditions", href: "/terms" },
  ],
};

function WhatsAppIcon({ className }: { className: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.05 4.91L15.1 0.96c-.5-.5-1.3-.5-1.8 0l-3.54 3.54c-.5.5-.5 1.3 0 1.8L9.1 10.5c.1.1.1.3 0 .4l-5.33 5.33c-.1.1-.3.1-.4 0L0 12.9c-.5-.5-1.3-.5-1.8 0L-5.34 16.44c-.5.5-.5 1.3 0 1.8l3.95 3.95c.5.5 1.3.5 1.8 0l3.54-3.54c.5-.5.5-1.3 0-1.8L10.9 13.5c-.1-.1-.1-.3 0-.4l5.33-5.33c.1-.1.3-.1.4 0l4.24 4.24c.5.5 1.3.5 1.8 0l3.54-3.54c.5-.5.5-1.3 0-1.8z" />
    </svg>
  );
}

// Simple WhatsApp chat bubble icon for footer (matches Instagram/Facebook theme)
function WhatsAppPhoneIcon({ className }: { className: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      {/* Chat bubble with phone receiver */}
      <path d="M20.5 3H3.5C2.12 3 1 4.12 1 5.5V15.5C1 16.88 2.12 18 3.5 18H6.5L9 20.5L11.5 18H20.5C21.88 18 23 16.88 23 15.5V5.5C23 4.12 21.88 3 20.5 3ZM12 15C10.6 15 9.5 13.9 9.5 12.5C9.5 11.1 10.6 10 12 10C13.4 10 14.5 11.1 14.5 12.5C14.5 13.9 13.4 15 12 15Z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="text-[#E8D5A3]" style={{ backgroundColor: "#1A1A1A" }}>
      <div className="section-wrap py-16 sm:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/"
              className="font-serif font-bold text-xl mb-4 block transition-colors duration-200"
              style={{ color: "#C9A84C" }}>
              Make My Memory
            </Link>
            <p className="text-sm leading-relaxed mb-6 max-w-xs"
              style={{ color: "rgba(232,213,163,0.65)" }}>
              Turning your precious moments into beautiful, lasting keepsakes crafted with love.
            </p>
            <div className="flex gap-3">
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full flex items-center justify-center
                           transition-all duration-200
                           hover:bg-[#C9A84C] hover:text-[#1A1A1A]"
                style={{
                  backgroundColor: "rgba(201,168,76,0.1)",
                  color: "#C9A84C",
                  border: "1px solid rgba(201,168,76,0.2)",
                }}>
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://www.facebook.com/share/1FxXf4Z36i/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full flex items-center justify-center
                           transition-all duration-200
                           hover:bg-[#C9A84C] hover:text-[#1A1A1A]"
                style={{
                  backgroundColor: "rgba(201,168,76,0.1)",
                  color: "#C9A84C",
                  border: "1px solid rgba(201,168,76,0.2)",
                }}>
                <Facebook className="w-4 h-4" />
              </a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 rounded-full flex items-center justify-center
                           transition-all duration-200
                           hover:bg-[#C9A84C] hover:text-[#1A1A1A]"
                style={{
                  backgroundColor: "rgba(201,168,76,0.1)",
                  color: "#C9A84C",
                  border: "1px solid rgba(201,168,76,0.2)",
                }}>
                <WhatsAppPhoneIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-xs font-semibold tracking-widest uppercase mb-4"
                style={{ color: "#C9A84C" }}>
                {title}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}
                      className="text-sm transition-colors duration-200 hover:text-[#C9A84C]"
                      style={{ color: "rgba(232,213,163,0.65)" }}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4"
          style={{ borderTop: "1px solid rgba(201,168,76,0.2)" }}>
          <p className="text-xs" style={{ color: "rgba(232,213,163,0.35)" }}>
            © {new Date().getFullYear()} Make My Memory. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs"
            style={{ color: "rgba(232,213,163,0.35)" }}>
            <a href="mailto:hello@makemymemory.in"
              className="flex items-center gap-1.5 transition-colors duration-200 hover:text-[#C9A84C]">
              <Mail className="w-3.5 h-3.5" />
              hello@makemymemory.in
            </a>
            <a href="tel:+918097489800"
              className="flex items-center gap-1.5 transition-colors duration-200 hover:text-[#C9A84C]">
              <Phone className="w-3.5 h-3.5" />
              +91 80974 89800
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
