import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Settings from "@/lib/db/models/Settings";
import { isAdminCookieValue } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  try {
    // Any cookie value used to pass here — this compares it to ADMIN_PASSWORD.
    if (!isAdminCookieValue(cookies().get("admin_session")?.value)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { storeName, phone, address } = body;

    // Validate inputs
    if (typeof storeName !== "string" || typeof phone !== "string" || typeof address !== "string") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Update or create settings
    const settings = await Settings.findOneAndUpdate(
      {},
      {
        storeName,
        phone,
        address,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Store info updated successfully",
      data: {
        storeName: settings.storeName,
        phone: settings.phone,
        address: settings.address,
      },
    });
  } catch (error) {
    console.error("Error updating store info:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Get current settings or create default
    let settings = await Settings.findOne({});
    
    if (!settings) {
      settings = await Settings.create({
        storeName: "Make My Memory",
        phone: "",
        address: "",
      });
    }

    return NextResponse.json({
      data: {
        storeName: settings.storeName,
        phone: settings.phone,
        address: settings.address,
      },
    });
  } catch (error) {
    console.error("Error fetching store info:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
