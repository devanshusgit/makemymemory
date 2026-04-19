import { buildMeta }    from "@/lib/seo";
import SuccessClient    from "@/components/checkout/SuccessClient";

export const metadata = buildMeta({
  title:       "Order Confirmed",
  description: "Your order has been placed successfully. We'll start crafting your memory right away.",
  path:        "/checkout/success",
  noIndex:     true,
});

export default function OrderSuccessPage() {
  return <SuccessClient />;
}
