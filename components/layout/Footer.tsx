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
                           hover:bg-[#C9A84C] hover:text-[#1A1A1A] group"
                style={{
                  backgroundColor: "rgba(201,168,76,0.1)",
                  border: "1px solid rgba(201,168,76,0.2)",
                }}>
                <svg className="w-5 h-5" viewBox="0 0 175.216 175.552" fill="none">
                  <defs>
                    <linearGradient id="whatsappGradient" x1="85.915" x2="86.535" y1="32.567" y2="137.092" gradientUnits="userSpaceOnUse">
                      <stop offset="0" stopColor="#C9A84C"/>
                      <stop offset="1" stopColor="#C9A84C"/>
                    </linearGradient>
                  </defs>
                  <path fill="url(#whatsappGradient)" className="group-hover:fill-[#1A1A1A]" d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.312-6.179 22.559 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.518 31.126 8.524h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.929z"/>
                  <path fill="#fff" fillRule="evenodd" d="M68.772 55.603c-1.378-3.061-2.828-3.123-4.137-3.176l-3.524-.043c-1.226 0-3.218.46-4.902 2.3s-6.435 6.287-6.435 15.332 6.588 17.785 7.506 19.013 12.718 20.381 31.405 27.75c15.529 6.124 18.689 4.906 22.061 4.6s10.877-4.447 12.408-8.74 1.532-7.971 1.073-8.74-1.685-1.226-3.525-2.146-10.877-5.367-12.562-5.981-2.91-.919-4.137.921-4.746 5.979-5.819 7.206-2.144 1.381-3.984.462-7.76-2.861-14.784-9.124c-5.465-4.873-9.154-10.891-10.228-12.73s-.114-2.835.808-3.751c.825-.824 1.838-2.147 2.759-3.22s1.224-1.84 1.836-3.065.307-2.301-.153-3.22-4.032-10.011-5.666-13.647"/>
                </svg>
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
