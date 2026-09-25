import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { cookies } from "next/headers";
import { parseSession, sessionUserFilter } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Get user from session
    const cookieStore = cookies();
    const filter = sessionUserFilter(parseSession(cookieStore.get("user_session")?.value));

    if (!filter) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user from database
    const userData = await User.findOne(filter).select("name email phone addresses");

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        addresses: userData.addresses || [],
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    // Get user from session
    const cookieStore = cookies();
    const filter = sessionUserFilter(parseSession(cookieStore.get("user_session")?.value));

    if (!filter) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();

    // Only the name is editable here. Phone used to be settable to any number
    // without verification — and orders are matched to an account by phone,
    // so typing in someone else's number showed you their orders and address.
    // A number change has to go through support (or a verified OTP flow).
    if (typeof name !== "string" || !name.trim() || name.trim().length > 80) {
      return NextResponse.json({ error: "Please enter your name (up to 80 characters)." }, { status: 400 });
    }

    const updatedUser = await User.findOneAndUpdate(
      filter,
      { $set: { name: name.trim() } },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
