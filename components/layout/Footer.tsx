"use client";

import Link from "next/link";
import { Instagram, Facebook, Mail, Phone } from "lucide-react";

const footerLinks = {
  Shop: [
    { href: "/shop",      label: "Shop All" },
    { href: "/shop?category=foil-imprints", label: "Foil Imprints" },
    { href: "/shop?category=3d-casting",    label: "3D Casting" },
  ],
  Help: [
    { href: "/faq",       label: "FAQ" },
    { href: "/contact",   label: "Contact Us" },
    { href: "/track",     label: "Track Order" },
    { href: "/returns",   label: "Returns" },
  ],
  Company: [
    { href: "/about",            label: "About Us" },
    { href: "/privacy-policy",   label: "Privacy Policy" },
    { href: "/terms-of-service", label: "Terms of Service" },
    { href: "/shipping-policy",  label: "Shipping Policy" },
  ],
};

const INSTAGRAM_URL = "https://www.instagram.com/makemymemory.in?igsh=MWVzZGZoN2FhNG8zNw==";
const WHATSAPP_URL = "https://wa.me/918097489800";

// WhatsApp Icon Component
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 448 512"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
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
                <WhatsAppIcon className="w-4 h-4" />
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
            <a href="mailto:support@makemymemory.com"
              className="flex items-center gap-1.5 transition-colors duration-200 hover:text-[#C9A84C]">
              <Mail className="w-3.5 h-3.5" />
              support@makemymemory.com
            </a>
            <a href="tel:+918097489800"
              className="flex items-center gap-1.5 transition-colors duration-200 hover:text-[#C9A84C]">
              <Phone className="w-3.5 h-3.5" />
              +91 80974 89800
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 transition-colors duration-200 hover:text-[#C9A84C]">
              <WhatsAppIcon className="w-3.5 h-3.5" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
