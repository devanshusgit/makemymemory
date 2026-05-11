"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const STORAGE_KEY = "mmm_popup_v1";

export default function EntryPopup() {
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const seen = sessionStorage.getItem(STORAGE_KEY);
    if (!seen) {
      const t = setTimeout(() => setVisible(true), 500);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  const handleShopNow = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
    router.push("/shop");
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50"
            style={{ backgroundColor: "rgba(26,26,26,0.7)", backdropFilter: "blur(4px)" }}
            onClick={dismiss}
          />

          {/* Modal */}
          <motion.div
            key="popup"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ pointerEvents: "none" }}
          >
            <div
              className="relative w-full max-w-md rounded-2xl p-8 sm:p-10 text-center"
              style={{ backgroundColor: "#1A1A1A", pointerEvents: "auto" }}
            >
              {/* Close */}
              <button onClick={dismiss} aria-label="Close"
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center
                           transition-colors duration-200 hover:bg-white/10"
                style={{ color: "rgba(232,213,163,0.5)" }}>
                <X className="w-4 h-4" />
              </button>

              {/* Gold heart icon */}
              <div className="text-5xl mb-5">💛</div>

              {/* Title */}
              <h2 className="font-serif font-bold mb-3"
                style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", color: "#C9A84C" }}>
                Crafted for a Lifetime
              </h2>

              {/* Subtitle */}
              <p className="text-sm leading-relaxed mb-8"
                style={{ color: "rgba(232,213,163,0.7)", fontFamily: "var(--font-dm-sans)" }}>
                Turn your most precious moments into beautiful, lasting keepsakes.
                Personalised with love — delivered to your door.
              </p>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={handleShopNow}
                  className="inline-flex items-center justify-center px-7 py-3 rounded-full
                             text-sm font-semibold transition-all duration-300
                             hover:bg-[#C9A84C] hover:text-[#1A1A1A]"
                  style={{ border: "1.5px solid #C9A84C", color: "#C9A84C" }}>
                  Shop Now
                </button>
                <button onClick={dismiss}
                  className="inline-flex items-center justify-center px-7 py-3 rounded-full
                             text-sm font-semibold transition-all duration-300
                             hover:bg-white/10"
                  style={{ color: "rgba(232,213,163,0.5)" }}>
                  Maybe later
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
