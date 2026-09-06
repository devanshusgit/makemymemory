import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { buildMeta } from "@/lib/seo";
import AccountClient from "@/components/account/AccountClient";
import { parseSession } from "@/lib/auth/session";

export const metadata = buildMeta({
  title: "My Account",
  description: "View your orders and manage your account.",
  path: "/account",
  noIndex: true,
});

export default function AccountPage() {
  const cookieStore = cookies();
  const user = parseSession(cookieStore.get("user_session")?.value);

  if (!user) redirect("/login?redirect=/account");

  return <AccountClient user={{ name: user.name || "", email: user.email || "", phone: user.phone }} />;
}
