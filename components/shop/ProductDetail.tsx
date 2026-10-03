"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart, ArrowLeft, Plus, Minus, Check, Calendar, Clock, Weight,
  Truck, Lock, MessageCircle, Share2, Facebook, Twitter,
} from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/context/CartContext";
import type { Product, CartSelection } from "@/lib/types";
import ImageCarousel from "./ImageCarousel";
import ProductCard from "./ProductCard";
import HowItWorks from "./HowItWorks";
import { optimizeCloudinaryUrl } from "@/lib/utils/cloudinary";
import {
  type VariantOption,
  DEFAULT_FRAME_TYPES, DEFAULT_FRAME_COLORS, DEFAULT_FINISHES,
  DEFAULT_PAPER_COLORS, DEFAULT_FONTS, DEFAULT_LAYOUTS,
} from "@/lib/data/defaultProductOptions";

const ease = [0.4, 0, 0.2, 1] as const;
const WHATSAPP_NUMBER = "918097486800";

const GOLD = "#C9A84C";
const GOLD_LIGHT = "#E8D5A3";

/**
 * One option tile, used by every picture/colour group so they all look the
 * same: a single border on the tile (never a second one on the picture), a
 * fixed picture shape, and a label area of fixed height so tiles in a row
 * line up even when one name wraps or carries a price.
 */
function OptionTile({
  option, selected, onSelect, shape, fit = "cover", specimen = false,
}: {
  option: VariantOption;
  selected: boolean;
  onSelect: () => void;
  /** Tailwind aspect class for the picture box, e.g. "aspect-square". */
  shape: string;
  fit?: "cover" | "contain";
  /** Font group: with no photo, write the name in the font itself. */
  specimen?: boolean;
}) {
  const swatch = !option.image && option.meta?.startsWith("#") ? option.meta : null;
  return (
    <button type="button" onClick={onSelect} aria-pressed={selected} title={option.label}
      className="w-full h-full flex flex-col items-stretch gap-1.5 p-1.5 rounded-xl transition-colors text-left"
      style={{
        // Same 2px width selected or not, so selecting never resizes the tile.
        border: `2px solid ${selected ? GOLD : GOLD_LIGHT}`,
        backgroundColor: selected ? "rgba(201,168,76,0.08)" : "#FFFFFF",
        color: "#1A1A1A",
      }}>
      <div className={`w-full ${shape} rounded-lg overflow-hidden flex items-center justify-center`}
        style={{
          backgroundColor: option.image ? "#FFFFFF" : (swatch ?? "#FAF8F4"),
          // A faint inner edge so a white or cream swatch still reads as a swatch.
          boxShadow: swatch ? "inset 0 0 0 1px rgba(0,0,0,0.08)" : undefined,
        }}>
        {option.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={optimizeCloudinaryUrl(option.image, 400)} alt="" loading="lazy"
            className={`w-full h-full ${fit === "contain" ? "object-contain" : "object-cover"}`} />
        ) : specimen ? (
          <span className="px-2 text-sm text-center leading-tight"
            style={{ fontFamily: option.meta || undefined }}>{option.label}</span>
        ) : null}
      </div>
      <div className="min-h-[2.6rem] flex flex-col items-center justify-start text-center">
        <span className="text-[11px] sm:text-xs font-medium leading-tight line-clamp-2">{option.label}</span>
        {option.price > 0 && <span className="text-[10px] text-stone-500 mt-0.5">+₹{option.price}</span>}
      </div>
    </button>
  );
}

interface Props {
  slug: string;
  /** Loaded on the server so the page arrives with the product already in the HTML. */
  initialProduct?: Product | null;
  /** Admin-configured option lists keyed by group ("frame-type", "font", …), loaded on the server. */
  initialOptions?: Record<string, VariantOption[]> | null;
  /** "You may also like", loaded on the server with the page. */
  initialRelated?: Product[] | null;
}

export default function ProductDetail({ slug, initialProduct, initialOptions, initialRelated }: Props) {
  const { addItem, openDrawer } = useCart();
  const [product, setProduct] = useState<Product | null>(initialProduct ?? null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>(initialRelated ?? []);
  const [loading, setLoading] = useState(!initialProduct);
  const [qty, setQty]     = useState(1);
  const [added, setAdded] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Variant selections. The page opens on the free choice in each group, so
  // the price shown first is the same base price as on the shop card; picking
  // a paid option then adds to it live. (It used to open on "Frame with Photo",
  // so the product page quoted ₹350 more than the card for the same product.)
  const [frameType, setFrameType] = useState("without-pic");
  const [frameColor, setFrameColor] = useState("gold");
  const [finish, setFinish] = useState("gold");
  const [paperColor, setPaperColor] = useState("white");
  const [font, setFont] = useState("calligraphy");
  const [layout, setLayout] = useState("layered");

  // Name / date / time / weight are collected after the first delivery, not
  // on this page, so cart lines start with no customisation values.
  const customizationValues: Record<string, string> = {};

  // Admin-configurable variant option lists (fall back to defaults if unconfigured).
  // A group with no admin entries keeps its defaults, exactly like the client fetch below.
  const initialGroup = (group: string, fallback: VariantOption[]) =>
    initialOptions?.[group]?.length ? initialOptions[group] : fallback;
  const [frameTypes, setFrameTypes] = useState<VariantOption[]>(() => initialGroup("frame-type", DEFAULT_FRAME_TYPES));
  const [frameColors, setFrameColors] = useState<VariantOption[]>(() => initialGroup("frame-color", DEFAULT_FRAME_COLORS));
  const [finishes, setFinishes] = useState<VariantOption[]>(() => initialGroup("foil-finish", DEFAULT_FINISHES));
  const [paperColors, setPaperColors] = useState<VariantOption[]>(() => initialGroup("paper-color", DEFAULT_PAPER_COLORS));
  const [fonts, setFonts] = useState<VariantOption[]>(() => initialGroup("font", DEFAULT_FONTS));
  const [layouts, setLayouts] = useState<VariantOption[]>(() => initialGroup("layout", DEFAULT_LAYOUTS));

  // Related products sit below the fold, so this no longer blocks the main
  // product. It is also the fallback when the server couldn't load the product.
  useEffect(() => {
    // Both came with the server-rendered page — nothing to fetch. This used to
    // run on every product view and hit the database for up to 50 products.
    if (initialProduct && initialRelated) {
      setLoading(false);
      return;
    }
    fetch("/api/products?limit=50")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        const all: Product[] = d?.products || [];
        if (!initialProduct) {
          const found = all.find((p) => p.slug === slug);
          if (found) setProduct(found);
        }
        setRelatedProducts(all.filter((p) => p.slug !== slug).slice(0, 4));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug, initialProduct, initialRelated]);

  useEffect(() => {
    if (initialOptions) return; // already loaded on the server
    const loadGroup = (group: string, fallback: VariantOption[], setter: (opts: VariantOption[]) => void) => {
      fetch(`/api/product-options?group=${group}`)
        .then((r) => r.ok ? r.json() : null)
        .then((d) => {
          if (d?.options?.length) setter(d.options);
        })
        .catch(() => {
          setter(fallback);
        });
    };
    loadGroup("frame-type", DEFAULT_FRAME_TYPES, setFrameTypes);
    loadGroup("frame-color", DEFAULT_FRAME_COLORS, setFrameColors);
    loadGroup("foil-finish", DEFAULT_FINISHES, setFinishes);
    loadGroup("paper-color", DEFAULT_PAPER_COLORS, setPaperColors);
    loadGroup("font", DEFAULT_FONTS, setFonts);
    loadGroup("layout", DEFAULT_LAYOUTS, setLayouts);
  }, [initialOptions]);

  // Restrict each group to what this specific product has enabled (admin-configured
  // in Admin -> Products -> Edit -> Customization Options). No list at all means
  // every option shows. An EMPTY list means the admin unticked every option, so
  // the group is hidden — it used to be read as "show everything", which put all
  // four frame types (including the +₹3,549 ones) on products meant to have none.
  // lib/checkout/priceCart.ts applies the same rule on the server.
  const filterEnabled = (opts: VariantOption[], enabled?: string[]) =>
    Array.isArray(enabled) ? opts.filter((o) => enabled.includes(o.id)) : opts;

  const visibleFrameTypes = filterEnabled(frameTypes, product?.enabledOptions?.frameType);
  const visibleFrameColors = filterEnabled(frameColors, product?.enabledOptions?.frameColor);
  const visibleFinishes = filterEnabled(finishes, product?.enabledOptions?.foilFinish);
  const visiblePaperColors = filterEnabled(paperColors, product?.enabledOptions?.paperColor);
  const visibleFonts = filterEnabled(fonts, product?.enabledOptions?.font);
  const visibleLayouts = filterEnabled(layouts, product?.enabledOptions?.layout);

  // If the currently-selected variant isn't in this product's enabled set
  // (e.g. its default got disabled for this product), fall back to the first
  // FREE option that's shown (or the first one, if all cost extra), so the
  // price/cart never reference a hidden id and the page opens at base price.
  useEffect(() => {
    if (!product) return;
    const firstFree = (list: VariantOption[]) => (list.find((o) => !(o.price > 0)) ?? list[0]).id;
    if (visibleFrameTypes.length && !visibleFrameTypes.some((o) => o.id === frameType)) setFrameType(firstFree(visibleFrameTypes));
    if (visibleFrameColors.length && !visibleFrameColors.some((o) => o.id === frameColor)) setFrameColor(firstFree(visibleFrameColors));
    if (visibleFinishes.length && !visibleFinishes.some((o) => o.id === finish)) setFinish(firstFree(visibleFinishes));
    if (visiblePaperColors.length && !visiblePaperColors.some((o) => o.id === paperColor)) setPaperColor(firstFree(visiblePaperColors));
    if (visibleFonts.length && !visibleFonts.some((o) => o.id === font)) setFont(firstFree(visibleFonts));
    if (visibleLayouts.length && !visibleLayouts.some((o) => o.id === layout)) setLayout(firstFree(visibleLayouts));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, frameTypes, frameColors, finishes, paperColors, fonts, layouts]);

  // Add-on prices come only from options this product actually shows, so a
  // hidden group (or a default id it doesn't offer) never adds to the price.
  const chosen = (list: VariantOption[], id: string) => list.find((o) => o.id === id);
  const addOnChoices = [
    chosen(visibleFrameTypes, frameType),
    chosen(visibleFrameColors, frameColor),
    chosen(visibleFinishes, finish),
    chosen(visiblePaperColors, paperColor),
    chosen(visibleFonts, font),
    chosen(visibleLayouts, layout),
  ];
  const [frameTypePrice, frameColorPrice, finishPrice, paperColorPrice, fontPrice, layoutPrice] =
    addOnChoices.map((o) => o?.price || 0);
  const totalAddOns = frameTypePrice + frameColorPrice + finishPrice + paperColorPrice + fontPrice + layoutPrice;
  const paidAddOns = addOnChoices.filter((o): o is VariantOption => !!o && (o.price || 0) > 0);
  const basePrice = product?.price || 0;
  const unitPrice = basePrice + totalAddOns;

  // Still fetching — show skeleton
  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#FAF8F4" }}>
        <div className="section-wrap py-10 sm:py-16">
          <div className="h-5 w-24 bg-stone-200 rounded-full animate-pulse mb-8" />
          <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
            {/* Image skeleton */}
            <div className="space-y-3">
              <div className="aspect-square rounded-xl bg-stone-200 animate-pulse" />
              <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-16 h-16 rounded-lg bg-stone-200 animate-pulse" />
                ))}
              </div>
            </div>
            {/* Text skeleton */}
            <div className="space-y-4 pt-2">
              <div className="h-8 w-3/4 bg-stone-200 rounded-full animate-pulse" />
              <div className="h-5 w-1/3 bg-stone-200 rounded-full animate-pulse" />
              <div className="h-4 w-full bg-stone-200 rounded-full animate-pulse" />
              <div className="h-4 w-5/6 bg-stone-200 rounded-full animate-pulse" />
              <div className="h-12 w-full bg-stone-200 rounded-2xl animate-pulse mt-6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="section-wrap py-24 text-center">
        <p className="text-stone-400 text-lg mb-6">Product not found.</p>
        <Link href="/shop" className="btn-outline">Back to Shop</Link>
      </div>
    );
  }

  const handleAdd = () => {
    // Calculate surcharges
    const surcharges = {
      frameType: frameTypePrice,
      frameColor: frameColorPrice,
      finish: finishPrice,
      paperColor: paperColorPrice,
      font: fontPrice,
      layout: layoutPrice,
      total: totalAddOns,
    };

    // What the customer actually chose. Only the surcharge AMOUNTS used to be
    // sent, so an order never recorded which frame colour, foil, paper, font
    // or layout to make. The server re-resolves every id to its real label and
    // price, so nothing here is trusted for money.
    const pick = (
      group: CartSelection["group"], groupLabel: string, visible: VariantOption[], id: string,
    ): CartSelection[] => {
      const o = visible.find((v) => v.id === id);
      return o ? [{ group, groupLabel, id: o.id, label: o.label, price: o.price ?? 0 }] : [];
    };
    const selections: CartSelection[] = [
      ...pick("frameType",  "Frame Type",              visibleFrameTypes,  frameType),
      ...pick("frameColor", "Frame Colour",            visibleFrameColors, frameColor),
      ...pick("finish",     "Metallic Imprint Colour", visibleFinishes,    finish),
      ...pick("paperColor", "Paper Colour",            visiblePaperColors, paperColor),
      ...pick("font",       "Font Type",               visibleFonts,       font),
      ...pick("layout",     "Detailed Layout",         visibleLayouts,     layout),
    ];

    addItem(product, qty, customizationValues, surcharges, selections);
    setAdded(true);
    
    // Show success feedback and optionally open cart drawer
    setTimeout(() => {
      setAdded(false);
      // Uncomment to auto-open cart drawer after adding
      // openDrawer();
    }, 2000);
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
      } catch {
        // user cancelled — no-op
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  };

  const productUrl = typeof window !== "undefined" ? window.location.href : "";
  const whatsappExpertUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi, I have a question about ${product.name}`)}`;

  // Rendered twice — once inside the (sticky) image column so it fills the
  // leftover space next to the taller options column on desktop, once in
  // normal document flow for mobile. Visibility is toggled with CSS
  // (hidden md:block / md:hidden), not conditional rendering.
  const renderHowItWorks = () => (
    <div className="space-y-6">
      {/* How It Works — the supplied poster plus the same four steps as real
          text, so crawlers, screen readers and small screens all get them. */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: "#1A1A1A" }}>
          How It Works
        </h3>
        <HowItWorks compact />
        <div className="mt-3 rounded-2xl py-4 flex flex-col items-center justify-center gap-1"
          style={{ backgroundColor: "rgba(201,168,76,0.08)", border: "1px dashed rgba(201,168,76,0.4)" }}>
          <p className="text-sm font-semibold text-center px-6" style={{ color: "#1A1A1A" }}>
            How it&apos;s made
          </p>
          <p className="text-xs text-center px-6" style={{ color: "#6B6560" }}>
            Video coming soon
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF8F4" }}>
      <div className="section-wrap py-10 sm:py-16">
        <Link href="/shop"
          className="inline-flex items-center gap-1.5 text-sm mb-8 transition-colors"
          style={{ color: "#6B6560" }}>
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>

        {/* grid-cols-1 (not a bare `grid`) and min-w-0 on both columns keep the
            columns at the screen width on phones. Without them the column grew
            to the full width of the thumbnail strip (64px per photo), so a
            product with 20 photos laid out 1,088px wider than the phone and the
            browser zoomed the page out to fit. The entrance animation moves
            vertically for the same reason: sliding in from the side made the
            first paint 16px wider than the screen. */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Image Carousel */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }} className="min-w-0 md:sticky md:top-24">
            {product.images && product.images.length > 0 ? (
              <ImageCarousel images={product.images} productName={product.name} />
            ) : (
              <div
                className="relative aspect-square rounded-2xl overflow-hidden"
                style={{ backgroundColor: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)" }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-stone-200 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <span className="text-stone-400 text-sm font-medium">No Image</span>
                    </div>
                    <p className="text-stone-400 text-sm">No image available</p>
                  </div>
                </div>
              </div>
            )}
            {/* Fills the blank space below the image on desktop, where the
                options column runs taller — hidden on mobile (rendered again
                in normal flow further down for mobile). */}
            <div className="hidden md:block mt-8">
              {renderHowItWorks()}
            </div>
          </motion.div>

          {/* Info & Variants */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease }} className="min-w-0 flex flex-col gap-6">
            {product.badge && (
              <span className="self-start text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ backgroundColor: "#C9A84C", color: "#1A1A1A" }}>
                {product.badge}
              </span>
            )}

            <h1 className="font-serif font-bold"
              style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", lineHeight: 1.2, color: "#1A1A1A" }}>
              {product.name}
            </h1>

            {/* Starting price right under the name. The live price (with add-ons)
                stays in its own block above Add to Cart. */}
            <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1 -mt-2">
              <span className="font-bold text-2xl" style={{ color: "#C9A84C" }}>
                ₹{basePrice.toLocaleString("en-IN")}
              </span>
              {product.originalPrice && product.originalPrice > basePrice && (
                <>
                  <span className="line-through text-base" style={{ color: "#6B6560" }}>
                    ₹{product.originalPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                    {Math.round((1 - basePrice / product.originalPrice) * 100)}% off
                  </span>
                </>
              )}
            </div>

            {/* The only description on the page: right under the name. The
                collapsible "Description" box further down was removed. */}
            {product.description?.trim() && (
              <p className="text-sm sm:text-base leading-relaxed -mt-2" style={{ color: "#6B6560" }}>
                {product.description}
              </p>
            )}

            {/* PRODUCT DETAILS (specs) */}
            {product.details && product.details.length > 0 && (
              <div className="space-y-2 py-6 border-y border-[#E8D5A3]">
                <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: "#1A1A1A" }}>
                  Product Details
                </h3>
                <dl className="space-y-1.5">
                  {[...product.details].sort((a, b) => a.order - b.order).map((d, i) => (
                    <div key={i} className="flex gap-2 text-sm">
                      <dt className="font-semibold shrink-0" style={{ color: "#1A1A1A" }}>{d.label}:</dt>
                      <dd style={{ color: "#6B6560" }}>{d.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* DESCRIPTION ATTACHMENTS */}
            {product.descriptionAttachments && product.descriptionAttachments.length > 0 && (
              <div className="space-y-3 py-6 border-y border-[#E8D5A3]">
                <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: "#1A1A1A" }}>
                  Additional Attachments
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.descriptionAttachments.map((att, i) => (
                    <div key={i} className="relative group">
                      {att.type === "image" ? (
                        <a href={att.url} target="_blank" rel="noopener noreferrer"
                          className="block aspect-video rounded-xl overflow-hidden bg-stone-100 border border-stone-200
                                     hover:border-[#C9A84C] transition-colors active:scale-95 sm:active:scale-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={att.url} alt={att.name || `Detail ${i + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </a>
                      ) : att.type === "video" ? (
                        <div className="aspect-video rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                          <video src={att.url} controls className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <a href={att.url} target="_blank" rel="noopener noreferrer"
                          className="flex flex-col items-center justify-center aspect-video rounded-xl
                                     bg-stone-50 border-2 border-dashed border-stone-300
                                     hover:border-[#C9A84C] hover:bg-stone-100 transition-colors active:scale-95 sm:active:scale-100">
                          <div className="text-2xl sm:text-3xl mb-2">📄</div>
                          <p className="text-xs font-semibold text-stone-600 text-center px-2 line-clamp-2">
                            {att.name || "PDF Document"}
                          </p>
                          <p className="text-[10px] text-stone-400 mt-1">Click to view</p>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VARIANT OPTIONS — every picture group uses the same OptionTile so
                boxes are one size with a single border. A group the admin has
                switched off for this product (empty list) is not shown. */}
            {[visibleFrameTypes, visibleFrameColors, visibleFinishes, visiblePaperColors, visibleFonts, visibleLayouts]
              .some((list) => list.length > 0) && (
            <div className="space-y-6 py-6 border-y border-[#E8D5A3]">
              {/* Frame Type — a list, because the names are long */}
              {visibleFrameTypes.length > 0 && (
                <div>
                  <label className="input-label mb-3">Frame Type</label>
                  <div className="flex flex-col gap-2">
                    {visibleFrameTypes.map((ft) => {
                      const selected = frameType === ft.id;
                      return (
                        <button key={ft.id} type="button" onClick={() => setFrameType(ft.id)} aria-pressed={selected}
                          className="flex items-center gap-3 px-3 py-2.5 min-h-[3.25rem] rounded-xl text-sm font-medium transition-colors text-left"
                          style={{
                            border: `2px solid ${selected ? GOLD : GOLD_LIGHT}`,
                            backgroundColor: selected ? "rgba(201,168,76,0.08)" : "#FFFFFF",
                            color: "#1A1A1A",
                          }}>
                          {ft.image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={optimizeCloudinaryUrl(ft.image, 96)} alt={ft.label} loading="lazy"
                              className="w-11 h-11 rounded-lg object-cover flex-shrink-0" />
                          )}
                          <span className="flex-1 leading-snug">{ft.label}</span>
                          {ft.price > 0 && (
                            <span className="text-xs font-semibold shrink-0" style={{ color: "#8B6F2E" }}>+₹{ft.price}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Frame Colour */}
              {visibleFrameColors.length > 0 && (
                <div>
                  <label className="input-label mb-3">Frame Colour</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {visibleFrameColors.map((o) => (
                      <OptionTile key={o.id} option={o} selected={frameColor === o.id}
                        onSelect={() => setFrameColor(o.id)} shape="aspect-square" />
                    ))}
                  </div>
                </div>
              )}

              {/* Metallic Imprint Colour */}
              {visibleFinishes.length > 0 && (
                <div>
                  <label className="input-label mb-3">Metallic Imprint Colour</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {visibleFinishes.map((o) => (
                      <OptionTile key={o.id} option={o} selected={finish === o.id}
                        onSelect={() => setFinish(o.id)} shape="aspect-square" />
                    ))}
                  </div>
                </div>
              )}

              {/* Paper Colour */}
              {visiblePaperColors.length > 0 && (
                <div>
                  <label className="input-label mb-3">Paper Colour</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {visiblePaperColors.map((o) => (
                      <OptionTile key={o.id} option={o} selected={paperColor === o.id}
                        onSelect={() => setPaperColor(o.id)} shape="aspect-square" />
                    ))}
                  </div>
                </div>
              )}

              {/* Font Type — wide boxes, whole specimen visible */}
              {visibleFonts.length > 0 && (
                <div>
                  <label className="input-label mb-3">Font Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {visibleFonts.map((o) => (
                      <OptionTile key={o.id} option={o} selected={font === o.id}
                        onSelect={() => setFont(o.id)} shape="aspect-[5/2]" fit="contain" specimen />
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Layout — text samples, never cropped */}
              {visibleLayouts.length > 0 && (
                <div>
                  <label className="input-label mb-3">Detailed Layout</label>
                  <div className="grid grid-cols-3 gap-2">
                    {visibleLayouts.map((o) => (
                      <OptionTile key={o.id} option={o} selected={layout === o.id}
                        onSelect={() => setLayout(o.id)} shape="aspect-square" fit="contain" />
                    ))}
                  </div>
                </div>
              )}
            </div>
            )}

            {/* Name / date / time / weight are no longer asked for here: they are
                collected by a separate link after the first shipment is delivered. */}

            {/* PRICE & STOCK */}
            <div className="space-y-2 py-4 border-y border-[#E8D5A3]">
              {/* The price follows the options as they are picked, so the add-on
                  shows up here straight away instead of first appearing at checkout. */}
              <div className="flex items-baseline gap-3">
                <span className="font-bold text-3xl" style={{ color: "#C9A84C" }}>
                  ₹{unitPrice.toLocaleString("en-IN")}
                </span>
                {product.originalPrice && product.originalPrice > basePrice && (
                  <span className="line-through text-lg" style={{ color: "#6B6560" }}>
                    ₹{(product.originalPrice + totalAddOns).toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              {paidAddOns.length > 0 && (
                <p className="text-sm" style={{ color: "#6B6560" }}>
                  ₹{basePrice.toLocaleString("en-IN")}
                  {paidAddOns.map((o, i) => (
                    <span key={i}> + ₹{o.price.toLocaleString("en-IN")} <span className="text-stone-500">({o.label})</span></span>
                  ))}
                </p>
              )}
              <p className="text-sm" style={{ color: "#6B6560" }}>
                One Inkless Wipe Included - Takes upto 5-6 Imprints
              </p>
              <p className="text-sm font-medium" style={{ color: "#6B6560" }}>
                Made to order · Kit dispatched in 4–6 days · Finished piece delivered in 10–12 days
              </p>
              <p className="text-xs" style={{ color: "#6B6560" }}>
                For any additional information, please contact us at support@makemymemory.com
              </p>
            </div>

            {/* QUANTITY */}
            <div>
              <p className="input-label mb-3">Quantity</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1}
                  className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center
                             hover:bg-stone-100 transition-colors disabled:opacity-40">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center font-bold text-ink text-base">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)}
                  className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center
                             hover:bg-stone-100 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col gap-3">
              {!product.inStock ? (
                <div className="w-full py-4 rounded-full flex items-center justify-center
                               text-sm font-semibold tracking-wide
                               bg-red-100 text-red-700">
                  Out of Stock
                </div>
              ) : (
                <>
                  {/* Add to Cart Button */}
                  <motion.button 
                    whileTap={{ scale: 0.97 }} 
                    onClick={handleAdd} 
                    className="w-full py-4 rounded-full flex items-center justify-center
                               text-sm font-semibold tracking-wide transition-all duration-300
                               hover:bg-[#C9A84C] hover:text-[#1A1A1A]"
                    style={{ 
                      backgroundColor: added ? "#16A34A" : "#1A1A1A", 
                      color: "#ffffff" 
                    }}
                  >
                    {added ? "Added to Cart ✓" : "Add to Cart"}
                  </motion.button>

                  {/* Buy it now Button */}
                  <Link 
                    href="/checkout" 
                    onClick={() => handleAdd()}
                    className="w-full py-4 rounded-full flex items-center justify-center gap-2
                               text-sm font-semibold tracking-wide transition-all duration-300
                               hover:bg-[#C9A84C] hover:text-[#1A1A1A]"
                    style={{ backgroundColor: "#1A1A1A", color: "#ffffff" }}
                  >
                    Buy it now
                  </Link>

                  {/* Talk With Expert — routes to WhatsApp */}
                  <a
                    href={whatsappExpertUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 rounded-full flex items-center justify-center gap-2
                               text-sm font-semibold tracking-wide transition-all duration-300
                               hover:opacity-90"
                    style={{ backgroundColor: "#C19A6B", color: "#ffffff" }}
                  >
                    <MessageCircle className="w-4 h-4" />
                    Talk With Expert
                  </a>
                </>
              )}
            </div>

            {/* How It Works — mobile only (rendered inside the
                image column for desktop, above) */}
            <div className="md:hidden">
              {renderHowItWorks()}
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: <Truck className="w-5 h-5" />, text: "Free delivery all across India" },
                { icon: <Lock className="w-5 h-5" />, text: "Secure payment" },
              ].map((b) => (
                <div key={b.text} className="bg-stone-50 rounded-2xl p-3 text-center border border-stone-100">
                  <div className="flex items-center justify-center mb-1 text-stone-600">{b.icon}</div>
                  <p className="text-xs sm:text-[11px] text-stone-500 leading-tight">{b.text}</p>
                </div>
              ))}
            </div>

            {/* Share */}
            <div className="flex items-center gap-3 pt-2">
              <span className="text-sm font-medium" style={{ color: "#6B6560" }}>Share:</span>
              <button onClick={handleShare} aria-label="Share this product"
                className="w-9 h-9 rounded-full flex items-center justify-center border border-stone-200 hover:border-[#C9A84C] transition-colors">
                <Share2 className="w-4 h-4" style={{ color: "#6B6560" }} />
              </button>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`}
                target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook"
                className="w-9 h-9 rounded-full flex items-center justify-center border border-stone-200 hover:border-[#C9A84C] transition-colors">
                <Facebook className="w-4 h-4" style={{ color: "#6B6560" }} />
              </a>
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(product.name)}`}
                target="_blank" rel="noopener noreferrer" aria-label="Share on X"
                className="w-9 h-9 rounded-full flex items-center justify-center border border-stone-200 hover:border-[#C9A84C] transition-colors">
                <Twitter className="w-4 h-4" style={{ color: "#6B6560" }} />
              </a>
              {shareCopied && <span className="text-xs" style={{ color: "#C9A84C" }}>Link copied!</span>}
            </div>
          </motion.div>
        </div>

        {/* Recommended products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 sm:mt-20">
            <h2 className="font-serif font-bold text-xl sm:text-2xl mb-6" style={{ color: "#1A1A1A" }}>
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
