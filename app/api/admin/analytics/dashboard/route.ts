import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Order } from "@/lib/db/models/Order";
import { User } from "@/lib/db/models/User";
import { Review } from "@/lib/db/models/Review";

/**
 * GET /api/admin/analytics/dashboard
 * Get dashboard analytics: orders, revenue, users, reviews
 */
export async function GET(req: NextRequest) {
  try {
    const days = parseInt(req.nextUrl.searchParams.get("days") || "30");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    await connectDB();

    // Get all metrics in parallel
    const [
      totalOrders,
      recentOrders,
      totalRevenue,
      totalUsers,
      newUsers,
      totalReviews,
      approvedReviews,
      pendingReviews,
    ] = await Promise.all([
      Order.countDocuments({}),
      Order.find({ createdAt: { $gte: startDate } }).lean(),
      Order.aggregate([
        { $match: { status: "delivered" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      User.countDocuments({ isDeleted: { $ne: true } }),
      User.countDocuments({ createdAt: { $gte: startDate }, isDeleted: { $ne: true } }),
      Review.countDocuments({}),
      Review.countDocuments({ approved: true }),
      Review.countDocuments({
        $and: [
          { approved: { $ne: true } },
          { rejected: { $ne: true } },
        ],
      }),
    ]);

    // Calculate derived metrics
    const recentRevenue = recentOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const avgOrderValue = totalOrders > 0 ? (totalRevenue[0]?.total || 0) / totalOrders : 0;
    const averageRating =
      totalReviews > 0
        ? (await Review.aggregate([
            { $match: { approved: true } },
            { $group: { _id: null, avg: { $avg: "$rating" } } },
          ]))[0]?.avg || 0
        : 0;

    // Order status breakdown
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Revenue by payment method
    const revenueByMethod = await Order.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: "$paymentMethod", total: { $sum: "$total" } } },
    ]);

    // Top products by orders
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.productId", count: { $sum: 1 }, revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    return NextResponse.json({
      success: true,
      metrics: {
        orders: {
          total: totalOrders,
          recent: recentOrders.length,
          byStatus: ordersByStatus.reduce((acc: any, item: any) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
        },
        revenue: {
          total: totalRevenue[0]?.total || 0,
          recent: recentRevenue,
          avgOrderValue: Math.round(avgOrderValue * 100) / 100,
          byMethod: revenueByMethod.reduce((acc: any, item: any) => {
            acc[item._id] = item.total;
            return acc;
          }, {}),
        },
        users: {
          total: totalUsers,
          newThisMonth: newUsers,
        },
        reviews: {
          total: totalReviews,
          approved: approvedReviews,
          pending: pendingReviews,
          averageRating: Math.round(averageRating * 10) / 10,
        },
        topProducts,
      },
      period: {
        days,
        startDate,
        endDate: new Date(),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
