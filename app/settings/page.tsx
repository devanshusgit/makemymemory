import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { buildMeta } from "@/lib/seo";
import SettingsClient from "@/components/settings/SettingsClient";

export const metadata = buildMeta({
  title: "Settings",
  description: "Manage your account settings.",
  path: "/settings",
  noIndex: true,
});

export default function SettingsPage() {
  const cookieStore = cookies();
  const session = cookieStore.get("user_session");
  let user: { name: string; email: string } | null = null;
  try {
    if (session?.value) {
      const parsed = JSON.parse(session.value);
      if (parsed?.email) user = parsed;
    }
  } catch { /* invalid */ }

  if (!user) redirect("/login?redirect=/settings");

  return <SettingsClient user={user} />;
}
