import Link from "next/link";
import { Instagram, Facebook, Twitter, Mail, Phone } from "lucide-react";

const footerLinks = {
  Shop: [
    { href: "/shop",                    label: "All Products" },
    { href: "/shop?category=photo-books", label: "Photo Books" },
    { href: "/shop?category=frames",    label: "Frames" },
    { href: "/shop?category=mugs",      label: "Mugs" },
  ],
  Help: [
    { href: "/faq",     label: "FAQ" },
    { href: "/contact", label: "Contact Us" },
    { href: "/track",   label: "Track Order" },
    { href: "/returns", label: "Returns" },
  ],
  Company: [
    { href: "/about",           label: "About Us" },
    { href: "/blog",            label: "Blog" },
    { href: "/privacy-policy",  label: "Privacy Policy" },
    { href: "/terms-of-service", label: "Terms of Service" },
  ],
};

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#1A1A1A", color: "#E8D5A3" }}>
      <div className="section-wrap py-16 sm:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="font-serif font-bold text-xl mb-4 block"
              style={{ color: "#C9A84C" }}>
              Make My Memory
            </Link>
            <p className="text-sm leading-relaxed mb-6 max-w-xs" style={{ color: "#E8D5A3", opacity: 0.7 }}>
              Turning your precious moments into beautiful, lasting keepsakes crafted with love.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Instagram, label: "Instagram", href: "https://www.instagram.com/makemymemory.in?igsh=MWVzZGZoN2FhNG8zNw==" },
                { Icon: Facebook,  label: "Facebook",  href: "#" },
                { Icon: Twitter,   label: "Twitter",   href: "#" },
              ].map(({ Icon, label, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
                  style={{ backgroundColor: "rgba(201,168,76,0.1)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#C9A84C"; (e.currentTarget as HTMLElement).style.color = "#1A1A1A"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(201,168,76,0.1)"; (e.currentTarget as HTMLElement).style.color = "#C9A84C"; }}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
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
                      className="text-sm transition-colors duration-200"
                      style={{ color: "rgba(232,213,163,0.65)" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#C9A84C"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(232,213,163,0.65)"; }}
                    >
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
          <p className="text-xs" style={{ color: "rgba(232,213,163,0.4)" }}>
            © {new Date().getFullYear()} Make My Memory. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs"
            style={{ color: "rgba(232,213,163,0.4)" }}>
            <a href="mailto:hello@makemymemory.in"
              className="flex items-center gap-1.5 transition-colors duration-200"
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#C9A84C"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(232,213,163,0.4)"; }}>
              <Mail className="w-3.5 h-3.5" />
              hello@makemymemory.in
            </a>
            <a href="tel:+919999999999"
              className="flex items-center gap-1.5 transition-colors duration-200"
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#C9A84C"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(232,213,163,0.4)"; }}>
              <Phone className="w-3.5 h-3.5" />
              +91 99999 99999
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
