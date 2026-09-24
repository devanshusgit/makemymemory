import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User }   from "@/lib/db/models/User";
import { Order }  from "@/lib/db/models/Order";
import { Review } from "@/lib/db/models/Review";
import { isAdminRequest } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();

    // Find user first to get their email
    const user = await User.findById(params.id).lean();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const email = (user as any).email;

    // Orders are KEPT. They are the shop's sales and tax records (GST law
    // requires keeping them for six years), and deleting "every order with
    // this email" also removed orders other people placed using that address.
    // Only the account and its reviews go. A phone-only account has no email,
    // so its reviews are left alone rather than matching on an empty value.
    const [reviewsDeleted] = await Promise.all([
      email ? Review.deleteMany({ email }) : Promise.resolve({ deletedCount: 0 }),
      User.findByIdAndDelete(params.id),
    ]);
    const ordersKept = email ? await Order.countDocuments({ "shippingAddress.email": email }) : 0;

    console.log(`[admin] Deleted user ${email ?? params.id} — reviews: ${(reviewsDeleted as any).deletedCount}, orders kept: ${ordersKept}`);

    return NextResponse.json({
      success: true,
      deleted: {
        user: email ?? (user as any).phone ?? params.id,
        orders: 0,
        ordersKept,
        reviews: (reviewsDeleted as any).deletedCount,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
