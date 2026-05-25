"use client";

import Link from "next/link";
import { Star } from "lucide-react";

export default function ReviewsComingSoon() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="max-w-md w-full text-center">
        {/* Gold star icon */}
        <div className="flex justify-center mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(201,168,76,0.15)" }}
          >
            <Star
              className="w-8 h-8"
              style={{ color: "#C9A84C" }}
              fill="#C9A84C"
            />
          </div>
        </div>

        {/* Heading */}
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-ink mb-3">
          Reviews Coming Soon
        </h1>

        {/* Description */}
        <p className="text-stone-500 text-sm sm:text-base leading-relaxed mb-8">
          We&apos;re collecting verified reviews from our customers. Check back soon to see what people say about our personalised gifts and keepsakes!
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full
                       text-sm font-semibold transition-all duration-300
                       hover:bg-[#C9A84C] hover:text-[#1A1A1A]"
            style={{ backgroundColor: "#1A1A1A", color: "#FAF8F4" }}
          >
            Browse Products
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full
                       text-sm font-semibold transition-all duration-300
                       hover:bg-[#C9A84C] hover:text-[#1A1A1A]"
            style={{ border: "1.5px solid #C9A84C", color: "#C9A84C" }}
          >
            Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}
