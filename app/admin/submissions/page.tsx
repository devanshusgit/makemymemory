"use client";

import { useState, useEffect } from "react";
import { Mail, MessageSquare, Star, ShoppingCart, User, Calendar, Eye, Trash2, CheckCircle } from "lucide-react";
import axios from "axios";
import Link from "next/link";

interface Submission {
  _id: string;
  type: "contact" | "review" | "order" | "signup";
  name: string;
  email: string;
  subject?: string;
  message?: string;
  status: "pending" | "read" | "processed";
  createdAt: string;
  metadata?: any;
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "contact" | "review" | "order" | "signup">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "read" | "processed">("all");

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      
      // Fetch all submission types
      const [contacts, reviews, orders, users] = await Promise.all([
        axios.get("/api/admin/contact").catch(() => ({ data: { messages: [] } })),
        axios.get("/api/admin/reviews").catch(() => ({ data: { reviews: [] } })),
        axios.get("/api/admin/orders").catch(() => ({ data: { orders: [] } })),
        axios.get("/api/admin/users").catch(() => ({ data: { users: [] } })),
      ]);

      const allSubmissions: Submission[] = [
        // Contact messages
        ...(contacts.data.messages || []).map((m: any) => ({
          _id: m._id,
          type: "contact" as const,
          name: m.name,
          email: m.email,
          subject: m.subject,
          message: m.message,
          status: m.isRead ? "read" : "pending",
          createdAt: m.createdAt,
          metadata: { phone: m.phone },
        })),
        
        // Reviews
        ...(reviews.data.reviews || []).map((r: any) => ({
          _id: r._id,
          type: "review" as const,
          name: r.name,
          email: r.email,
          subject: r.title,
          message: r.content,
          status: r.approved ? "processed" : "pending",
          createdAt: r.createdAt,
          metadata: { rating: r.rating, product: r.product },
        })),
        
        // Orders
        ...(orders.data.orders || []).map((o: any) => ({
          _id: o._id,
          type: "order" as const,
          name: o.shippingAddress?.fullName || "Unknown",
          email: o.shippingAddress?.email || "Unknown",
          subject: `Order ${o.orderId}`,
          message: `${o.items?.length || 0} items - ₹${o.total}`,
          status: o.status === "confirmed" ? "pending" : "processed",
          createdAt: o.createdAt,
          metadata: { orderId: o.orderId, total: o.total, status: o.status },
        })),
        
        // New user signups (last 30 days)
        ...(users.data.users || [])
          .filter((u: any) => {
            const createdDate = new Date(u.createdAt);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return createdDate >= thirtyDaysAgo;
          })
          .map((u: any) => ({
            _id: u._id,
            type: "signup" as const,
            name: u.name,
            email: u.email,
            subject: "New User Registration",
            message: `Joined ${new Date(u.createdAt).toLocaleDateString()}`,
            status: "read" as const,
            createdAt: u.createdAt,
            metadata: {},
          })),
      ];

      // Sort by date (newest first)
      allSubmissions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setSubmissions(allSubmissions);
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const filtered = submissions.filter((s) => {
    if (filter !== "all" && s.type !== filter) return false;
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "contact": return <Mail className="w-4 h-4" />;
      case "review": return <Star className="w-4 h-4" />;
      case "order": return <ShoppingCart className="w-4 h-4" />;
      case "signup": return <User className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "contact": return "bg-blue-100 text-blue-700 border-blue-200";
      case "review": return "bg-amber-100 text-amber-700 border-amber-200";
      case "order": return "bg-green-100 text-green-700 border-green-200";
      case "signup": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-stone-100 text-stone-700 border-stone-200";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Pending</span>;
      case "read":
        return <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Read</span>;
      case "processed":
        return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Processed</span>;
      default:
        return null;
    }
  };

  const getActionLink = (submission: Submission) => {
    switch (submission.type) {
      case "contact":
        return `/admin/contact`;
      case "review":
        return `/admin/reviews`;
      case "order":
        return `/admin/orders/${submission._id}`;
      case "signup":
        return `/admin/users`;
      default:
        return "#";
    }
  };

  const stats = {
    total: submissions.length,
    contact: submissions.filter(s => s.type === "contact").length,
    review: submissions.filter(s => s.type === "review").length,
    order: submissions.filter(s => s.type === "order").length,
    signup: submissions.filter(s => s.type === "signup").length,
    pending: submissions.filter(s => s.status === "pending").length,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C2520]">All Submissions</h1>
        <p className="text-stone-500 text-sm mt-1">
          {stats.total} total submissions • {stats.pending} pending
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-stone-100">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold text-stone-500 uppercase">Contact</span>
          </div>
          <p className="text-2xl font-bold text-[#2C2520]">{stats.contact}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-100">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-semibold text-stone-500 uppercase">Reviews</span>
          </div>
          <p className="text-2xl font-bold text-[#2C2520]">{stats.review}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-100">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="w-4 h-4 text-green-600" />
            <span className="text-xs font-semibold text-stone-500 uppercase">Orders</span>
          </div>
          <p className="text-2xl font-bold text-[#2C2520]">{stats.order}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-100">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-semibold text-stone-500 uppercase">Signups</span>
          </div>
          <p className="text-2xl font-bold text-[#2C2520]">{stats.signup}</p>
        </div>

        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-semibold text-amber-700 uppercase">Pending</span>
          </div>
          <p className="text-2xl font-bold text-amber-700">{stats.pending}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-3">
        <div>
          <p className="text-xs font-semibold text-stone-500 uppercase mb-2">Type</p>
          <div className="flex flex-wrap gap-2">
            {(["all", "contact", "review", "order", "signup"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-xs font-semibold capitalize transition-all
                            ${filter === f
                              ? "bg-[#2C2520] text-white"
                              : "bg-white text-stone-500 border border-stone-200 hover:border-stone-400"
                            }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-stone-500 uppercase mb-2">Status</p>
          <div className="flex flex-wrap gap-2">
            {(["all", "pending", "read", "processed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-4 py-2 rounded-full text-xs font-semibold capitalize transition-all
                            ${statusFilter === f
                              ? "bg-[#2C2520] text-white"
                              : "bg-white text-stone-500 border border-stone-200 hover:border-stone-400"
                            }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="text-center py-16 text-stone-400 text-sm">Loading submissions…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-400 text-sm">No submissions found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((submission) => (
            <div
              key={`${submission.type}-${submission._id}`}
              className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-stone-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Type Badge */}
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl border ${getTypeColor(submission.type)}`}>
                  {getIcon(submission.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#2C2520] text-sm truncate">{submission.subject}</h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {submission.name} • {submission.email}
                      </p>
                    </div>
                    {getStatusBadge(submission.status)}
                  </div>

                  {submission.message && (
                    <p className="text-sm text-stone-600 line-clamp-2 mb-2">{submission.message}</p>
                  )}

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-stone-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(submission.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>

                    <Link
                      href={getActionLink(submission)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-50 text-stone-700
                                 border border-stone-200 rounded-xl text-xs font-medium
                                 hover:bg-stone-100 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
