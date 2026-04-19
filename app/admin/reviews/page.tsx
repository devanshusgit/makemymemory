"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Trash2, Star } from "lucide-react";
import axios from "axios";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const fetchReviews = async () => {
    try {
      const res = await axios.get("/api/admin/reviews");
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleApprove = async (id: string) => {
    await axios.patch(`/api/admin/reviews/${id}`, { action: "approve" });
    fetchReviews();
  };

  const handleReject = async (id: string) => {
    await axios.patch(`/api/admin/reviews/${id}`, { action: "reject" });
    fetchReviews();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review permanently?")) return;
    await axios.delete(`/api/admin/reviews/${id}`);
    fetchReviews();
  };

  const count = (f: string) => reviews.filter((r) => {
    if (f === "all")      return true;
    if (f === "pending")  return !r.approved && !r.rejected;
    if (f === "approved") return r.approved;
    if (f === "rejected") return r.rejected;
    return true;
  }).length;

  const filtered = reviews.filter((r) => {
    if (filter === "all")      return true;
    if (filter === "pending")  return !r.approved && !r.rejected;
    if (filter === "approved") return r.approved;
    if (filter === "rejected") return r.rejected;
    return true;
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-[#2C2520]">Reviews</h1>
        <p className="text-stone-500 text-sm mt-1">{reviews.length} total reviews</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs font-semibold capitalize transition-all
                        ${filter === f
                          ? "bg-[#2C2520] text-white"
                          : "bg-white text-stone-500 border border-stone-200 hover:border-stone-400"
                        }`}
          >
            {f} ({count(f)})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-stone-400 text-sm">Loading reviews…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-400 text-sm">No reviews found.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((review) => (
            <div key={review._id} className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-4 h-4 ${s <= review.rating ? "fill-amber-400 text-amber-400" : "text-stone-200"}`} />
                    ))}
                  </div>

                  <h3 className="font-semibold text-[#2C2520] text-sm mb-1">{review.title}</h3>
                  <p className="text-stone-500 text-sm mb-3 leading-relaxed">{review.content}</p>

                  <div className="flex flex-wrap gap-3 text-xs text-stone-400">
                    <span>👤 {review.name}</span>
                    <span>📧 {review.email}</span>
                    {review.product && <span>🛍️ {review.product}</span>}
                    <span>📅 {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>

                  <div className="mt-2">
                    {review.approved && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">✅ Approved</span>
                    )}
                    {review.rejected && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">❌ Rejected</span>
                    )}
                    {!review.approved && !review.rejected && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">⏳ Pending</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  {!review.approved && (
                    <button
                      onClick={() => handleApprove(review._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700
                                 border border-green-200 rounded-xl text-xs font-medium
                                 hover:bg-green-100 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                  )}
                  {!review.rejected && (
                    <button
                      onClick={() => handleReject(review._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700
                                 border border-red-200 rounded-xl text-xs font-medium
                                 hover:bg-red-100 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-50 text-stone-600
                               border border-stone-200 rounded-xl text-xs font-medium
                               hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>

              {review.mediaUrls?.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {review.mediaUrls.map((url: string, i: number) => (
                    <img key={i} src={url} alt="" className="w-16 h-16 rounded-xl object-cover border border-stone-100" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
