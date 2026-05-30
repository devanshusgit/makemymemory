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
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.255.949c-1.238.503-2.335 1.236-3.356 2.259-1.02 1.02-1.756 2.117-2.259 3.355-.603 1.692-.757 3.545-.418 5.247.338 1.702 1.138 3.194 2.259 4.316 1.121 1.121 2.613 1.921 4.315 2.259 1.702.339 3.555.185 5.247-.418 1.238-.503 2.335-1.236 3.356-2.259 1.02-1.02 1.756-2.117 2.259-3.355.603-1.692.757-3.545.418-5.247-.338-1.702-1.138-3.194-2.259-4.316-1.121-1.121-2.613-1.921-4.315-2.259-1.702-.338-3.555-.184-5.247.418z" />
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
