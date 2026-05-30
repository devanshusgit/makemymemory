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

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    
    // Get or create settings
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

    // Update allowed fields
    const allowedFields = [
      "reviewsActive",
      "maintenanceMode",
      "orderNotifications",
      "promotionsActive",
      "storeName",
      "phone",
      "address",
      "happyCustomers",
      "memoriesCreated",
      "averageRating",
      "founded",
    ];

    for (const field of allowedFields) {
      if (field in body) {
        (settings as any)[field] = body[field];
      }
    }

    await settings.save();

    return NextResponse.json({
      success: true,
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
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
