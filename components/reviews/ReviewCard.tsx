"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ThumbsUp, Play, Pause } from "lucide-react";
import type { Review } from "@/lib/data/reviews";

interface Props {
  review: Review;
  index: number;
}

const ease = [0.4, 0, 0.2, 1] as const;

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "text-base" : "text-sm";
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={`${cls} ${s <= rating ? "text-sage" : "text-stone-200"}`}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function ReviewCard({ review, index }: Props) {
  const [helpful, setHelpful] = useState(review.helpful);
  const [voted, setVoted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isLong = review.text.length > 200;
  const displayText =
    isLong && !expanded ? review.text.slice(0, 200).trimEnd() + "…" : review.text;

  const toggleVideo = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
    setPlaying(!playing);
  };

  const handleHelpful = () => {
    if (voted) return;
    setHelpful((v) => v + 1);
    setVoted(true);
  };

  /* Format date */
  const dateStr = new Date(review.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: (index % 3) * 0.08, duration: 0.5, ease }}
      className="bg-white rounded-3xl overflow-hidden shadow-soft border border-stone-100
                 flex flex-col hover:shadow-card transition-shadow duration-300"
    >
      {/* ── Media (optional) ── */}
      {review.mediaType && (
        <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 shrink-0">
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
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              {/* Gradient placeholder */}
              <div
                aria-hidden
                className="absolute inset-0"
                style={{ background: review.mediaGradient }}
              />
              <div aria-hidden className="absolute inset-0 flex items-center justify-center text-5xl opacity-20">
                📸
              </div>
              {/* Play/pause */}
              <button
                onClick={toggleVideo}
                aria-label={playing ? "Pause video" : "Play video"}
                className="absolute inset-0 flex items-center justify-center group"
              >
                <div className={`w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm
                                 flex items-center justify-center shadow-card
                                 transition-all duration-200
                                 ${playing ? "opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100" : "opacity-100 scale-100"}`}>
                  {playing
                    ? <Pause className="w-4 h-4 text-ink" />
                    : <Play  className="w-4 h-4 text-ink ml-0.5" />
                  }
                </div>
              </button>
            </>
          ) : (
            <>
              {/* Image placeholder — swap with <Image> when real assets exist */}
              <div
                aria-hidden
                className="absolute inset-0 w-full h-full"
                style={{ background: review.mediaGradient }}
              />
              <div aria-hidden className="absolute inset-0 flex items-center justify-center text-5xl opacity-20">
                📸
              </div>
            </>
          )}

          {/* Product tag */}
          <span className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur-sm
                           text-ink text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-soft">
            {review.product}
          </span>
        </div>
      )}

      {/* ── Content ── */}
      <div className="p-5 sm:p-6 flex flex-col flex-1 gap-4">

        {/* Stars + date */}
        <div className="flex items-center justify-between gap-2">
          <Stars rating={review.rating} size="md" />
          <time className="text-[11px] text-stone-400" dateTime={review.date}>
            {dateStr}
          </time>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-ink text-sm sm:text-base leading-snug">
          {review.title}
        </h3>

        {/* Body */}
        <div className="flex-1">
          <p className="text-stone-500 text-sm leading-relaxed">
            {displayText}
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-1.5 text-xs font-semibold text-sage-dark hover:text-ink
                         transition-colors underline underline-offset-2"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
          {/* Author */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center
                         text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: review.avatarColor }}
            >
              {review.initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-ink truncate">{review.name}</p>
              <p className="text-[11px] text-stone-400 truncate">{review.location}</p>
            </div>
          </div>

          {/* Verified + helpful */}
          <div className="flex items-center gap-3 shrink-0">
            {review.verified && (
              <span className="flex items-center gap-1 text-[11px] font-semibold
                               text-sage-dark bg-sage/10 px-2 py-1 rounded-full">
                <ShieldCheck className="w-3 h-3" strokeWidth={2.5} />
                Verified
              </span>
            )}
            <button
              onClick={handleHelpful}
              disabled={voted}
              aria-label="Mark as helpful"
              className={`flex items-center gap-1.5 text-[11px] font-medium
                          transition-colors duration-200
                          ${voted
                            ? "text-sage-dark cursor-default"
                            : "text-stone-400 hover:text-ink"
                          }`}
            >
              <ThumbsUp className="w-3 h-3" />
              {helpful}
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
