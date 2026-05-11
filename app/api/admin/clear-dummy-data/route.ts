import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Product } from "@/lib/db/models/Product";
import { Review } from "@/lib/db/models/Review";

function isAdmin(req: NextRequest) {
  return req.cookies.get("admin_session")?.value === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    // Delete all products
    const productsResult = await Product.deleteMany({});
    console.log(`[clear-dummy] Deleted ${productsResult.deletedCount} products`);

    // Delete all reviews
    const reviewsResult = await Review.deleteMany({});
    console.log(`[clear-dummy] Deleted ${reviewsResult.deletedCount} reviews`);

    return NextResponse.json({
      success: true,
      message: "Dummy data cleared successfully",
      deleted: {
        products: productsResult.deletedCount,
        reviews: reviewsResult.deletedCount,
      },
    });
  } catch (error) {
    console.error("[clear-dummy] Error:", error);
    return NextResponse.json(
      { error: "Failed to clear dummy data" },
      { status: 500 }
    );
  }
}
