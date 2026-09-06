import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { buildMeta } from "@/lib/seo";
import SettingsClient from "@/components/settings/SettingsClient";
import { parseSession } from "@/lib/auth/session";

export const metadata = buildMeta({
  title: "Settings",
  description: "Manage your account settings.",
  path: "/settings",
  noIndex: true,
});

export default function SettingsPage() {
  const cookieStore = cookies();
  const user = parseSession(cookieStore.get("user_session")?.value);

  if (!user) redirect("/login?redirect=/settings");

  return <SettingsClient user={{ name: user.name || "", email: user.email, phone: user.phone }} />;
}
