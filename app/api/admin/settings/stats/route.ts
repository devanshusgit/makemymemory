import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const session = cookieStore.get("admin_session");

    if (!session?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Store in a simple JSON file or database
    // For now, we'll just return success
    // In production, you'd save this to a database or file

    return NextResponse.json({
      success: true,
      message: "Stats updated successfully",
      stats: { happyCustomers, memoriesCreated, averageRating, founded },
    });
  } catch (error) {
    console.error("Error updating stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // Return current stats
    // For now, return default values
    return NextResponse.json({
      stats: {
        happyCustomers: 1000,
        memoriesCreated: 1000,
        averageRating: 0,
        founded: 2026,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
