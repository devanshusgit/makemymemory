import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = req.cookies.get("user_session")?.value;
  
  return NextResponse.json({
    sessionExists: !!session,
    sessionValue: session || null,
    allCookies: Object.fromEntries(
      Array.from(req.cookies.getAll()).map(c => [c.name, c.value.substring(0, 50)])
    ),
  });
}

// POST for testing purposes
export async function POST(req: NextRequest) {
  const session = req.cookies.get("user_session")?.value;
  
  let parsedSession = null;
  let parseError = null;

  if (session) {
    try {
      parsedSession = JSON.parse(session);
    } catch (e) {
      parseError = "Failed to parse session JSON";
    }
  }

  return NextResponse.json({
    sessionExists: !!session,
    sessionValue: session ? session.substring(0, 100) : null,
    parsedSession,
    parseError,
    allCookies: Object.fromEntries(
      Array.from(req.cookies.getAll()).map(c => [c.name, c.value.substring(0, 50)])
    ),
  });
}
