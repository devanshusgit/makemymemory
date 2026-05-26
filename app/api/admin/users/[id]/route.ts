import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User }   from "@/lib/db/models/User";
import { Order }  from "@/lib/db/models/Order";
import { Review } from "@/lib/db/models/Review";

export const dynamic = "force-dynamic";

function isAdmin(req: NextRequest) {
  return req.cookies.get("admin_session")?.value === process.env.ADMIN_PASSWORD;
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();

    // Find user first to get their email
    const user = await User.findById(params.id).lean();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const email = (user as any).email;

    // Delete everything linked to this user
    const [ordersDeleted, reviewsDeleted] = await Promise.all([
      Order.deleteMany({ "shippingAddress.email": email }),
      Review.deleteMany({ email }),
      User.findByIdAndDelete(params.id),
    ]);

    console.log(`[admin] Deleted user ${email} — orders: ${(ordersDeleted as any).deletedCount}, reviews: ${(reviewsDeleted as any).deletedCount}`);

    return NextResponse.json({
      success: true,
      deleted: {
        user: email,
        orders:  (ordersDeleted as any).deletedCount,
        reviews: (reviewsDeleted as any).deletedCount,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
