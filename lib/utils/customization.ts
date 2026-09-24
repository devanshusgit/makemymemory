/**
 * An order line's customization as readable text: "Name: Aarav · Date: 2026-01-01".
 *
 * The cart stores it as an object keyed by field id; orders from before that
 * hold a plain string. Rendering the object directly crashes React ("Objects
 * are not valid as a React child") and prints "[object Object]" in emails.
 */
export function formatCustomization(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value !== "object") return String(value);
  return Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== "" && v != null)
    .map(([k, v]) => `${k.charAt(0).toUpperCase()}${k.slice(1)}: ${String(v)}`)
    .join(" · ");
}
