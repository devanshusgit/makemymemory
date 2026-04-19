"use client";

import Link from "next/link";

export default function ReadReviewsTab() {
  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-30 pointer-events-none">
      <Link
        href="/reviews"
        aria-label="Read Reviews"
        className="pointer-events-auto block bg-sage-dark text-canvas
                   rounded-l-lg shadow-lift hover:bg-sage transition-colors duration-200"
        style={{ width: "26px", cursor: "pointer" }}
      >
        <span
          className="flex items-center justify-center gap-1.5 py-5 text-[10px] font-semibold tracking-widest uppercase"
          style={{ writingMode: "vertical-rl", transform: "rotate(0deg)" }}
        >
          <span>★</span>
          Read Reviews
        </span>
      </Link>
    </div>
  );
}
