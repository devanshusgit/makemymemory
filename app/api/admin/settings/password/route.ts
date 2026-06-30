import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Settings from "@/lib/db/models/Settings";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const session = cookieStore.get("admin_session");

    if (!session?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { oldPassword, newPassword } = body;

    // Validate inputs
    if (typeof oldPassword !== "string" || typeof newPassword !== "string") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    await connectDB();
    const settings = await Settings.findOne({});

    // Verify old password (check database first, then env)
    const currentPassword = settings?.adminPassword || process.env.ADMIN_PASSWORD;
    if (!currentPassword || oldPassword !== currentPassword) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
    }

    // Update password in database
    if (settings) {
      settings.adminPassword = newPassword;
      await settings.save();
    } else {
      await Settings.create({ adminPassword: newPassword });
    }

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
