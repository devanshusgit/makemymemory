"use client";

import { useEffect } from "react";

/**
 * Admin-only error screen. Unlike the public one it shows the actual error
 * message, so when an admin page breaks the owner can screenshot something
 * that says what went wrong (browser errors carry no server reference).
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin page error]", error);
  }, [error]);

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-xl bg-white rounded-2xl border border-red-200 p-6 space-y-4">
        <h1 className="font-serif font-bold text-xl text-[#2C2520]">This admin page hit an error</h1>
        <p className="text-sm text-stone-600">
          Nothing was lost. Click Try again. If it keeps happening, send a screenshot of this box.
        </p>
        <pre className="text-xs bg-red-50 text-red-700 rounded-xl p-3 whitespace-pre-wrap break-words">
          {error.message || "Unknown error"}
          {error.digest ? `\nReference: ${error.digest}` : ""}
        </pre>
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ backgroundColor: "#1A1A1A" }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
