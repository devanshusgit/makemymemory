"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ease = [0.4, 0, 0.2, 1] as const;

/*
  Video carousel items.
  Add real video/image files to public/videos/ and public/images/ to enable media.
  Until then, gradient placeholders are shown.
*/
const carouselItems = [
  {
    id: 1,
    src: "",
    poster: "",
    caption: "Wedding anniversary photo book",
    customer: "Priya & Arjun",
  },
  {
    id: 2,
    src: "",
    poster: "",
    caption: "Baby's first year canvas",
    customer: "The Mehta Family",
  },
  {
    id: 3,
    src: "",
    poster: "",
    caption: "Grandparents' 50th anniversary",
    customer: "Ananya Patel",
  },
  {
    id: 4,
    src: "",
    poster: "",
    caption: "Best friends' travel memories",
    customer: "Rahul & Karan",
  },
];

/* Gradient placeholder colours per slide */
const placeholderGradients = [
  "linear-gradient(135deg, #EDE5DC 0%, #C4A882 100%)",
  "linear-gradient(135deg, #D4E8D4 0%, #8FBC8F 100%)",
  "linear-gradient(135deg, #E8DDD4 0%, #B8956E 100%)",
  "linear-gradient(135deg, #DDE8DD 0%, #6A9E6A 100%)",
];

/* Stat counter — animates from 0 to target */
function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

export default function SocialProofSection() {
  const [active, setActive] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Auto-advance every 5 s */
  const startInterval = () => {
    intervalRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % carouselItems.length);
    }, 5000);
  };

  useEffect(() => {
    startInterval();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Play active video, pause others */
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === active) {
        v.currentTime = 0;
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, [active]);

  const goTo = (i: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setActive(i);
    startInterval();
  };

  return (
    <section className="bg-hero py-20 sm:py-28 overflow-hidden">
      <div className="section-wrap">

        {/* ── Big stat ── */}
        <div className="text-center mb-16 sm:mb-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="font-serif font-bold text-white leading-none mb-4"
            style={{ fontSize: "clamp(3.5rem, 10vw, 8rem)", letterSpacing: "-0.03em" }}
          >
            <CountUp target={10000} suffix="+" />
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15, ease }}
            className="text-white/60 text-base sm:text-lg tracking-wide"
          >
            Memories Created &amp; Counting
          </motion.p>

          {/* Supporting stats row */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25, ease }}
            className="flex flex-wrap justify-center gap-8 sm:gap-16 mt-10"
          >
            {[
              { value: "4.9", label: "Average Rating" },
              { value: "2–3", label: "Day Delivery" },
              { value: "100%", label: "Personalised" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-serif font-bold text-white text-2xl sm:text-3xl mb-1">
                  {stat.value}
                </p>
                <p className="text-white/40 text-xs tracking-widest uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Video carousel ── */}
        <div className="relative">
          {/* Main display */}
          <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-4xl overflow-hidden" style={{ backgroundColor: "#111" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.6, ease }}
                className="absolute inset-0"
              >
                {/* Video element — only rendered when src exists */}
                {carouselItems[active].src && (
                  <video
                    ref={(el) => { videoRefs.current[active] = el; }}
                    src={carouselItems[active].src}
                    poster={carouselItems[active].poster || undefined}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                    aria-label={carouselItems[active].caption}
                  />
                )}

                {/* Gradient placeholder */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full flex items-center justify-center"
                  style={{ background: placeholderGradients[active] }}
                >
                  <span className="text-7xl sm:text-9xl opacity-30">📸</span>
                </div>

                {/* Caption overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(44,37,32,0.75) 0%, transparent 50%)",
                  }}
                />
                <div className="absolute bottom-5 left-6 sm:bottom-8 sm:left-10">
                  <p className="text-white font-semibold text-sm sm:text-base mb-0.5">
                    {carouselItems[active].caption}
                  </p>
                  <p className="text-stone-300 text-xs sm:text-sm">
                    — {carouselItems[active].customer}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Progress bar */}
            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-white/10">
              <motion.div
                key={active}
                className="h-full bg-sage"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 5, ease: "linear" }}
              />
            </div>
          </div>

          {/* Thumbnail strip */}
          <div className="flex gap-3 mt-4 justify-center">
            {carouselItems.map((item, i) => (
              <button
                key={item.id}
                onClick={() => goTo(i)}
                aria-label={`View: ${item.caption}`}
                className={`relative rounded-2xl overflow-hidden transition-all duration-300
                            flex-1 max-w-[120px] aspect-video
                            ${i === active
                              ? "ring-2 ring-sage ring-offset-2 ring-offset-stone-900 opacity-100"
                              : "opacity-40 hover:opacity-70"
                            }`}
              >
                <div
                  className="w-full h-full"
                  style={{ background: placeholderGradients[i] }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-2xl opacity-30">
                  📸
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
