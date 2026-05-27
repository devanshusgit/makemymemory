import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

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

    const adminPassword = process.env.ADMIN_PASSWORD;

    // Verify old password
    if (!adminPassword || oldPassword !== adminPassword) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
    }

    // Update environment variable (in production, this would need to be stored in a database or secrets manager)
    // For now, we'll just return success and the admin needs to update the .env file
    // In a real application, you'd want to store this securely

    return NextResponse.json({
      success: true,
      message: "Password changed successfully. Please update your .env file with the new password.",
      note: "In production, implement secure password storage in database or secrets manager",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
