"use client";

import { useState } from "react";
import { MapPin, ExternalLink } from "lucide-react";

/*
  Google Maps embed.
  Replace the `src` URL with your real embed URL:
  1. Go to maps.google.com
  2. Search your location
  3. Click Share → Embed a map → Copy HTML
  4. Paste the src value below

  The placeholder shown when JS is disabled or the iframe fails to load
  is a styled div with your address.
*/
const MAP_EMBED_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3768.5555555555556!2d72.8333!3d19.2333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMira%20Road%2C%20Thane%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1713000000000!5m2!1sen!2sin";

const MAPS_LINK =
  "https://maps.google.com/?q=Mira+Road,+Thane,+Maharashtra";

export default function ContactMap() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-soft border border-stone-100">
      {/* Map header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-sage/10 flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 text-sage-dark" strokeWidth={2} />
          </div>
          <div>
            <p className="text-xs font-semibold text-ink">Our Studio</p>
            <p className="text-[11px] text-stone-400">Mira Road, Thane, Maharashtra</p>
          </div>
        </div>
        <a
          href={MAPS_LINK}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open in Google Maps"
          className="flex items-center gap-1 text-[11px] font-semibold text-stone-400
                     hover:text-sage-dark transition-colors"
        >
          Open
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Map iframe */}
      <div className="relative aspect-[4/3] bg-stone-100">
        {/* Skeleton shimmer while loading */}
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-stone-300">
              <MapPin className="w-8 h-8" strokeWidth={1} />
              <p className="text-xs">Loading map…</p>
            </div>
          </div>
        )}

        <iframe
          src={MAP_EMBED_SRC}
          width="100%"
          height="100%"
          style={{ border: 0, position: "absolute", inset: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Make My Memory studio location"
          onLoad={() => setLoaded(true)}
          className={`transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      </div>
    </div>
  );
}
