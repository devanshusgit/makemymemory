import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { ProductOption } from "@/lib/db/models/ProductOption";
import { parseSession } from "@/lib/auth/session";
import { getPublicProducts, OPTION_GROUPS } from "@/lib/products/publicProduct";
import { loadOwnedOrder, OrderEditError } from "@/lib/orders/editOrder";
import { editState } from "@/lib/orders/editWindow";

export const dynamic = "force-dynamic";

/**
 * GET /api/user/orders/[id]/edit
 *
 * Everything the edit page needs: the order as it stands, whether it can
 * still be changed (and until when), and the catalogue to change it to.
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const session = parseSession(req.cookies.get("user_session")?.value);
    const order = await loadOwnedOrder(session, params.id);
    const state = editState(order);

    const [products, options] = await Promise.all([
      getPublicProducts(200),
      ProductOption.find({ group: { $in: OPTION_GROUPS } }).sort({ sortOrder: 1, createdAt: 1 }).lean(),
    ]);
    const optionsByGroup: Record<string, any[]> = {};
    for (const o of JSON.parse(JSON.stringify(options))) (optionsByGroup[o.group] ??= []).push(o);

    return NextResponse.json({
      order: {
        orderId: order.orderId,
        status: order.status,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt,
        items: JSON.parse(JSON.stringify(order.items)),
        shippingAddress: JSON.parse(JSON.stringify(order.shippingAddress)),
        subtotal: order.subtotal,
        discountAmount: order.discountAmount ?? 0,
        appliedCouponCode: order.appliedCouponCode ?? "",
        total: order.total,
        codAdvancePaid: order.codAdvancePaid ?? 0,
      },
      editable: state.editable,
      ...(state.editable ? { deadline: state.deadline } : { reason: state.reason }),
      products: products.map((p) => ({
        id: p.id, name: p.name, slug: p.slug, price: p.price, inStock: p.inStock,
        image: p.images?.[0], enabledOptions: p.enabledOptions ?? {},
      })),
      optionsByGroup,
    });
  } catch (e) {
    if (e instanceof OrderEditError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error("[order-edit GET]", e);
    return NextResponse.json({ error: "Could not load your order." }, { status: 500 });
  }
}
