import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdminCookieValue } from "@/lib/auth/admin";
import { connectDB } from "@/lib/db/connect";
import ContactMessage from "@/lib/db/models/ContactMessage";

export const dynamic = "force-dynamic";

// GET - Fetch all contact messages
export async function GET(req: NextRequest) {
  try {
    if (!isAdminCookieValue(cookies().get("admin_session")?.value)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const messages = await ContactMessage.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
