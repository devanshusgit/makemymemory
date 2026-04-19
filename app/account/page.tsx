import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { buildMeta } from "@/lib/seo";
import AccountClient from "@/components/account/AccountClient";

export const metadata = buildMeta({
  title: "My Account",
  description: "View your orders and manage your account.",
  path: "/account",
  noIndex: true,
});

export default function AccountPage() {
  const cookieStore = cookies();
  const session = cookieStore.get("user_session");
  let user: { name: string; email: string } | null = null;
  try {
    if (session?.value) {
      const parsed = JSON.parse(session.value);
      if (parsed?.email) user = parsed;
    }
  } catch { /* invalid */ }

  if (!user) redirect("/login?redirect=/account");

  return <AccountClient user={user} />;
}
