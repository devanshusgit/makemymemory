import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { parseSession, sessionUserFilter } from "@/lib/auth/session";

/**
 * GET /api/user/wishlist - Get user's wishlist
 * POST /api/user/wishlist - Add item to wishlist
 * DELETE /api/user/wishlist - Remove item from wishlist
 */

const WISHLIST_KEY = "wishlist";

export async function GET(req: NextRequest) {
  try {
    const filter = sessionUserFilter(parseSession(req.cookies.get("user_session")?.value));
    if (!filter) {
      return NextResponse.json({ wishlist: [] }, { status: 200 });
    }

    try {
      await connectDB();

      const user = await User.findOne(filter).select(`_doc.${WISHLIST_KEY}`).lean();

      return NextResponse.json({
        success: true,
        wishlist: (user as any)?.[WISHLIST_KEY] || [],
      });
    } catch {
      return NextResponse.json({ wishlist: [] }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const filter = sessionUserFilter(parseSession(req.cookies.get("user_session")?.value));
    if (!filter) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    await connectDB();

    // Use custom field storage
    const user = await User.findOne(filter).lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const wishlist = (user as any)[WISHLIST_KEY] || [];
    if (!wishlist.includes(productId)) {
      wishlist.push(productId);

      await User.updateOne(
        filter,
        { [WISHLIST_KEY]: wishlist }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Added to wishlist",
      wishlist,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update wishlist" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const filter = sessionUserFilter(parseSession(req.cookies.get("user_session")?.value));
    if (!filter) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    await connectDB();

    await User.updateOne(
      filter,
      { $pull: { [WISHLIST_KEY]: productId } }
    );

    const user = await User.findOne(filter).lean();
    const wishlist = (user as any)?.[WISHLIST_KEY] || [];

    return NextResponse.json({
      success: true,
      message: "Removed from wishlist",
      wishlist,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update wishlist" }, { status: 500 });
  }
}
