"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star } from "lucide-react";
import axios from "axios";
import type { Review } from "@/lib/types";

interface ReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RatingStats {
  average: number;
  total: number;
  breakdown: { stars: number; count: number }[];
}

export default function ReviewsModal({ isOpen, onClose }: ReviewsModalProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch reviews
        const reviewsRes = await axios.get("/api/reviews?approved=true&limit=50");
        setReviews(reviewsRes.data.reviews || []);

        // Calculate stats
        if (reviewsRes.data.reviews && reviewsRes.data.reviews.length > 0) {
          const allReviews = reviewsRes.data.reviews;
          const average =
            allReviews.reduce((sum: number, r: Review) => sum + (r.rating || 0), 0) /
            allReviews.length;

          const breakdown = [5, 4, 3, 2, 1].map((stars) => ({
            stars,
            count: allReviews.filter((r: Review) => r.rating === stars).length,
          }));

          setStats({
            average: Math.round(average * 10) / 10,
            total: allReviews.length,
            breakdown,
          });
        }
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          >
            <div
              className="w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl sm:rounded-3xl
                         flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 sm:p-8 border-b border-stone-100">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-ink">Customer Reviews</h2>
                  <p className="text-sm text-stone-500 mt-1">
                    {stats?.total || 0} verified reviews
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full flex items-center justify-center
                           hover:bg-stone-100 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-stone-600" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-6 sm:p-8 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-stone-200 border-t-ink rounded-full animate-spin" />
                    <p className="text-stone-500 mt-3">Loading reviews...</p>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="p-6 sm:p-8 text-center">
                    <p className="text-lg text-stone-600 mb-2">No reviews yet</p>
                    <p className="text-sm text-stone-400">Be the first to share your experience!</p>
                  </div>
                ) : (
                  <div className="p-6 sm:p-8 space-y-6">
                    {/* Rating Summary */}
                    {stats && (
                      <div className="pb-6 border-b border-stone-100">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-ink">{stats.average}</div>
                            <div className="flex gap-1 mt-2 justify-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className="w-4 h-4"
                                  fill={i < Math.round(stats.average) ? "#C9A84C" : "#E5E7EB"}
                                  stroke={i < Math.round(stats.average) ? "#C9A84C" : "#D1D5DB"}
                                />
                              ))}
                            </div>
                            <p className="text-xs text-stone-500 mt-2">Based on {stats.total} reviews</p>
                          </div>

                          {/* Star Breakdown */}
                          <div className="flex-1 space-y-2">
                            {stats.breakdown.map(({ stars, count }) => {
                              const percentage = (count / stats.total) * 100;
                              return (
                                <div key={stars} className="flex items-center gap-2">
                                  <span className="text-xs text-stone-600 w-12">{stars}★</span>
                                  <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-[#C9A84C] transition-all"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-stone-500 w-8 text-right">{count}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Review Cards */}
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div
                          key={review._id}
                          className="p-4 border border-stone-100 rounded-xl hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                              <p className="font-semibold text-sm text-ink">{review.name}</p>
                              <p className="text-xs text-stone-500">{review.email}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className="w-3.5 h-3.5"
                                  fill={i < (review.rating || 0) ? "#C9A84C" : "#E5E7EB"}
                                  stroke={i < (review.rating || 0) ? "#C9A84C" : "#D1D5DB"}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-stone-700 mb-2">{review.comment}</p>
                          <div className="flex items-center gap-2">
                            {review.verified && (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-sage-dark bg-sage/10 px-2 py-1 rounded-full">
                                ✓ Verified
                              </span>
                            )}
                            {review.product && (
                              <span className="text-xs text-stone-500">
                                Purchased: {review.product}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
