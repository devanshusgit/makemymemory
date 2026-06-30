import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Order } from "@/lib/db/models/Order";
import { User } from "@/lib/db/models/User";
import { Review } from "@/lib/db/models/Review";
import { Product } from "@/lib/db/models/Product";

/**
 * GET /api/admin/analytics
 * Get analytics dashboard data
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Revenue metrics
    const orders = await Order.find({ status: { $ne: "cancelled" } });
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // User metrics
    const totalUsers = await User.countDocuments();
    const newUsersThisMonth = await User.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setDate(1)),
      },
    });

    // Product metrics
    const products = await Product.find();
    const topProducts = products
      .sort((a, b) => (b.purchaseCount || 0) - (a.purchaseCount || 0))
      .slice(0, 5)
      .map((p) => ({
        name: p.name,
        sales: p.purchaseCount,
        views: p.viewCount,
      }));

    // Order status breakdown
    const orderStatuses = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Payment method breakdown
    const paymentMethods = await Order.aggregate([
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          revenue: { $sum: "$total" },
        },
      },
    ]);

    // Review metrics
    const totalReviews = await Review.countDocuments();
    const averageRating = await Review.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      analytics: {
        revenue: {
          total: Math.round(totalRevenue),
          averageOrder: Math.round(averageOrderValue),
        },
        orders: {
          total: totalOrders,
          byStatus: Object.fromEntries(
            orderStatuses.map((s) => [s._id, s.count])
          ),
          byPaymentMethod: Object.fromEntries(
            paymentMethods.map((p) => [
              p._id,
              { count: p.count, revenue: Math.round(p.revenue) },
            ])
          ),
        },
        users: {
          total: totalUsers,
          newThisMonth: newUsersThisMonth,
        },
        products: {
          total: products.length,
          topProducts,
        },
        reviews: {
          total: totalReviews,
          averageRating:
            averageRating.length > 0
              ? Math.round(averageRating[0].avgRating * 10) / 10
              : 0,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
