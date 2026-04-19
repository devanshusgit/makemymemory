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
    <div className="min-h-screen flex bg-[#1a1714]">
      <AdminSidebar />
      <main className="flex-1 overflow-auto bg-[#F5F0EB]">
        {children}
      </main>
    </div>
  );
}
