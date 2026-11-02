"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { Check, Copy, Share2 } from "lucide-react";
import { HandImprint, FootImprint } from "./ImprintArt";
import { previewFontVariables } from "@/lib/preview/fonts";
import {
  type PreviewDesign,
  BABY_AGE_OPTIONS,
  NAME_MAX,
  ageLabel,
  designQuery,
  foilStyle,
  fontStyle,
  formatPrintedDate,
  formatPrintedTime,
  frameStyle,
  shareMessage,
} from "@/lib/preview/design";

export interface PreviewOption {
  id: string;
  label: string;
  image?: string;
}

interface Props {
  initial: PreviewDesign;
  fonts: PreviewOption[];
  frames: PreviewOption[];
  foils: PreviewOption[];
  /** True when the page was opened from a link someone shared. */
  shared: boolean;
  baseUrl: string;
}

function safeTrack(name: string, props: Record<string, string>) {
  try { track(name, props); } catch { /* analytics must never break the page */ }
}

/* ── The framed preview itself ────────────────────────────────────────── */

export function FramedPreview({ design }: { design: PreviewDesign }) {
  const frame = frameStyle(design.frame);
  const foil = foilStyle(design.foil);
  const font = fontStyle(design.font);
  const foilText: React.CSSProperties = {
    backgroundImage: `linear-gradient(135deg, ${foil.stops.join(", ")})`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  };
  const details = [formatPrintedDate(design.date), formatPrintedTime(design.time), design.weight]
    .filter(Boolean)
    .join("  ·  ");

  return (
    <figure
      className="mx-auto w-full max-w-[380px]"
      aria-label={`Preview of ${design.name || "your"} keepsake frame`}
    >
      {/* Frame moulding, then an optional gold fillet, then the paper mount. */}
      <div className="rounded-[6px] p-[18px] shadow-[0_18px_40px_-12px_rgba(0,0,0,0.45)]" style={{ background: frame.background }}>
        <div className="rounded-[2px] p-[3px]" style={{ background: frame.fillet ?? "transparent" }}>
          <div
            className="relative aspect-[4/5] flex flex-col items-center justify-center gap-4 px-6 py-8
                       shadow-[inset_0_2px_10px_rgba(0,0,0,0.18)]"
            style={{ backgroundColor: "#FBF9F4" }}
          >
            <div className="flex items-end justify-center gap-6 w-full">
              <HandImprint stops={foil.stops} className="w-[38%] h-auto" />
              <FootImprint stops={foil.stops} className="w-[30%] h-auto" />
            </div>

            <div className="text-center w-full">
              <p
                className="leading-tight break-words"
                style={{
                  ...foilText,
                  fontFamily: font.family,
                  fontStyle: font.italic ? "italic" : "normal",
                  fontSize: `calc(clamp(22px, 7.5vw, 34px) * ${font.scale})`,
                }}
              >
                {design.name || "Baby's Name"}
              </p>
              {design.age && (
                <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.25em]" style={foilText}>
                  {ageLabel(design.age)}
                </p>
              )}
              {details && (
                <p className="mt-1 text-[11px] tracking-wide" style={foilText}>
                  {details}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-[11px] text-stone-400">
        Illustration — your frame is made from your baby&apos;s own prints.
      </figcaption>
    </figure>
  );
}

/* ── Option tiles ─────────────────────────────────────────────────────── */

function Tiles({
  label, options, value, onChange, swatch, specimen,
}: {
  label: string;
  options: PreviewOption[];
  value: string;
  onChange: (id: string) => void;
  /** Background drawn when an option has no photo. */
  swatch: (id: string) => string;
  /** Text style for an "Aa" sample on top of the swatch — used for fonts. */
  specimen?: (id: string) => React.CSSProperties;
}) {
  return (
    <fieldset>
      <legend className="input-label mb-2">{label}</legend>
      <div className="grid grid-cols-4 gap-2">
        {options.map((o) => {
          const selected = o.id === value;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(o.id)}
              aria-pressed={selected}
              className={`flex flex-col items-center gap-1 rounded-xl border p-1.5 text-[10px] leading-tight
                          transition-colors ${selected ? "border-[#C9A84C] bg-[#C9A84C]/10" : "border-stone-200 hover:border-stone-300"}`}
            >
              {o.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={o.image} alt="" loading="lazy" className="w-full aspect-square rounded-lg object-cover bg-white" />
              ) : (
                <span
                  className="w-full aspect-square rounded-lg flex items-center justify-center text-2xl text-ink"
                  style={{ background: swatch(o.id), ...(specimen ? specimen(o.id) : {}) }}
                >
                  {specimen ? "Aa" : null}
                </span>
              )}
              <span className={`text-center ${selected ? "font-semibold text-ink" : "text-stone-500"}`}>{o.label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/* ── Page body ────────────────────────────────────────────────────────── */

export default function FramePreviewClient({ initial, fonts, frames, foils, shared, baseUrl }: Props) {
  const [design, setDesign] = useState<PreviewDesign>(initial);
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  const set = <K extends keyof PreviewDesign>(key: K, value: PreviewDesign[K]) =>
    setDesign((d) => ({ ...d, [key]: value }));

  // s=1 marks a link that was sent to someone. The address bar carries the
  // design too (below), so without it a customer refreshing their own work
  // would be greeted as if a friend had sent it.
  const shareUrl = useMemo(() => `${baseUrl}/preview?${designQuery(design)}&s=1`, [baseUrl, design]);

  // Keep the address bar on the current design, so a refresh or a copied URL
  // brings back exactly what is on screen. replaceState, so editing does not
  // fill the back button with one entry per keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      window.history.replaceState(null, "", `/preview?${designQuery(design)}`);
    }, 300);
    return () => clearTimeout(t);
  }, [design]);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const message = shareMessage(design, shareUrl);

  const shareWhatsApp = () => {
    safeTrack("preview_share", { channel: "whatsapp" });
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  const shareNative = async () => {
    safeTrack("preview_share", { channel: "native" });
    try {
      // The URL is already inside the text; passing it again makes some apps
      // paste it twice.
      await navigator.share({ title: "My keepsake frame", text: message });
    } catch { /* the user closed the sheet */ }
  };

  const copyLink = async () => {
    safeTrack("preview_share", { channel: "copy" });
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={previewFontVariables}>
      {shared && (
        <div className="mb-8 rounded-2xl border border-[#E8D5A3] bg-[#C9A84C]/10 px-5 py-4 text-center">
          <p className="text-sm text-ink">
            <strong>{design.name ? `${design.name}'s frame` : "A friend's frame"}</strong> — designed on Make My Memory.
          </p>
          <p className="mt-1 text-xs text-stone-500">Change anything below to design one for your little one.</p>
        </div>
      )}

      <div className="grid gap-10 md:grid-cols-2 md:gap-14 items-start">
        <div className="md:sticky md:top-28">
          <FramedPreview design={design} />
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="pv-name" className="input-label mb-2">Baby&apos;s name</label>
            <input
              id="pv-name"
              value={design.name}
              maxLength={NAME_MAX}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Aarav"
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
            />
          </div>

          <div>
            <label htmlFor="pv-age" className="input-label mb-2">Age</label>
            <select
              id="pv-age"
              value={design.age}
              onChange={(e) => set("age", e.target.value)}
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
            >
              <option value="">Don&apos;t show</option>
              {BABY_AGE_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="pv-date" className="input-label mb-2">Date</label>
              <input id="pv-date" type="date" value={design.date} onChange={(e) => set("date", e.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40" />
            </div>
            <div>
              <label htmlFor="pv-time" className="input-label mb-2">Time</label>
              <input id="pv-time" type="time" value={design.time} onChange={(e) => set("time", e.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40" />
            </div>
            <div>
              <label htmlFor="pv-weight" className="input-label mb-2">Weight</label>
              <input id="pv-weight" value={design.weight} maxLength={10} placeholder="3.2 kg"
                onChange={(e) => set("weight", e.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40" />
            </div>
          </div>

          <Tiles label="Font" options={fonts} value={design.font} onChange={(v) => set("font", v)}
            swatch={() => "#FBF9F4"}
            specimen={(id) => ({ fontFamily: fontStyle(id).family, fontStyle: fontStyle(id).italic ? "italic" : "normal" })} />
          <p className="-mt-3 text-[11px] text-stone-400">
            The preview uses a close match; the sample photo shows the font as it is printed.
          </p>

          <Tiles label="Frame colour" options={frames} value={design.frame} onChange={(v) => set("frame", v)}
            swatch={(id) => frameStyle(id).background} />

          <Tiles label="Imprint colour" options={foils} value={design.foil} onChange={(v) => set("foil", v)}
            swatch={(id) => `linear-gradient(135deg, ${foilStyle(id).stops.join(", ")})`} />

          {/* Share */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3">
            <p className="text-sm font-semibold text-ink">Share your design</p>
            <button
              type="button"
              onClick={shareWhatsApp}
              className="w-full rounded-full py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#25D366" }}
            >
              Send on WhatsApp
            </button>
            <div className="flex gap-2">
              <button type="button" onClick={copyLink}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-stone-200 py-3 text-sm font-medium text-ink hover:bg-stone-50">
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                {copied ? "Link copied" : "Copy link"}
              </button>
              {canNativeShare && (
                <button type="button" onClick={shareNative}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-stone-200 py-3 text-sm font-medium text-ink hover:bg-stone-50">
                  <Share2 className="w-4 h-4" /> More
                </button>
              )}
            </div>
          </div>

          <Link
            href="/shop"
            onClick={() => safeTrack("preview_cta", { to: "shop" })}
            className="block w-full rounded-full py-4 text-center text-sm font-semibold tracking-wide text-white transition-colors hover:bg-[#C9A84C] hover:text-[#1A1A1A]"
            style={{ backgroundColor: "#1A1A1A" }}
          >
            Order your frame
          </Link>
        </div>
      </div>
    </div>
  );
}
