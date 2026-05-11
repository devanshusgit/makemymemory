import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { buildMeta } from "@/lib/seo";
import AdminSettingsClient from "@/components/admin/AdminSettingsClient";

export const metadata = buildMeta({
  title: "Admin Settings",
  description: "Manage store settings.",
  path: "/admin/settings",
  noIndex: true,
});

export default function AdminSettingsPage() {
  const cookieStore = cookies();
  const session = cookieStore.get("admin_session");

  if (!session?.value) redirect("/admin/login");

  return <AdminSettingsClient />;
}
