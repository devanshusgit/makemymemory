import { NextRequest, NextResponse } from "next/server";

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
