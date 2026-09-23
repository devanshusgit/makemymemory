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
