import { NextRequest, NextResponse } from "next/server";

async function isMaintenanceMode(): Promise<boolean> {
  try {
    // Fetch from DB without caching
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/settings`,
      { cache: "no-store" }
    );
    
    if (!response.ok) return false;
    
    const data = await response.json();
    const isMaintenanceActive = data.settings?.maintenanceMode === true;
    
    return isMaintenanceActive;
  } catch (error) {
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
  const maintenanceActive = await isMaintenanceMode();
  
  if (maintenanceActive) {
    // Redirect to maintenance page
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
