"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";

/**
 * Asks before any analytics or advertising cookie is set, and actually obeys
 * the answer.
 *
 * It used to store "accepted"/"declined" in localStorage and nothing ever read
 * it — Google Analytics and the Meta pixel loaded for every visitor, so
 * "Decline" did nothing. The consent defaults in app/layout.tsx now start both
 * DENIED; this banner grants them for a visitor who accepts, and keeps them
 * denied (and clears anything already set) for one who declines.
 *
 * The footer's "Cookie preferences" link reopens it, so a choice can be
 * withdrawn as easily as it was given.
 */

type Consent = "accepted" | "declined";

export const OPEN_COOKIE_PREFERENCES = "open-cookie-preferences";
const STORAGE_KEY = "cookie_consent";

type Gtag = (...args: unknown[]) => void;
type Fbq = (...args: unknown[]) => void;

function readConsent(): Consent | null {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "accepted" || v === "declined" ? v : null;
  } catch {
    return null;
  }
}

function saveConsent(value: Consent) {
  try { window.localStorage.setItem(STORAGE_KEY, value); } catch { /* private mode */ }
  (window as unknown as { __cookieConsent?: Consent }).__cookieConsent = value;
}

/**
 * Writes Meta's _fbc click cookie from the fbclid saved at landing, before the
 * pixel is granted. The pixel builds _fbc from the CURRENT URL when consent is
 * granted, so a visitor who browsed to another page first would otherwise lose
 * the ad attribution entirely.
 */
function restoreFbc() {
  try {
    if (document.cookie.split(";").some((c) => c.trim().startsWith("_fbc="))) return;
    const raw = window.sessionStorage.getItem("mmm_fbclid");
    if (!raw) return;
    const { id, ts } = JSON.parse(raw) as { id?: string; ts?: number };
    if (!id || !ts) return;
    const parts = window.location.hostname.split(".");
    const domain = parts.length >= 2 ? `; domain=.${parts.slice(-2).join(".")}` : "";
    document.cookie = `_fbc=fb.1.${ts}.${id}; Max-Age=${90 * 24 * 3600}; path=/; SameSite=Lax${domain}`;
  } catch { /* storage blocked */ }
}

function applyConsent(value: Consent, previous: Consent | null) {
  const granted = value === "accepted" ? "granted" : "denied";
  const w = window as unknown as { gtag?: Gtag; fbq?: Fbq };

  w.gtag?.("consent", "update", {
    ad_storage: granted,
    ad_user_data: granted,
    ad_personalization: granted,
    analytics_storage: granted,
  });

  if (value === "accepted") {
    // Re-confirming from "Cookie preferences" must not send a second PageView:
    // this page's PageView already went out at load for an accepted visitor.
    if (previous === "accepted") return;
    restoreFbc();
    w.fbq?.("consent", "grant");
  } else {
    w.fbq?.("consent", "revoke");
    clearTrackingCookies();
  }
}

/** Removes analytics/ad cookies that may already exist from before a decline. */
function clearTrackingCookies() {
  const names = document.cookie
    .split(";")
    .map((c) => c.split("=")[0].trim())
    .filter((n) => n === "_ga" || n.startsWith("_ga_") || n === "_fbp" || n === "_fbc" || n === "_gid");
  if (!names.length) return;

  // Cookies are set on the bare host and on the registrable domain; clear both.
  const host = window.location.hostname;
  const parts = host.split(".");
  const domains = new Set<string>(["", host]);
  if (parts.length >= 2) domains.add("." + parts.slice(-2).join("."));
  if (parts.length >= 3) domains.add("." + parts.slice(-3).join("."));

  for (const name of names) {
    for (const domain of Array.from(domains)) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ""}`;
    }
  }
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!readConsent()) setVisible(true);

    const reopen = () => setVisible(true);
    window.addEventListener(OPEN_COOKIE_PREFERENCES, reopen);
    return () => window.removeEventListener(OPEN_COOKIE_PREFERENCES, reopen);
  }, []);

  const choose = (value: Consent) => {
    const previous = readConsent();
    saveConsent(value);
    applyConsent(value, previous);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie preferences"
      className="fixed bottom-0 left-0 right-0 z-50 bg-canvas border-t border-stone-200 shadow-lift"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row
                      items-start sm:items-center gap-3 justify-between">
        <p className="text-sm text-stone-600 flex-1">
          We use cookies from Google Analytics and Meta to understand visits and measure our ads.
          The site works fully either way.{" "}
          <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-ink transition-colors">
            Learn more
          </Link>
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => choose("declined")}
            className="px-4 py-1.5 text-sm font-medium border border-stone-300 rounded-lg
                       text-stone-600 hover:bg-stone-100 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={() => choose("accepted")}
            className="px-4 py-1.5 text-sm font-medium border border-stone-300 rounded-lg
                       text-stone-600 hover:bg-stone-100 transition-colors"
          >
            Accept
          </button>
          <button
            onClick={() => choose("declined")}
            aria-label="Close and decline"
            className="text-stone-400 hover:text-ink transition-colors ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
