"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Shown when a page throws in the browser. Without this the App Router falls
 * back to a blank white screen reading "Application error: a client-side
 * exception has occurred", which tells the visitor nothing and leaves no way
 * to report what broke — the digest below is the only handle on the real
 * error once the code is minified in production.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[page error]", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-20"
      style={{ backgroundColor: "#FAF8F4" }}>
      <div className="max-w-md w-full text-center">
        <span className="inline-flex items-center gap-2 text-xs font-semibold
                         tracking-widest uppercase mb-5" style={{ color: "#C9A84C" }}>
          <span className="w-5 h-px" style={{ backgroundColor: "#C9A84C" }} />
          Something went wrong
          <span className="w-5 h-px" style={{ backgroundColor: "#C9A84C" }} />
        </span>

        <h1 className="font-serif font-bold text-2xl sm:text-3xl mb-3" style={{ color: "#1A1A1A" }}>
          This page didn&apos;t load
        </h1>
        <p className="text-sm leading-relaxed mb-8" style={{ color: "#6B6560" }}>
          Sorry — something broke on our side, not yours. Try again, and if it keeps
          happening please send us the reference below.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#1A1A1A" }}
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-6 py-3 rounded-full text-sm font-semibold transition-colors"
            style={{ border: "1px solid #E8D5A3", color: "#1A1A1A" }}
          >
            Back to home
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 text-xs" style={{ color: "#8A8378" }}>
            Reference: <code className="font-mono">{error.digest}</code>
          </p>
        )}
      </div>
    </div>
  );
}
