/**
 * Cloudinary URLs are stored raw in the DB with no transformation
 * parameters, so full-resolution originals ship to every visitor. This
 * inserts f_auto (best format for the browser), q_auto (auto quality),
 * a max width, and dpr_auto (device pixel ratio) right after "/upload/".
 */
export function optimizeCloudinaryUrl(url: string | undefined | null, width = 600): string {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width},dpr_auto/`);
}

/**
 * next/image refuses to run SVGs through its optimizer unless the whole app
 * opts into `dangerouslyAllowSVG`, which would also let any remote SVG through.
 * The product placeholder is a local file we ship ourselves, so serve just
 * those unoptimized instead of loosening the config for everything.
 */
export function isUnoptimizableImage(src: string | undefined | null): boolean {
  return !!src && src.startsWith("/") && src.endsWith(".svg");
}

/**
 * The square cover for a product card.
 *
 * Cards are a fixed 4:3 / 1:1 box with object-cover, so a portrait photo used
 * to be centre-cropped by the browser and lose its top and bottom — one
 * product's cover is 600x800 and was losing the frame's edges. Asking
 * Cloudinary for the crop instead means g_auto picks the subject, and every
 * card gets the same shape whatever aspect ratio was uploaded.
 *
 * Non-Cloudinary sources (the local placeholder) pass through untouched.
 */
export function cloudinaryCoverUrl(url: string | undefined | null, width = 600): string {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,c_fill,g_auto,ar_1:1,w_${width},dpr_auto/`);
}
