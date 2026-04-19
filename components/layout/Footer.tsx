import Link from "next/link";
import { Instagram, Facebook, Twitter, Mail, Phone } from "lucide-react";

const footerLinks = {
  Shop: [
    { href: "/shop", label: "All Products" },
    { href: "/shop?category=photo-books", label: "Photo Books" },
    { href: "/shop?category=frames", label: "Frames" },
    { href: "/shop?category=mugs", label: "Mugs" },
  ],
  Help: [
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact Us" },
    { href: "/track", label: "Track Order" },
    { href: "/returns", label: "Returns" },
  ],
  Company: [
    { href: "/about", label: "About Us" },
    { href: "/blog", label: "Blog" },
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/terms-of-service", label: "Terms of Service" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="section-wrap py-16 sm:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="font-serif text-xl font-bold text-white mb-4 block">
              Make My{" "}
              <span className="text-sage">Memory</span>
            </Link>
            <p className="text-stone-400 text-sm leading-relaxed mb-6 max-w-xs">
              Turning your precious moments into beautiful, lasting keepsakes crafted with love.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Instagram, label: "Instagram" },
                { Icon: Facebook, label: "Facebook" },
                { Icon: Twitter, label: "Twitter" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-stone-800 flex items-center justify-center text-stone-400 hover:bg-sage hover:text-white transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-white text-xs font-semibold tracking-widest uppercase mb-4">
                {title}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-stone-400 hover:text-white text-sm transition-colors duration-200"
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
        <div className="border-t border-stone-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-stone-500 text-xs">
            © {new Date().getFullYear()} Make My Memory. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-stone-500 text-xs">
            <a
              href="mailto:hello@makemymemory.in"
              className="flex items-center gap-1.5 hover:text-sage transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              hello@makemymemory.in
            </a>
            <a
              href="tel:+919999999999"
              className="flex items-center gap-1.5 hover:text-sage transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              +91 99999 99999
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
