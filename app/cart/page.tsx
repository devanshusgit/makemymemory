import CartItems   from "@/components/cart/CartItems";
import CartSummary from "@/components/cart/CartSummary";
import { buildMeta } from "@/lib/seo";

export const metadata = buildMeta({
  title:       "Your Cart",
  description: "Review your personalised items and proceed to secure checkout.",
  path:        "/cart",
  noIndex:     true,
});

export default function CartPage() {
  return (
    <div className="bg-canvas min-h-screen">
      <div className="section-wrap py-12 sm:py-16">

        {/* Header */}
        <div className="mb-10">
          <span className="label-tag mb-3 inline-flex">Your Selection</span>
          <h1 className="section-heading">Your Cart</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          {/* Items */}
          <div className="flex-1 min-w-0 w-full">
            <CartItems />
          </div>

          {/* Summary */}
          <aside className="w-full lg:w-96 shrink-0">
            <CartSummary />
          </aside>
        </div>
      </div>
    </div>
  );
}
