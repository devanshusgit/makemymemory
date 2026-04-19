import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = req.cookies.get("user_session")?.value;
  if (!session) return NextResponse.json({ user: null });
  try {
    const user = JSON.parse(session);
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
