// Fallback variant options shown on the storefront (and available to toggle
// per-product in Admin) whenever Admin -> Settings -> Product Options has no
// entries for a group yet. Kept in one place so the storefront defaults and
// the admin per-product picker's fallback never drift apart.
export interface VariantOption {
  id: string;
  label: string;
  price: number;
  meta?: string;  // hex swatch (colour groups) or CSS font-family (font group)
  image?: string; // real photo of how the option looks (frame-type / frame-color)
}

export const DEFAULT_FRAME_TYPES: VariantOption[] = [
  { id: "with-pic", label: "Frame with Picture", price: 300 },
  { id: "without-pic", label: "Frame without Picture", price: 0 },
];

export const DEFAULT_FRAME_COLORS: VariantOption[] = [
  { id: "gold",  label: "Gold",  price: 0, meta: "#C9A84C" },
  { id: "black", label: "Black", price: 0, meta: "#1A1A1A" },
  { id: "white", label: "White", price: 0, meta: "#F5F0EB" },
];

export const DEFAULT_FINISHES: VariantOption[] = [
  { id: "gold",   label: "Gold",   price: 0   },
  { id: "silver", label: "Silver", price: 200 },
];

export const DEFAULT_PAPER_COLORS: VariantOption[] = [
  { id: "white", label: "White", price: 0, meta: "#FFFFFF" },
  { id: "black", label: "Black", price: 0, meta: "#1A1A1A" },
  { id: "blue",  label: "Blue",  price: 0, meta: "#1B2A4A" },
];

export const DEFAULT_FONTS: VariantOption[] = [
  { id: "calligraphy", label: "Calligraphy", price: 0, meta: "cursive" },
  { id: "modern",      label: "Modern",      price: 0, meta: "sans-serif" },
  { id: "classic",     label: "Classic",     price: 0, meta: "serif" },
  { id: "playful",     label: "Playful",     price: 0, meta: "monospace" },
];

export const DEFAULT_LAYOUTS: VariantOption[] = [
  { id: "layered", label: "Layered", price: 0 },
  { id: "simple",  label: "Simple",  price: 0 },
];
