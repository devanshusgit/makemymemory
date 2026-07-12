"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const ease = [0.4, 0, 0.2, 1] as const;

// Color palette for review avatars
const AVATAR_COLORS = ["#C4A882", "#8FBC8F", "#B8956E", "#6A9E6A", "#A8917C"];

function getInitials(name: string): string {
  return name.split(" ").map(n => n[0]).join("").toUpperCase();
}

function getAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const sizeClass = size === "lg" ? "text-xl" : "text-sm";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`${sizeClass} ${star <= rating ? "text-gold" : "text-stone-200"}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function ReviewCard({ review, index }: { review: any; index: number }) {
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleVideo = () => {
    if (!videoRef.current) return;
    if (videoPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
    setVideoPlaying(!videoPlaying);
  };

  const initials = getInitials(review.name || review.customerName || "User");
  const avatarColor = getAvatarColor(index);

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-soft border border-stone-100
                    flex flex-col h-full">

      {/* Media area */}
      {review.images && review.images.length > 0 && (
        <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
          <img
            src={review.images[0]}
            alt={review.name || review.customerName}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-5 sm:p-6 flex flex-col flex-1">
        <StarRating rating={review.rating} />

        <p className="text-stone-600 text-sm leading-relaxed mt-3 mb-5 flex-1">
          &ldquo;{review.content || review.text || ""}&rdquo;
        </p>

        <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center
                       text-white text-xs font-bold shrink-0"
            style={{ backgroundColor: avatarColor }}
          >
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">{review.name || review.customerName}</p>
            <p className="text-xs text-stone-400">{review.location || "India"}</p>
          </div>
          {review.verified && (
            <span className="ml-auto text-[10px] text-stone-300 font-medium tracking-wide uppercase">
              Verified
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReviewsSection() {
  const swiperRef = useRef<SwiperType | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallRating, setOverallRating] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch("/api/reviews?approved=true&limit=10");
        const data = await res.json();
        const approvedReviews = data.reviews || [];
        setReviews(approvedReviews);

        // Calculate overall rating
        if (approvedReviews.length > 0) {
          const avgRating = approvedReviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / approvedReviews.length;
          setOverallRating(Math.round(avgRating * 10) / 10);
        }
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) {
    return (
      <section className="bg-canvas py-20 sm:py-28">
        <div className="section-wrap">
          <div className="h-64 bg-stone-100 rounded-2xl animate-pulse" />
        </div>
      </section>
    );
  }

  // If no reviews, show "coming soon"
  if (reviews.length === 0) {
    return (
      <section className="bg-canvas py-20 sm:py-28">
        <div className="section-wrap text-center">
          <h2 className="section-heading mb-4">Reviews Coming Soon</h2>
          <p className="text-stone-500">Be the first to share your experience with us!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden bg-section-reviews">
      {/* ── Decorative CSS Background ── */}
      <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none">
        {/* Decorative star rating icons — scattered */}
        <svg className="absolute top-10 right-[10%] w-5 h-5 opacity-10" viewBox="0 0 24 24" fill="#C9A84C">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <svg className="absolute bottom-24 left-[7%] w-4 h-4 opacity-15" viewBox="0 0 24 24" fill="#C9A84C">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <svg className="absolute top-1/2 left-[3%] w-3 h-3 opacity-10" viewBox="0 0 24 24" fill="#C9A84C">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <svg className="absolute top-16 left-[20%] w-3 h-3 opacity-10" viewBox="0 0 24 24" fill="#C9A84C">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      </div>

      <div className="relative z-10 section-wrap">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease }}
              className="section-heading mb-4"
            >
              Loved by thousands
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.16, ease }}
              className="flex items-center gap-3"
            >
              <StarRating rating={Math.round(overallRating)} size="lg" />
              <span className="font-bold text-ink text-lg">{overallRating}</span>
              <span className="text-stone-400 text-sm">
                from {reviews.length.toLocaleString("en-IN")} reviews
              </span>
            </motion.div>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => swiperRef.current?.slidePrev()}
              aria-label="Previous review"
              className="w-12 h-12 sm:w-10 sm:h-10 rounded-full border border-stone-200 flex items-center justify-center
                         text-ink/50 hover:text-ink hover:border-ink hover:bg-stone-50
                         transition-all duration-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => swiperRef.current?.slideNext()}
              aria-label="Next review"
              className="w-12 h-12 sm:w-10 sm:h-10 rounded-full border border-stone-200 flex items-center justify-center
                         text-ink/50 hover:text-ink hover:border-ink hover:bg-stone-50
                         transition-all duration-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          onSwiper={(swiper) => { swiperRef.current = swiper; }}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
          }}
          autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
          pagination={{ clickable: true }}
          loop
          className="pb-12"
        >
          {reviews.map((review, i) => (
            <SwiperSlide key={review._id} className="h-auto">
              <ReviewCard review={review} index={i} />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="text-center mt-2">
          <a
            href="/reviews"
            className="text-sm font-semibold text-ink/50 hover:text-ink
                       transition-colors underline underline-offset-4"
          >
            Read all {reviews.length.toLocaleString("en-IN")} reviews →
          </a>
        </div>

      </div>
    </section>
  );
}
