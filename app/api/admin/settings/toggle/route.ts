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

    await connectDB();

    const body = await req.json();
    const { key, value } = body;

    // Validate inputs
    const validKeys = ["reviewsActive", "maintenanceMode", "orderNotifications"];
    if (!validKeys.includes(key) || typeof value !== "boolean") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Update or create settings
    const updateData: any = {};
    updateData[key] = value;

    const settings = await Settings.findOneAndUpdate(
      {},
      updateData,
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: `${key} updated successfully`,
      data: {
        [key]: settings[key as keyof typeof settings],
      },
    });
  } catch (error) {
    console.error("Error updating toggle:", error);
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
        reviewsActive: true,
        maintenanceMode: false,
        orderNotifications: false,
      });
    }

    return NextResponse.json({
      data: {
        reviewsActive: settings.reviewsActive,
        maintenanceMode: settings.maintenanceMode,
        orderNotifications: settings.orderNotifications,
      },
    });
  } catch (error) {
    console.error("Error fetching toggles:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
