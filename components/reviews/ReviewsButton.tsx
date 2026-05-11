"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import ReviewsModal from "./ReviewsModal";

export default function ReviewsButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Fixed Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3
                   rounded-full font-semibold text-sm shadow-lg
                   transition-all duration-300 hover:shadow-xl
                   bg-[#C9A84C] text-[#1A1A1A]
                   sm:bottom-8 sm:right-8"
      >
        <Star className="w-4 h-4 fill-current" />
        Read Reviews
      </motion.button>

      {/* Modal */}
      <ReviewsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
