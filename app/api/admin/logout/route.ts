import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const res = NextResponse.json({ success: true, message: "Admin logged out successfully" });
    
    // Clear admin session cookie
    res.cookies.delete("admin_session");
    
    return res;
  } catch (error) {
    return NextResponse.json({ error: "Admin logout failed" }, { status: 500 });
  }
}
