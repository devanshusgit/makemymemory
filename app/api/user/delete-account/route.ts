import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { Order } from "@/lib/db/models/Order";
import { Review } from "@/lib/db/models/Review";
import { Coupon } from "@/lib/db/models/Coupon";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    console.log("=== Delete account request START ===");
    console.log("Method:", req.method);
    console.log("URL:", req.url);
    
    // Get user from session
    const session = req.cookies.get("user_session")?.value;
    console.log("Session cookie:", session ? "found (" + session.length + " chars)" : "not found");
    
    if (!session) {
      console.error("❌ No session cookie");
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    let user;
    try {
      user = JSON.parse(session);
      console.log("✓ Session parsed, email:", user.email);
    } catch (e) {
      console.error("❌ Failed to parse session:", e);
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }

    if (!user?.email) {
      console.error("❌ No email in session");
      return NextResponse.json(
        { error: "Invalid session data" },
        { status: 401 }
      );
    }

    // Normalize email to lowercase for consistency
    const normalizedEmail = user.email.toLowerCase();
    console.log("✓ Email normalized:", normalizedEmail);

    console.log("✓ Connecting to database...");
    await connectDB();
    console.log("✓ Database connected");

    // Log deletion
    console.log("🗑️  Deleting user account:", normalizedEmail);

    // Find the user
    const userDoc = await User.findOne({ email: normalizedEmail });
    if (!userDoc) {
      console.error("❌ User not found:", normalizedEmail);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    console.log("✓ User found");

    // Delete all user orders using normalized email
    console.log("🗑️  Deleting orders...");
    let deletedOrders = await Order.deleteMany({
      "shippingAddress.email": normalizedEmail,
    });
    console.log(`✓ Deleted ${deletedOrders.deletedCount} orders`);

    // Delete all user reviews using normalized email
    console.log("🗑️  Deleting reviews...");
    const deletedReviews = await Review.deleteMany({
      email: normalizedEmail,
    });
    console.log(`✓ Deleted ${deletedReviews.deletedCount} reviews`);

    // Remove user from coupon usage tracking
    console.log("🗑️  Removing from coupon tracking...");
    const couponUpdate = await Coupon.updateMany(
      { usedByUsers: normalizedEmail },
      { $pull: { usedByUsers: normalizedEmail } }
    );
    console.log(`✓ Updated ${couponUpdate.modifiedCount} coupon documents`);

    // Delete the user account
    console.log("🗑️  Deleting user...");
    const deleteResult = await User.deleteOne({ email: normalizedEmail });
    console.log(`✓ Deleted user (matched: ${deleteResult.deletedCount})`);

    console.log("✓ All deletions completed successfully");

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
    console.log("✓ Session cookie cleared");
    console.log("=== Delete account request COMPLETE ===");

    return response;
  } catch (error) {
    console.error("❌ Error deleting account:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete account";
    const errorType = error?.constructor?.name || "UnknownError";
    const errorDetails = String(error);
    
    console.error("Error type:", errorType);
    console.error("Error details:", errorDetails);
    
    // Log stack trace if available
    if (error instanceof Error && error.stack) {
      console.error("Stack trace:", error.stack);
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        type: errorType,
        details: process.env.NODE_ENV === "development" ? errorDetails : undefined,
      },
      { status: 500 }
    );
  }
}
