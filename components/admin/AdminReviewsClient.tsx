"use client";

import { useState } from "react";
import { Check, X, Star } from "lucide-react";

interface Review {
  _id: string;
  name: string;
  email: string;
  rating: number;
  title: string;
  content: string;
  product: string;
  approved: boolean;
  createdAt: string;
}

export default function AdminReviewsClient({ reviews: initial }: { reviews: Review[] }) {
  const [reviews, setReviews] = useState(initial);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  const filtered = reviews.filter((r) => {
    if (filter === "pending") return !r.approved;
    if (filter === "approved") return r.approved;
    return true;
  });

  const toggle = async (id: string, approved: boolean) => {
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved }),
    });
    if (res.ok) {
      setReviews((prev) =>
        prev.map((r) => (r._id === id ? { ...r, approved } : r))
      );
    }
  };

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {(["all", "pending", "approved"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all
                        ${filter === f
                          ? "bg-[#2C2520] text-white"
                          : "bg-white text-stone-500 border border-stone-200 hover:border-stone-400"
                        }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-stone-400 text-sm bg-white rounded-2xl">
            No reviews found.
          </div>
        )}
        {filtered.map((review) => (
          <div
            key={review._id}
            className={`bg-white rounded-2xl p-5 border transition-all
                        ${review.approved ? "border-green-100" : "border-amber-100"}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="font-semibold text-[#2C2520] text-sm">{review.name}</p>
                  <span className="text-xs text-stone-400">{review.email}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
                                    ${review.approved
                                      ? "bg-green-100 text-green-700"
                                      : "bg-amber-100 text-amber-700"
                                    }`}>
                    {review.approved ? "Approved" : "Pending"}
                  </span>
                </div>

                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-stone-200"}`}
                    />
                  ))}
                  <span className="text-xs text-stone-400 ml-1">{review.product}</span>
                </div>

                <p className="text-sm font-medium text-[#2C2520]">{review.title}</p>
                <p className="text-sm text-stone-500 mt-0.5 line-clamp-2">{review.content}</p>
                <p className="text-xs text-stone-400 mt-1.5">
                  {new Date(review.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </p>
              </div>

              <div className="flex gap-2 shrink-0">
                {!review.approved && (
                  <button
                    onClick={() => toggle(review._id, true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50
                               text-green-700 text-xs font-semibold hover:bg-green-100 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                )}
                {review.approved && (
                  <button
                    onClick={() => toggle(review._id, false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50
                               text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
