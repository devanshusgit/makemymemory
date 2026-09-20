import { NextRequest, NextResponse } from "next/server";
import { parseSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  // Verifies the cookie's signature; a forged or legacy unsigned cookie
  // reads as logged out.
  const user = parseSession(req.cookies.get("user_session")?.value);
  return NextResponse.json({ user: user ?? null });
}
