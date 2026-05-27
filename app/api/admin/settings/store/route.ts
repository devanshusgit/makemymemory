import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Settings from "@/lib/db/models/Settings";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const session = cookieStore.get("admin_session");

    if (!session?.value) {
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
