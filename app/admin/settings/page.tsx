import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isAdminCookieValue } from "@/lib/auth/admin";
import { buildMeta } from "@/lib/seo";
import AdminSettingsClient from "@/components/admin/AdminSettingsClient";

export const metadata = buildMeta({
  title: "Admin Settings",
  description: "Manage store settings.",
  path: "/admin/settings",
  noIndex: true,
});

export default function AdminSettingsPage() {
  if (!isAdminCookieValue(cookies().get("admin_session")?.value)) redirect("/admin/login");

  return <AdminSettingsClient />;
}
