"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

type Gtag = (...args: unknown[]) => void;
type Fbq = (...args: unknown[]) => void;

/**
 * Reports a page view on client-side navigation.
 *
 * The gtag and Meta pixel snippets in app/layout.tsx each fire exactly once,
 * on the initial document load. This is an App Router app, so moving between
 * pages never reloads the document and neither tag fires again — a visitor who
 * browsed four pages was reported as a single page view with no further
 * events. GA4 reads that as a one-page session, which is the definition of a
 * bounce, so the bounce rate measured the tagging rather than the visitors.
 * Meta had the same blind spot: the pixel only ever saw the landing page,
 * which starves ad optimisation of the pages that actually matter.
 *
 * Only the pathname is watched. Query strings change on every shop filter
 * click, and counting those as page views would swing the numbers the other
 * way; reading them here would also need a Suspense boundary and would opt
 * every page out of static rendering.
 *
 * Consent is already handled upstream — Google Consent Mode holds GA4 and
 * `fbq('consent', ...)` holds the pixel until the visitor accepts — so these
 * calls are safe to make unconditionally.
 */
export default function RouteAnalytics() {
  const pathname = usePathname();
  // The tags fired for this path already during their own load.
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const w = window as unknown as { gtag?: Gtag; fbq?: Fbq };

    w.gtag?.("event", "page_view", {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    });

    w.fbq?.("track", "PageView");
  }, [pathname]);

  return null;
}
