"use client";

import { useEffect } from "react";

/**
 * Last resort: an error thrown in the root layout itself, where app/error.tsx
 * cannot help because the layout that would wrap it is the thing that failed.
 * It replaces the document, so it has to render its own <html> and <body> and
 * cannot rely on the app's fonts, CSS or components.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, backgroundColor: "#FAF8F4", color: "#1A1A1A",
                     fontFamily: "Georgia, 'Times New Roman', serif" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center",
                      justifyContent: "center", padding: "24px", textAlign: "center" }}>
          <div style={{ maxWidth: "420px" }}>
            <p style={{ fontFamily: "Helvetica, Arial, sans-serif", fontSize: "12px",
                        letterSpacing: "0.14em", textTransform: "uppercase",
                        color: "#C9A84C", marginBottom: "18px" }}>
              Make My Memory
            </p>
            <h1 style={{ fontSize: "28px", margin: "0 0 12px" }}>This page didn&apos;t load</h1>
            <p style={{ fontFamily: "Helvetica, Arial, sans-serif", fontSize: "14px",
                        lineHeight: 1.6, color: "#6B6560", margin: "0 0 28px" }}>
              Sorry — something broke on our side. Try again, and if it keeps happening
              please send us the reference below.
            </p>
            <button
              onClick={reset}
              style={{ fontFamily: "Helvetica, Arial, sans-serif", fontSize: "14px",
                       fontWeight: 600, color: "#FFFFFF", backgroundColor: "#1A1A1A",
                       border: "none", borderRadius: "999px", padding: "12px 26px",
                       cursor: "pointer" }}
            >
              Try again
            </button>
            {error.digest && (
              <p style={{ fontFamily: "monospace", fontSize: "12px", color: "#8A8378",
                          marginTop: "28px" }}>
                Reference: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
