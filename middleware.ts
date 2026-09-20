import { NextRequest, NextResponse } from "next/server";

// Every page request used to cost a settings fetch. Cache the flag per edge
// instance instead: 60s is short enough for an admin toggle to take effect,
// and it caps us at one settings call per minute per instance.
const SETTINGS_TTL_MS = 60_000;
const SETTINGS_TIMEOUT_MS = 2000;

let maintenanceCache: { value: boolean; expiresAt: number } | null = null;

async function isMaintenanceMode(request: NextRequest): Promise<boolean> {
  const now = Date.now();

  if (maintenanceCache && maintenanceCache.expiresAt > now) {
    return maintenanceCache.value;
  }

  try {
    // Resolve against the real request origin — NEXT_PUBLIC_APP_URL is unset in
    // production, so the old absolute URL pointed at localhost and always failed.
    const response = await fetch(new URL("/api/settings", request.url), {
      cache: "no-store",
      // A slow settings call must never hold up page rendering.
      signal: AbortSignal.timeout(SETTINGS_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`Settings request failed with status ${response.status}`);
    }

    const data = await response.json();
    const isMaintenanceActive = data.settings?.maintenanceMode === true;

    maintenanceCache = { value: isMaintenanceActive, expiresAt: now + SETTINGS_TTL_MS };

    return isMaintenanceActive;
  } catch (error) {
    // Fail open: an unreachable or slow settings API must never take the whole
    // store offline. Cache the miss too, so a sustained outage cannot put a
    // failing fetch in front of every single request.
    console.error("Maintenance check failed, treating site as live:", error);
    maintenanceCache = { value: false, expiresAt: now + SETTINGS_TTL_MS };

    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for admin routes, API routes, and maintenance page
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/maintenance") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  // Check maintenance mode
  const maintenanceActive = await isMaintenanceMode(request);
  
  if (maintenanceActive) {
    // Redirect to maintenance page
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Pages only. Skips API routes (the function above ignores them anyway),
     * Next internals, and any path with a file extension — images, icons,
     * robots.txt, sitemap.xml, manifest.json — so those no longer pay for
     * a middleware invocation on every request.
     */
    "/((?!api/|_next/static|_next/image|.*\\.[a-zA-Z0-9]+$).*)",
  ],
};
