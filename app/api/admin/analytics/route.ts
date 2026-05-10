import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Order } from "@/lib/db/models/Order";
import { Product } from "@/lib/db/models/Product";
import { Review } from "@/lib/db/models/Review";

export async function GET() {
  try {
    await connectDB();

    // Get all orders (excluding failed/cancelled)
    const orders = await Order.find({
      status: { $nin: ["cancelled", "payment_failed"] },
    }).lean();

    // Calculate metrics
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get unique customers
    const uniqueEmails = new Set(
      orders.map((o) => o.shippingAddress?.email).filter(Boolean)
    );
    const totalCustomers = uniqueEmails.size;

    // Get top products
    const topProducts = await Order.aggregate([
      { $match: { status: { $nin: ["cancelled", "payment_failed"] } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          sales: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          name: "$_id",
          sales: 1,
          revenue: 1,
        },
      },
    ]);

    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("orderId total status createdAt")
      .lean();

    const formattedRecentOrders = recentOrders.map((o: any) => ({
      orderId: o.orderId,
      total: o.total,
      status: o.status,
      date: new Date(o.createdAt).toLocaleDateString("en-IN"),
    }));

    // Get average rating
    const ratingStats = await Review.aggregate([
      { $match: { approved: true } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    const avgRating = ratingStats[0]?.avgRating || 0;

    // Calculate conversion rate (orders / total product views)
    const totalViews = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$viewCount" },
        },
      },
    ]);

    const conversionRate =
      totalViews[0]?.totalViews > 0
        ? (totalOrders / totalViews[0].totalViews) * 100
        : 0;

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      totalCustomers,
      avgOrderValue,
      topProducts,
      recentOrders: formattedRecentOrders,
      conversionRate,
      avgRating,
    });
  } catch (error) {
    console.error("[analytics]", error);
    return NextResponse.json(
      {
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        avgOrderValue: 0,
        topProducts: [],
        recentOrders: [],
        conversionRate: 0,
        avgRating: 0,
      },
      { status: 200 }
    );
  }
}
