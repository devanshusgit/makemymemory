import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { Order } from "@/lib/db/models/Order";
import { Review } from "@/lib/db/models/Review";
import { Coupon } from "@/lib/db/models/Coupon";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Get user from session
    const session = req.cookies.get("user_session")?.value;
    
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    let user;
    try {
      user = JSON.parse(session);
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }

    if (!user?.email) {
      return NextResponse.json(
        { error: "Invalid session data" },
        { status: 401 }
      );
    }

    await connectDB();

    // Log deletion
    console.log("Deleting user account:", user.email);

    // Find the user
    const userDoc = await User.findOne({ email: user.email });
    if (!userDoc) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Delete all user orders
    const deletedOrders = await Order.deleteMany({
      "shippingAddress.email": user.email,
    });
    console.log(`Deleted ${deletedOrders.deletedCount} orders`);

    // Delete all user reviews
    const deletedReviews = await Review.deleteMany({
      email: user.email,
    });
    console.log(`Deleted ${deletedReviews.deletedCount} reviews`);

    // Remove user from coupon usage tracking
    await Coupon.updateMany(
      { usedByUsers: user.email },
      { $pull: { usedByUsers: user.email } }
    );
    console.log("Removed user from coupon tracking");

    // Delete the user account
    await User.deleteOne({ email: user.email });
    console.log("Deleted user account");

    // Clear session cookie
    const response = NextResponse.json(
      {
        success: true,
        message: "Account deleted successfully",
        deleted: {
          user: user.email,
          orders: deletedOrders.deletedCount,
          reviews: deletedReviews.deletedCount,
        },
      },
      { status: 200 }
    );

    // Clear the session cookie
    response.cookies.set("user_session", "", { maxAge: 0, path: "/" });

    return response;
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
