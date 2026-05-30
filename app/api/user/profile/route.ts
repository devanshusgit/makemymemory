import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { cookies } from "next/headers";

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    // Get user from session
    const cookieStore = cookies();
    const session = cookieStore.get("user_session");
    
    if (!session?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let user;
    try {
      const parsed = JSON.parse(session.value);
      user = parsed;
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    if (!user?.email) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone } = body;

    // Validate phone if provided
    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: "Invalid phone number. Must be 10 digits starting with 6-9." },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await User.findOneAndUpdate(
      { email: user.email },
      {
        ...(name && { name }),
        ...(phone && { phone }),
      },
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
