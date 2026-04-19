import { connectDB } from "@/lib/db/connect";
import { Order } from "@/lib/db/models/Order";
import { notFound } from "next/navigation";
import AdminOrderDetailClient from "@/components/admin/AdminOrderDetailClient";

export const dynamic = "force-dynamic";

async function getOrder(id: string) {
  try {
    await connectDB();
    const order = await Order.findOne({ orderId: id.toUpperCase() }).lean();
    if (!order) return null;
    return JSON.parse(JSON.stringify(order));
  } catch {
    return null;
  }
}

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getOrder(params.id);
  if (!order) notFound();
  return (
    <div className="p-6 lg:p-8">
      <AdminOrderDetailClient order={order} />
    </div>
  );
}
