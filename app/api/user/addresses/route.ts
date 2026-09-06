import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { parseSession, sessionUserFilter } from "@/lib/auth/session";

/**
 * GET /api/user/addresses - Get user's saved addresses
 * POST /api/user/addresses - Add new address
 */

export async function GET(req: NextRequest) {
  try {
    const filter = sessionUserFilter(parseSession(req.cookies.get("user_session")?.value));
    if (!filter) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne(filter).select("addresses");

    return NextResponse.json({
      success: true,
      addresses: user?.addresses || [],
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const filter = sessionUserFilter(parseSession(req.cookies.get("user_session")?.value));
    if (!filter) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const address = await req.json();

    if (!address.label || !address.fullName || !address.phone || !address.address || !address.city || !address.state || !address.pincode) {
      return NextResponse.json({ error: "All address fields are required" }, { status: 400 });
    }

    await connectDB();

    // If this is marked as default, unset others
    if (address.isDefault) {
      await User.findOneAndUpdate(
        filter,
        { $set: { "addresses.$[].isDefault": false } }
      );
    }

    const user = await User.findOneAndUpdate(
      filter,
      { $push: { addresses: address } },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Address added successfully",
      addresses: user?.addresses,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add address" }, { status: 500 });
  }
}
