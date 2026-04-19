import { connectDB } from "@/lib/db/connect";
import { Order } from "@/lib/db/models/Order";
import AdminOrdersClient from "@/components/admin/AdminOrdersClient";

export const dynamic = "force-dynamic";

async function getOrders() {
  try {
    await connectDB();
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .select("orderId status paymentMethod total shippingAddress createdAt isCOD")
      .lean();
    return JSON.parse(JSON.stringify(orders));
  } catch {
    return [];
  }
}

export default async function AdminOrdersPage() {
  const orders = await getOrders();
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-[#2C2520]">Orders</h1>
        <p className="text-stone-500 text-sm mt-1">{orders.length} total orders</p>
      </div>
      <AdminOrdersClient orders={orders} />
    </div>
  );
}
