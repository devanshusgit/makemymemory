"use client";

import { useEffect, useState } from "react";

export default function MaintenancePage() {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#FAF8F4" }}
    >
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <img
            src="/logo.png"
            alt="Make My Memory"
            className="h-12 w-auto"
          />
        </div>

        {/* Divider */}
        <div
          className="h-px w-12 mx-auto mb-8"
          style={{ backgroundColor: "#C9A84C" }}
        />

        {/* Heading */}
        <h1
          className="font-serif font-bold text-4xl mb-4"
          style={{ color: "#1A1A1A" }}
        >
          We&apos;re Crafting Something Beautiful
        </h1>

        {/* Subtext */}
        <p
          className="text-sm leading-relaxed mb-8"
          style={{ color: "#6B6560" }}
        >
          Our store is currently undergoing scheduled maintenance to bring you an
          even better experience. We&apos;ll be back shortly with new memories to
          cherish. Thank you for your patience and love.
        </p>

        {/* Animated dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full animate-pulse"
              style={{
                backgroundColor: "#C9A84C",
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>

        {/* Expected back */}
        <p
          className="text-sm font-medium mb-8"
          style={{ color: "#C9A84C" }}
        >
          Expected back soon ✨
        </p>

        {/* Divider */}
        <div
          className="h-px w-12 mx-auto mb-8"
          style={{ backgroundColor: "#C9A84C" }}
        />

        {/* Contact section */}
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-4"
          style={{ color: "#6B6560" }}
        >
          For urgent queries:
        </p>

        <div className="flex flex-col gap-3">
          {/* Email */}
          <a
            href="mailto:hello@makemymemory.in"
            className="inline-flex items-center justify-center text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: "#C9A84C" }}
          >
            📧 hello@makemymemory.in
          </a>

          {/* WhatsApp */}
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#25D366" }}
          >
            💬 WhatsApp Us
          </a>
        </div>
      </div>
    </div>
  );
}
