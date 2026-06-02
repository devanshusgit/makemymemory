import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { Order } from "@/lib/db/models/Order";
import { Review } from "@/lib/db/models/Review";
import { Coupon } from "@/lib/db/models/Coupon";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    console.log("Delete account request received");
    
    // Get user from session
    const session = req.cookies.get("user_session")?.value;
    console.log("Session cookie:", session ? "found" : "not found");
    
    if (!session) {
      console.error("No session cookie");
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    let user;
    try {
      user = JSON.parse(session);
      console.log("Session parsed successfully, email:", user.email);
    } catch (e) {
      console.error("Failed to parse session:", e);
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }

    if (!user?.email) {
      console.error("No email in session:", user);
      return NextResponse.json(
        { error: "Invalid session data" },
        { status: 401 }
      );
    }

    console.log("Connecting to database...");
    await connectDB();
    console.log("Database connected");

    // Log deletion
    console.log("Deleting user account:", user.email);

    // Find the user
    const userDoc = await User.findOne({ email: user.email });
    if (!userDoc) {
      console.error("User not found:", user.email);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    console.log("User found, proceeding with deletion");

    // Delete all user orders
    console.log("Deleting orders...");
    const deletedOrders = await Order.deleteMany({
      "shippingAddress.email": user.email,
    });
    console.log(`Deleted ${deletedOrders.deletedCount} orders`);

    // Delete all user reviews
    console.log("Deleting reviews...");
    const deletedReviews = await Review.deleteMany({
      email: user.email,
    });
    console.log(`Deleted ${deletedReviews.deletedCount} reviews`);

    // Remove user from coupon usage tracking
    console.log("Removing user from coupon tracking...");
    await Coupon.updateMany(
      { usedByUsers: user.email },
      { $pull: { usedByUsers: user.email } }
    );
    console.log("Removed user from coupon tracking");

    // Delete the user account
    console.log("Deleting user account...");
    await User.deleteOne({ email: user.email });
    console.log("User account deleted successfully");

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
    const errorMessage = error instanceof Error ? error.message : "Failed to delete account";
    console.error("Error details:", errorMessage);
    return NextResponse.json(
      { error: errorMessage, details: String(error) },
      { status: 500 }
    );
  }
}
