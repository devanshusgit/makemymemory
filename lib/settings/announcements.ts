/**
 * Messages in the scrolling strip under the header. Editable in
 * Admin -> Settings -> Top Bar; these are used until the admin saves a list
 * (or if the database can't be reached).
 */
export const DEFAULT_ANNOUNCEMENTS = ["Cash on Delivery available", "Extra 5% off on prepaid"];

export const MAX_ANNOUNCEMENTS = 6;
export const MAX_ANNOUNCEMENT_LENGTH = 80;

/** Trimmed, non-empty, de-duplicated, capped list — or null if `raw` isn't a list of strings. */
export function cleanAnnouncements(raw: unknown): string[] | null {
  if (!Array.isArray(raw) || raw.some((m) => typeof m !== "string")) return null;
  const list = Array.from(new Set((raw as string[]).map((m) => m.trim().slice(0, MAX_ANNOUNCEMENT_LENGTH)).filter(Boolean)));
  return list.slice(0, MAX_ANNOUNCEMENTS);
}
