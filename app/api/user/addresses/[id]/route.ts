import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { Types } from "mongoose";

/**
 * PATCH /api/user/addresses/[id] - Set address as default (no content changes allowed)
 * DELETE /api/user/addresses/[id] - Delete address
 */

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userSession = req.cookies.get("user_session")?.value;
    if (!userSession) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { email } = JSON.parse(userSession);
    const { isDefault } = await req.json();
    const addressId = params.id;

    if (!Types.ObjectId.isValid(addressId)) {
      return NextResponse.json({ error: "Invalid address ID" }, { status: 400 });
    }

    await connectDB();

    // Only allow setting as default, no content changes
    if (isDefault) {
      // Unset all other defaults
      await User.findOneAndUpdate(
        { email },
        { $set: { "addresses.$[].isDefault": false } }
      );

      // Set this one as default
      await User.findOneAndUpdate(
        { email, "addresses._id": new Types.ObjectId(addressId) },
        { $set: { "addresses.$.isDefault": true } }
      );
    }

    const user = await User.findOne({ email });

    return NextResponse.json({
      success: true,
      message: "Address set as default",
      addresses: user?.addresses,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update address" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userSession = req.cookies.get("user_session")?.value;
    if (!userSession) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { email } = JSON.parse(userSession);
    const addressId = params.id;

    if (!Types.ObjectId.isValid(addressId)) {
      return NextResponse.json({ error: "Invalid address ID" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOneAndUpdate(
      { email },
      { $pull: { addresses: { _id: new Types.ObjectId(addressId) } } },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Address deleted successfully",
      addresses: user?.addresses,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }
}
