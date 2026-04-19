"use client";

import { useState, useEffect } from "react";
import { Trash2, User, Mail, Phone, Calendar } from "lucide-react";
import axios from "axios";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers]     = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/api/admin/users");
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (user: AdminUser) => {
    const confirmed = confirm(
      `Delete "${user.name}" (${user.email})?\n\nThis will permanently delete:\n• Their account\n• All their orders\n• All their reviews\n\nThis cannot be undone.`
    );
    if (!confirmed) return;

    setDeleting(user._id);
    try {
      const res = await axios.delete(`/api/admin/users/${user._id}`);
      const { deleted } = res.data;
      alert(`✅ Deleted:\n• Account: ${deleted.user}\n• Orders: ${deleted.orders}\n• Reviews: ${deleted.reviews}`);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error ?? "Failed to delete user.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-[#2C2520]">Users</h1>
        <p className="text-stone-500 text-sm mt-1">{users.length} registered accounts</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-stone-400 text-sm">Loading users…</div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 text-stone-400 text-sm">No registered users yet.</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Phone</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Joined</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-sage/10 flex items-center justify-center shrink-0">
                          <User className="w-3.5 h-3.5 text-sage-dark" />
                        </div>
                        <span className="font-medium text-[#2C2520]">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-stone-500">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 shrink-0" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-stone-500">
                      {user.phone ? (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 shrink-0" />
                          {user.phone}
                        </div>
                      ) : (
                        <span className="text-stone-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-stone-400 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 shrink-0" />
                        {new Date(user.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(user)}
                        disabled={deleting === user._id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium
                                   bg-red-50 text-red-600 border border-red-200
                                   hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {deleting === user._id ? "Deleting…" : "Delete All"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
