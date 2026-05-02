"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const ease = [0.4, 0, 0.2, 1] as const;

const reviews = [
  {
    id: 1,
    name: "Priya Sharma",
    location: "Mumbai",
    rating: 5,
    text: "The photo book I ordered for my parents' anniversary was absolutely stunning. Every page felt like a work of art. The quality exceeded every expectation.",
    product: "Custom Photo Book",
    initials: "PS",
    color: "#C4A882",
    hasMedia: true,
    mediaType: "image" as const,
    mediaSrc: "",
    mediaGradient: "linear-gradient(135deg, #EDE5DC 0%, #C4A882 100%)",
  },
  {
    id: 2,
    name: "Rahul Verma",
    location: "Delhi",
    rating: 5,
    text: "Ordered a custom mug for my best friend's birthday. She absolutely loved it! Fast delivery, beautiful packaging, and the print quality is incredible.",
    product: "Personalised Mug",
    initials: "RV",
    color: "#8FBC8F",
    hasMedia: true,
    mediaType: "video" as const,
    mediaSrc: "",
    mediaGradient: "linear-gradient(135deg, #D4E8D4 0%, #8FBC8F 100%)",
  },
  {
    id: 3,
    name: "Ananya Patel",
    location: "Bangalore",
    rating: 5,
    text: "Make My Memory made our wedding memories come alive. The canvas prints are gorgeous and the team was incredibly helpful throughout the whole process.",
    product: "Canvas Print",
    initials: "AP",
    color: "#B8956E",
    hasMedia: true,
    mediaType: "image" as const,
    mediaSrc: "",
    mediaGradient: "linear-gradient(135deg, #E8DDD4 0%, #B8956E 100%)",
  },
  {
    id: 4,
    name: "Karan Mehta",
    location: "Pune",
    rating: 5,
    text: "Incredible quality and attention to detail. The memory cushion I ordered for my mom made her cry happy tears. Will definitely order again for every occasion!",
    product: "Memory Cushion",
    initials: "KM",
    color: "#6A9E6A",
    hasMedia: false,
    mediaGradient: "linear-gradient(135deg, #DDE8DD 0%, #6A9E6A 100%)",
  },
  {
    id: 5,
    name: "Sneha Iyer",
    location: "Chennai",
    rating: 5,
    text: "The gift set was perfect for my parents' 30th anniversary. Everything was beautifully packaged and the personalisation was exactly what I wanted.",
    product: "Memory Gift Set",
    initials: "SI",
    color: "#A8917C",
    hasMedia: true,
    mediaType: "image" as const,
    mediaSrc: "",
    mediaGradient: "linear-gradient(135deg, #EDE5DC 0%, #A8917C 100%)",
  },
];

/* Overall rating summary — starts at 0, updates from DB */
const OVERALL_RATING = 0;
const TOTAL_REVIEWS = 0;

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const sizeClass = size === "lg" ? "text-xl" : "text-sm";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`${sizeClass} ${star <= rating ? "text-sage" : "text-stone-200"}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: (typeof reviews)[number] }) {
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

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-soft border border-stone-100
                    flex flex-col h-full">

      {/* Media area */}
      {review.hasMedia && (
        <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
          {review.mediaType === "video" ? (
            <>
              {review.mediaSrc && (
                <video
                  ref={videoRef}
                  src={review.mediaSrc}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              {/* Gradient placeholder */}
              <div
                className="absolute inset-0"
                style={{ background: review.mediaGradient }}
                aria-hidden="true"
              />
              <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-20"
                   aria-hidden="true">
                📸
              </div>
              {/* Play button */}
              <button
                onClick={toggleVideo}
                aria-label={videoPlaying ? "Pause video" : "Play video"}
                className="absolute inset-0 flex items-center justify-center group"
              >
                <div className={`w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm
                                 flex items-center justify-center shadow-card
                                 transition-all duration-200
                                 ${videoPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}>
                  <span className="text-ink text-lg ml-0.5">
                    {videoPlaying ? "⏸" : "▶"}
                  </span>
                </div>
              </button>
            </>
          ) : (
            <>
              {/* Image placeholder */}
              <div
                className="absolute inset-0 w-full h-full"
                style={{ background: review.mediaGradient }}
                aria-hidden="true"
              />
              <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-20"
                   aria-hidden="true">
                📸
              </div>
            </>
          )}

          {/* Product tag */}
          <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm
                           text-ink text-[11px] font-semibold px-2.5 py-1 rounded-full">
            {review.product}
          </span>
        </div>
      )}

      {/* Review content */}
      <div className="p-5 sm:p-6 flex flex-col flex-1">
        <StarRating rating={review.rating} />

        <p className="text-stone-600 text-sm leading-relaxed mt-3 mb-5 flex-1">
          &ldquo;{review.text}&rdquo;
        </p>

        {/* Author */}
        <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center
                       text-white text-xs font-bold shrink-0"
            style={{ backgroundColor: review.color }}
          >
            {review.initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">{review.name}</p>
            <p className="text-xs text-stone-400">{review.location}</p>
          </div>
          <span className="ml-auto text-[10px] text-stone-300 font-medium tracking-wide uppercase">
            Verified
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ReviewsSection() {
  const swiperRef = useRef<SwiperType | null>(null);

  return (
    <section className="bg-canvas py-20 sm:py-28 overflow-hidden">
      <div className="section-wrap">

        {/* ── Header ── */}
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

            {/* Aggregate rating */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.16, ease }}
              className="flex items-center gap-3"
            >
              <StarRating rating={5} size="lg" />
              <span className="font-bold text-ink text-lg">{OVERALL_RATING}</span>
              <span className="text-stone-400 text-sm">
                from {TOTAL_REVIEWS.toLocaleString("en-IN")} reviews
              </span>
            </motion.div>
          </div>

          {/* Nav arrows */}
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => swiperRef.current?.slidePrev()}
              aria-label="Previous review"
              className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center
                         text-ink/50 hover:text-ink hover:border-ink hover:bg-stone-50
                         transition-all duration-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => swiperRef.current?.slideNext()}
              aria-label="Next review"
              className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center
                         text-ink/50 hover:text-ink hover:border-ink hover:bg-stone-50
                         transition-all duration-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Carousel ── */}
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          onSwiper={(swiper) => { swiperRef.current = swiper; }}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640:  { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
          }}
          autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
          pagination={{ clickable: true }}
          loop
          className="pb-12"
        >
          {reviews.map((review) => (
            <SwiperSlide key={review.id} className="h-auto">
              <ReviewCard review={review} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* View all link */}
        <div className="text-center mt-2">
          <a
            href="/reviews"
            className="text-sm font-semibold text-ink/50 hover:text-ink
                       transition-colors underline underline-offset-4"
          >
            Read all {TOTAL_REVIEWS.toLocaleString("en-IN")} reviews →
          </a>
        </div>

      </div>
    </section>
  );
}
