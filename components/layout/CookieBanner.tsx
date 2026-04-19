"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show only if user hasn't responded yet
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie_consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-canvas border-t border-stone-200 shadow-lift">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row
                      items-start sm:items-center gap-3 justify-between">
        <p className="text-sm text-stone-600 flex-1">
          We use cookies to ensure you get the best experience.{" "}
          <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-ink transition-colors">
            Learn more
          </Link>
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={decline}
            className="px-4 py-1.5 text-sm font-medium border border-stone-300 rounded-lg
                       text-stone-600 hover:bg-stone-100 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="px-4 py-1.5 text-sm font-medium border border-stone-300 rounded-lg
                       text-stone-600 hover:bg-stone-100 transition-colors"
          >
            Accept
          </button>
          <button onClick={decline} aria-label="Close" className="text-stone-400 hover:text-ink transition-colors ml-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
