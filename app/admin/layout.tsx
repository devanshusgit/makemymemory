import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { isAdminCookieValue } from "@/lib/auth/admin";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isAdminCookieValue(cookies().get("admin_session")?.value)) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F5F0EB" }}>
      <AdminSidebar />
      <main className="flex-1 overflow-auto" style={{ backgroundColor: "#F5F0EB" }}>
        {children}
      </main>
    </div>
  );
}
