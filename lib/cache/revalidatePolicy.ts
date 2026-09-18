import { revalidatePath } from "next/cache";

// Policy slug (as stored in the Policy collection) → the public page that renders it.
const POLICY_PAGES: Record<string, string> = {
  "privacy-policy":      "/privacy-policy",
  "terms-of-service":    "/terms-of-service",
  "shipping-policy":     "/shipping-policy",
  "returns-policy":      "/returns",
  "cancellation-policy": "/cancellation-policy",
};

/**
 * Policy pages are statically cached (ISR). Call this after an admin creates,
 * edits or deletes a policy so the public page shows the change immediately
 * instead of waiting for the page's revalidate window.
 */
export function revalidatePolicyPage(slug: string | undefined | null) {
  const path = slug ? POLICY_PAGES[slug] : undefined;
  if (path) revalidatePath(path);
}
