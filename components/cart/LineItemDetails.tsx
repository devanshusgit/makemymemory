/**
 * The customisation breakdown for one line — in the cart, at checkout, on the
 * customer's account page and on the admin order:
 *
 *   Frame Type       Frame with Photo    +₹350
 *   Frame Colour     Black
 *   Name             Aarav
 *
 * The product page shows only the base price; this is where the customer sees
 * what each choice added. Works for cart items and saved order items alike.
 */

interface Selection {
  groupLabel?: string;
  group?: string;
  label?: string;
  price?: number;
}

function humanKey(k: string) {
  return k.charAt(0).toUpperCase() + k.slice(1).replace(/[-_]+/g, " ");
}

export function customizationEntries(value: unknown): [string, string][] {
  if (value == null) return [];
  if (typeof value === "string") return value.trim() ? [["Note", value.trim()]] : [];
  if (typeof value !== "object") return [["Note", String(value)]];
  return Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== "" && v != null)
    .map(([k, v]) => [humanKey(k), String(v)]);
}

export default function LineItemDetails({
  selections,
  customization,
  size = "xs",
}: {
  selections?: Selection[] | null;
  customization?: unknown;
  size?: "xs" | "sm";
}) {
  const picks = (selections ?? []).filter((s) => s && s.label);
  const engraving = customizationEntries(customization);
  if (!picks.length && !engraving.length) return null;

  const text = size === "sm" ? "text-sm" : "text-[11px]";

  return (
    <div className={`mt-1.5 space-y-0.5 ${text}`}>
      {picks.map((s, i) => (
        <div key={`${s.group ?? s.groupLabel}-${i}`} className="flex items-baseline justify-between gap-2">
          <span className="text-stone-500 min-w-0">
            <span className="text-stone-400">{s.groupLabel ?? s.group}:</span> {s.label}
          </span>
          {(s.price ?? 0) > 0 && (
            <span className="shrink-0 font-medium text-stone-600">+₹{(s.price ?? 0).toLocaleString("en-IN")}</span>
          )}
        </div>
      ))}
      {engraving.length > 0 && (
        <div className={`${picks.length ? "pt-1 mt-1 border-t border-stone-100" : ""} space-y-0.5`}>
          {engraving.map(([k, v]) => (
            <div key={k} className="text-stone-500 break-words">
              <span className="text-stone-400">{k}:</span> {v}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
