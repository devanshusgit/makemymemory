import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const session = cookieStore.get("admin_session");
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!session || !adminPassword || session.value !== adminPassword) {
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
