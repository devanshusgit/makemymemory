import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Settings from "@/lib/db/models/Settings";

export const dynamic = "force-dynamic";

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
        happyCustomers: 1000,
        memoriesCreated: 1000,
        averageRating: 0,
        founded: 2026,
        reviewsActive: true,
        maintenanceMode: false,
        orderNotifications: false,
      });
    }

    return NextResponse.json({
      settings: {
        storeName: settings.storeName,
        phone: settings.phone,
        address: settings.address,
        happyCustomers: settings.happyCustomers,
        memoriesCreated: settings.memoriesCreated,
        averageRating: settings.averageRating,
        founded: settings.founded,
        reviewsActive: settings.reviewsActive,
        maintenanceMode: settings.maintenanceMode,
        orderNotifications: settings.orderNotifications,
        promotionsActive: settings.promotionsActive,
      },
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
