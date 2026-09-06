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
    const { happyCustomers, memoriesCreated, averageRating, founded } = body;

    // Validate inputs
    if (
      typeof happyCustomers !== "number" ||
      typeof memoriesCreated !== "number" ||
      typeof averageRating !== "number" ||
      typeof founded !== "number"
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Update or create settings
    const settings = await Settings.findOneAndUpdate(
      {},
      {
        happyCustomers,
        memoriesCreated,
        averageRating,
        founded,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Stats updated successfully",
      stats: {
        happyCustomers: settings.happyCustomers,
        memoriesCreated: settings.memoriesCreated,
        averageRating: settings.averageRating,
        founded: settings.founded,
      },
    });
  } catch (error) {
    console.error("Error updating stats:", error);
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
        happyCustomers: 1000,
        memoriesCreated: 2500,
        averageRating: 0,
        founded: 2026,
      });
    }

    return NextResponse.json({
      stats: {
        happyCustomers: settings.happyCustomers,
        memoriesCreated: settings.memoriesCreated,
        averageRating: settings.averageRating,
        founded: settings.founded,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
