"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const ease = [0.4, 0, 0.2, 1] as const;

/*
  Replace these with real product photos.
  Drop images into public/images/collage-1.jpg … collage-5.jpg
  Until then, gold gradient placeholders are shown.
*/
const collageItems = [
  {
    src:      "/images/collage-1.jpg",
    alt:      "Gold foil handprint frame",
    gradient: "linear-gradient(135deg, #C9A84C22 0%, #E8D5A3 100%)",
    tall:     true,   // taller card
  },
  {
    src:      "/images/collage-2.jpg",
    alt:      "Baby footprint keepsake",
    gradient: "linear-gradient(135deg, #1A1A1A 0%, #2d2520 100%)",
    tall:     false,
  },
  {
    src:      "/images/collage-3.jpg",
    alt:      "Personalised name frame",
    gradient: "linear-gradient(135deg, #2d2520 0%, #C9A84C33 100%)",
    tall:     false,
  },
  {
    src:      "/images/collage-4.jpg",
    alt:      "Gold foil wedding print",
    gradient: "linear-gradient(135deg, #1A1A1A 0%, #3d3228 100%)",
    tall:     true,
  },
  {
    src:      "/images/collage-5.jpg",
    alt:      "Baby with keepsake frame",
    gradient: "linear-gradient(135deg, #E8D5A3 0%, #C9A84C44 100%)",
    tall:     false,
  },
];

/* Animated counter */
function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const steps = 60;
        const inc = target / steps;
        let cur = 0;
        const t = setInterval(() => {
          cur += inc;
          if (cur >= target) { setCount(target); clearInterval(t); }
          else setCount(Math.floor(cur));
        }, 1800 / steps);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString("en-IN")}{suffix}</span>;
}

function CollageCard({ item, index }: { item: typeof collageItems[0]; index: number }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.08, duration: 0.55, ease }}
      className="relative overflow-hidden rounded-2xl flex-1 min-w-0 group"
      style={{
        minHeight: item.tall ? "320px" : "260px",
        border: "1px solid rgba(201,168,76,0.15)",
      }}
    >
      {/* Gradient placeholder — always behind */}
      <div className="absolute inset-0 w-full h-full" style={{ background: item.gradient }} />

      {/* Placeholder icon */}
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </div>
      )}

      {/* Real image */}
      {!error && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.src}
          alt={item.alt}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500
                     group-hover:scale-105"
          style={{ opacity: loaded ? 1 : 0 }}
        />
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "linear-gradient(to top, rgba(26,26,26,0.5) 0%, transparent 60%)" }} />
    </motion.div>
  );
}

export default function SocialProofSection() {
  return (
    <section className="py-16 sm:py-24" style={{ backgroundColor: "#FAF8F4" }}>
      <div className="section-wrap">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="text-center mb-10 sm:mb-14"
        >
          <h2 className="font-serif font-bold" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "#1A1A1A" }}>
            Over <span style={{ color: "#C9A84C" }}><CountUp target={10000} suffix="+" /></span> Moments Preserved
          </h2>
          <p className="mt-3 text-sm" style={{ color: "#6B6560" }}>
            Real keepsakes, real families, real memories — crafted with love.
          </p>
        </motion.div>

        {/* Collage grid — 5 columns desktop, 2 mobile */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch">
          {collageItems.map((item, i) => (
            <CollageCard key={i} item={item} index={i} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3, ease }}
          className="text-center mt-10"
        >
          <a href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold
                       transition-all duration-300 hover:bg-[#C9A84C] hover:text-[#1A1A1A]"
            style={{ border: "1.5px solid #C9A84C", color: "#C9A84C" }}>
            Create Yours →
          </a>
        </motion.div>

      </div>
    </section>
  );
}
