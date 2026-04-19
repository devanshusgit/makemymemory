"use client";

import Link from "next/link";

export default function ReadReviewsTab() {
  return (
    <Link
      href="/reviews"
      aria-label="Read Reviews"
      className="fixed right-0 top-1/2 -translate-y-1/2 z-30
                 flex items-center justify-center
                 bg-sage-dark text-canvas
                 rounded-l-xl shadow-lift
                 hover:bg-sage hover:pr-1 transition-all duration-300"
      style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
    >
      <span className="flex items-center gap-2 px-3 py-5 text-xs font-semibold tracking-widest uppercase"
        style={{ writingMode: "vertical-rl", transform: "rotate(0deg)" }}>
        <span className="text-base">★</span>
        Read Reviews
      </span>
    </Link>
  );
}
