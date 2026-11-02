import { BABY_AGE_OPTIONS, findBabyAge } from "@/lib/data/babyAge";

/**
 * Everything the frame preview needs to turn option ids into something it can
 * draw, plus the URL format a shared design travels in.
 *
 * Option ids are the ones admin manages (fonts, frame colours, foil finishes).
 * An id this file does not know still works — it falls back to a sensible
 * look — so adding a new option in admin never breaks the page; it just
 * previews generically until a style is added here.
 */

export interface FontStyle { family: string; italic?: boolean; scale: number }
export interface FrameStyle { background: string; fillet?: string }
export interface FoilStyle { stops: string[] }

const SERIF = "var(--font-cormorant), Georgia, serif";

export const FONT_STYLES: Record<string, FontStyle> = {
  calligraphy: { family: "var(--pv-great-vibes), cursive", scale: 1.25 },
  modern:      { family: "var(--pv-yellowtail), cursive", scale: 1.1 },
  classic:     { family: SERIF, scale: 1 },
  playful:     { family: "var(--pv-courier-prime), monospace", scale: 0.8 },
  cursive:     { family: "var(--pv-dancing-script), cursive", scale: 1.1 },
  elegant:     { family: "var(--pv-parisienne), cursive", scale: 1.2 },
  vintage:     { family: "var(--pv-playfair), Georgia, serif", italic: true, scale: 0.95 },
  minimal:     { family: "var(--font-dm-sans), Arial, sans-serif", scale: 0.8 },
};
const FONT_FALLBACK: FontStyle = { family: SERIF, scale: 1 };

const GOLD = "linear-gradient(135deg,#8a6a1f 0%,#f3d27a 28%,#c9a84c 52%,#f6e3a1 74%,#9c7a2a 100%)";
const SILVER = "linear-gradient(135deg,#707070 0%,#f4f4f4 30%,#b5b5b5 55%,#ffffff 75%,#8a8a8a 100%)";

export const FRAME_STYLES: Record<string, FrameStyle> = {
  "studio-black":        { background: "linear-gradient(135deg,#0d0d0d,#2b2b2b 50%,#111)" },
  "walnut-brown":        { background: "linear-gradient(135deg,#3b2414,#6b4426 45%,#4a2d18 70%,#7a5030)" },
  "vintage-black-gold":  { background: "linear-gradient(135deg,#0d0d0d,#262626 50%,#0f0f0f)", fillet: GOLD },
  "premium-matte-white": { background: "linear-gradient(135deg,#e9e4da,#f8f5ef 50%,#e3ddd1)" },
  "brush-champagne":     { background: "linear-gradient(135deg,#a88c5c,#e1cfa6 45%,#bfa577 70%,#e9dbb9)" },
  "luxury-silver":       { background: SILVER },
  "luxury-gold":         { background: GOLD },
  // The catalogue's built-in defaults, used before admin configures any.
  gold:  { background: GOLD },
  black: { background: "linear-gradient(135deg,#0d0d0d,#2b2b2b 50%,#111)" },
  white: { background: "linear-gradient(135deg,#e9e4da,#f8f5ef 50%,#e3ddd1)" },
};
const FRAME_FALLBACK: FrameStyle = FRAME_STYLES["studio-black"];

export const FOIL_STYLES: Record<string, FoilStyle> = {
  gold:             { stops: ["#8a6a1f", "#f3d27a", "#c9a84c", "#f6e3a1", "#9c7a2a"] },
  silver:           { stops: ["#6f6f6f", "#f2f2f2", "#b3b3b3", "#ffffff", "#858585"] },
  "rainbow-silver": { stops: ["#9a9a9a", "#bdf1ff", "#f4d0ff", "#fff5c2", "#c4c4c4"] },
};
const FOIL_FALLBACK: FoilStyle = FOIL_STYLES.gold;

export const fontStyle = (id: string) => FONT_STYLES[id] ?? FONT_FALLBACK;
export const frameStyle = (id: string) => FRAME_STYLES[id] ?? FRAME_FALLBACK;
export const foilStyle = (id: string) => FOIL_STYLES[id] ?? FOIL_FALLBACK;

/* ── The design, and the URL it is shared in ──────────────────────────── */

export interface PreviewDesign {
  name: string;
  age: string;     // a babyAge id, or "" for none
  date: string;    // YYYY-MM-DD, or ""
  time: string;    // HH:MM (24h), or ""
  weight: string;  // free text such as "3.2 kg", or ""
  font: string;
  frame: string;
  foil: string;
}

export const NAME_MAX = 24;
const WEIGHT_MAX = 10;

type Param = string | string[] | undefined;
const one = (v: Param) => (Array.isArray(v) ? v[0] : v) ?? "";

/**
 * Reads a design out of URL parameters. Everything is checked, because the
 * link is pasted into chats and anyone can edit it: unknown ids fall back to
 * the defaults, and free text is trimmed and length-limited (React escapes
 * it when rendering, so length is the only concern).
 */
export function parseDesign(
  params: Record<string, Param>,
  known: { fonts: string[]; frames: string[]; foils: string[] },
): PreviewDesign {
  const pick = (v: string, allowed: string[]) => (allowed.includes(v) ? v : allowed[0] ?? "");
  const date = one(params.d);
  const time = one(params.t);
  return {
    name: one(params.n).replace(/\s+/g, " ").trim().slice(0, NAME_MAX),
    age: findBabyAge(one(params.a)) ? one(params.a) : "",
    date: /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date)) ? date : "",
    time: /^([01]\d|2[0-3]):[0-5]\d$/.test(time) ? time : "",
    weight: one(params.w).replace(/\s+/g, " ").trim().slice(0, WEIGHT_MAX),
    font: pick(one(params.f), known.fonts),
    frame: pick(one(params.c), known.frames),
    foil: pick(one(params.i), known.foils),
  };
}

/** Short keys keep the link compact enough to sit comfortably in a chat. */
export function designQuery(d: PreviewDesign): string {
  const q = new URLSearchParams();
  if (d.name) q.set("n", d.name);
  if (d.age) q.set("a", d.age);
  if (d.date) q.set("d", d.date);
  if (d.time) q.set("t", d.time);
  if (d.weight) q.set("w", d.weight);
  q.set("f", d.font);
  q.set("c", d.frame);
  q.set("i", d.foil);
  return q.toString();
}

export const ageLabel = (id: string) => findBabyAge(id)?.label ?? "";
export { BABY_AGE_OPTIONS };

/** "2026-03-14" → "14 March 2026", the way it is printed on the frame. */
export function formatPrintedDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return m >= 1 && m <= 12 ? `${d} ${months[m - 1]} ${y}` : "";
}

/** "14:05" → "2:05 PM". */
export function formatPrintedTime(hhmm: string): string {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${suffix}`;
}

/**
 * The message that goes into the friend's chat along with the link. The
 * offers named here are the ones the site's own banner advertises; keep them
 * in step with it.
 */
export function shareMessage(d: PreviewDesign, url: string): string {
  const who = d.name ? `${d.name}'s` : "a";
  return [
    `✨ I just designed ${who} keepsake frame — gold foil prints of those tiny hands & feet 👣`,
    "",
    `See it here: ${url}`,
    "",
    "Make one for your little one at Make My Memory 🎁",
    "Free delivery across India · Cash on delivery available · Extra 5% off on prepaid orders",
  ].join("\n");
}
