import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import OrderEditClient from "@/components/orders/OrderEditClient";
import { buildMeta } from "@/lib/seo";
import { parseSession } from "@/lib/auth/session";

export const metadata = buildMeta({
  title: "Change Your Order",
  description: "Change your frame options, product, quantity or shipping address.",
  path: "/orders",
  noIndex: true,
});

export default function OrderEditPage({ params }: { params: { orderId: string } }) {
  const orderId = encodeURIComponent(params.orderId);
  if (!parseSession(cookies().get("user_session")?.value)) {
    redirect(`/login?redirect=/orders/${orderId}/edit`);
  }
  return (
    <div className="bg-canvas min-h-screen">
      <div className="section-wrap py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <OrderEditClient orderId={params.orderId} />
        </div>
      </div>
    </div>
  );
}
